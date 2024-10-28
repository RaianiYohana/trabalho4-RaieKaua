import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, FlatList } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
    const [latitude, setLatitude] = useState(0.0);
    const [longitude, setLongitude] = useState(0.0);
    const [pais, setPais] = useState("");
    const [tela, setTela] = useState("inicial");
    const [paisSelecionado, setPaisSelecionado] = useState(null);
    const [perguntas, setPerguntas] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [resultado, setResultado] = useState(null);

    const perguntasPorPais = {
        "Tuvalu": [
            { pergunta: "Qual é a capital de Tuvalu?", opcoes: ["Funafuti", "Vaitupu", "Nanumanga"], resposta: "Funafuti" },
            { pergunta: "Qual é a população estimada de Tuvalu?", opcoes: ["Aproximadamente 11.000", "Aproximadamente 25.000", "Aproximadamente 50.000"], resposta: "Aproximadamente 11.000" },
            { pergunta: "Em que oceano Tuvalu está localizado?", opcoes: ["Oceano Índico", "Oceano Atlântico", "Oceano Pacífico"], resposta: "Oceano Pacífico" }
        ],
        "Comores": [
            { pergunta: "Qual é a capital das Comores?", opcoes: ["Moroni", "Mutsamudu", "Fomboni"], resposta: "Moroni" },
            { pergunta: "Qual é a principal língua falada nas Comores?", opcoes: ["Comoriano", "Francês", "Árabe"], resposta: "Comoriano, Francês, Árabe" },
            { pergunta: "Onde as Comores estão localizadas?", opcoes: ["Oceano Pacífico", "Oceano Atlântico", "Oceano Índico"], resposta: "Oceano Índico" }
        ],
        "São Tomé e Príncipe": [
            { pergunta: "Qual é a capital de São Tomé e Príncipe?", opcoes: ["São Tomé", "Príncipe", "Porto Alegre"], resposta: "São Tomé" },
            { pergunta: "Qual é a língua oficial de São Tomé e Príncipe?", opcoes: ["Inglês", "Português", "Francês"], resposta: "Português" },
            { pergunta: "São Tomé e Príncipe fica em que região do mundo?", opcoes: ["Ásia", "África", "América do Sul"], resposta: "África" }
        ]
    };

    useEffect(() => {
        const buscarPais = async (latitude, longitude) => {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            try {
                const resposta = await axios.get(url, {
                    headers: { 'User-Agent': 'SeuApp/1.0' }
                });
                const endereco = resposta.data.address;
                if (endereco && endereco.country) {
                    return endereco.country;
                }
            } catch (erro) {
                console.error(erro);
            }
            return null;
        };

        const buscarCoordenadas = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            let localizacao = await Location.getCurrentPositionAsync({});
            const lat = localizacao.coords.latitude;
            const long = localizacao.coords.longitude;

            setLatitude(lat);
            setLongitude(long);
            setPais(await buscarPais(lat, long));
        };

        buscarCoordenadas();
    }, []);

    const iniciarQuiz = (pais) => {
        setPaisSelecionado(pais);
        setPerguntas(perguntasPorPais[pais]);
        setRespostas({});
        setTela("quiz");
    };

    const enviarRespostas = () => {
        let acertos = 0;
        perguntas.forEach((p, indice) => {
            if (respostas[indice] === p.resposta) {
                acertos++;
            }
        });
        setResultado(acertos);
        setTela("resultado");
    };

    if (tela === "inicial") {
        return (
            <View style={styles.container}>
                <Text style={styles.paragraph} >Geolocalização</Text>
                <Text style={styles.t2} >{pais ? `Você está no país: ${pais}` : "Carregando..."}</Text>
                <View style={styles.botao}>
                    <Button color={'#205e53'} title="Iniciar Quiz" onPress={() => setTela("selecionarPais")} />
                </View>
            </View>
        );
    }

    if (tela === "selecionarPais") {
        return (
            <View style={styles.container}>
                <Text style={styles.t3}  >Escolha seu primeiro Quiz</Text>
                {Object.keys(perguntasPorPais).map(pais => (
                    <View style={styles.botao}>
                        <Button color={'#205e53'} key={pais} title={pais} onPress={() => iniciarQuiz(pais)} />
                    </View>
                ))}
                <Button color={'#205e53'} title="Voltar ao Início" onPress={() => setTela("inicial")} />
            </View>
        );
    }

    if (tela === "quiz") {
        return (
            <View style={styles.container}>
                <FlatList
                    data={perguntas}
                    renderItem={({ item, index }) => (
                        <View>
                            <Text style={styles.t4}  >{item.pergunta}</Text>
                            {item.opcoes.map((opcao, i) => (
                                <View style={styles.resposta}>

                                    <Button
                                        key={i}
                                        title={opcao}
                                        onPress={() => setRespostas({ ...respostas, [index]: opcao })}
                                        color={respostas[index] === opcao ? '#205e53' : '#54988c'}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                <View style={styles.botao}>
                    <Button color={'#205e53'} title="Enviar Respostas" onPress={enviarRespostas} />
                </View>
                <Button color={'#205e53'} title="Trocar Quiz" onPress={() => setTela("selecionarPais")} />

            </View>
        );
    }

    if (tela === "resultado") {
        return (
            <View style={styles.container}>
                <Text style={styles.t4}>Você acertou {resultado} de {perguntas.length} perguntas!</Text>
                <View style={styles.botao}>
                    <Button color={'#205e53'} title="Voltar ao Início" onPress={() => setTela("inicial")} />
                </View>
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
        padding: 5,
        backgroundColor: '#d6f7f2'
    },
    paragraph: {
        fontSize: 35,
        textAlign: 'center',
        color: '#205e53'

    },
    t2: {
        fontSize: 20,
        color: '#205e53',

    },
    t3: {
        fontSize: 30,
        color: '#205e53',

    },
    t4: {
        marginTop: 65,
        fontSize: 20,
        textAlign: 'center',
        color: '#205e53',

    },
    resposta: {
        marginTop: 10,
        textAlign: 'center',

    },
    botao: {
        marginTop: 10,
        width: 300,
        height: 50,

    }



});
