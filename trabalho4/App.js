import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, FlatList } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
    const [latitude, setLatitude] = useState(0.0);
    const [longitude, setLongitude] = useState(0.0);
    const [pais, setPais] = useState("");
    const [screen, setScreen] = useState("home");
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const countriesWithQuestions = {
        "Brazil": [
            { question: "Qual é a capital do Brasil?", options: ["São Paulo", "Rio de Janeiro", "Brasília"], answer: "Brasília" },
            { question: "Qual é o idioma oficial do Brasil?", options: ["Espanhol", "Português", "Inglês"], answer: "Português" },
            { question: "Qual é o maior rio do Brasil?", options: ["Rio Amazonas", "Rio São Francisco", "Rio Paraná"], answer: "Rio Amazonas" }
        ],
        "USA": [
            { question: "Qual é a capital dos EUA?", options: ["Nova York", "Washington, D.C.", "Los Angeles"], answer: "Washington, D.C." },
            { question: "Qual é a moeda dos EUA?", options: ["Euro", "Dólar", "Libra"], answer: "Dólar" },
            { question: "Qual é o monumento famoso em Nova York?", options: ["Estátua da Liberdade", "Big Ben", "Torre Eiffel"], answer: "Estátua da Liberdade" }
        ],
        "Japan": [
            { question: "Qual é a capital do Japão?", options: ["Osaka", "Tóquio", "Kyoto"], answer: "Tóquio" },
            { question: "Qual é a montanha mais alta do Japão?", options: ["Monte Fuji", "Monte Everest", "Monte Kilimanjaro"], answer: "Monte Fuji" },
            { question: "Qual é a moeda do Japão?", options: ["Yuan", "Iene", "Dólar"], answer: "Iene" }
        ]
    };

    useEffect(() => {
        const buscarPais = async (latitude, longitude) => {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            try {
                const response = await axios.get(url, {
                    headers: { 'User-Agent': 'YourAppName/1.0' }
                });
                const address = response.data.address;
                if (address && address.country) {
                    return address.country;
                }
            } catch (error) {
                console.error(error);
            }
            return null;
        };

        const buscarCoordendadas = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const lat = location.coords.latitude;
            const long = location.coords.longitude;

            setLatitude(lat);
            setLongitude(long);
            setPais(await buscarPais(lat, long));
        };

        buscarCoordendadas();
    }, []);

    const startQuiz = (country) => {
        setSelectedCountry(country);
        setQuestions(countriesWithQuestions[country]);
        setAnswers({});
        setScreen("quiz");
    };

    const submitAnswers = () => {
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correctAnswers++;
            }
        });
        setResult(correctAnswers);
        setScreen("result");
    };

    if (screen === "home") {
        return (
            <View style={styles.container}>
                <Text>Bem-vindo!</Text>
                <Text>{pais ? `Você está no país: ${pais}` : "Carregando..."}</Text>
                <Button title="Iniciar Quiz" onPress={() => setScreen("selectCountry")} />
            </View>
        );
    }

    if (screen === "selectCountry") {
        return (
            <View style={styles.container}>
                <Text>Selecione seu país para começar o quiz:</Text>
                {Object.keys(countriesWithQuestions).map(country => (
                    <Button key={country} title={country} onPress={() => startQuiz(country)} />
                ))}
            </View>
        );
    }

    if (screen === "quiz") {
        return (
            <View style={styles.container}>
                <FlatList
                    data={questions}
                    renderItem={({ item, index }) => (
                        <View>
                            <Text>{item.question}</Text>
                            {item.options.map((option, i) => (
                                <Button
                                    key={i}
                                    title={option}
                                    onPress={() => setAnswers({ ...answers, [index]: option })}
                                    color={answers[index] === option ? 'green' : 'gray'}
                                />
                            ))}
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                <Button title="Enviar Respostas" onPress={submitAnswers} />
            </View>
        );
    }

    if (screen === "result") {
        return (
            <View style={styles.container}>
                <Text>Você acertou {result} de {questions.length} perguntas!</Text>
                <Button title="Voltar ao Início" onPress={() => setScreen("home")} />
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    }
});
