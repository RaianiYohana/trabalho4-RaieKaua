import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, FlatList } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
    const [pais, setPais] = useState("");
    const [tela, setTela] = useState("inicial");
    const [perguntas, setPerguntas] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [resultado, setResultado] = useState(null);
    const [perguntasErradas, setPerguntasErradas] = useState([]);

    const perguntasPorPais = {
        "Tuvalu": [
            { pergunta: "Qual é a capital de Tuvalu?", opcoes: ["Funafuti", "Vaitupu", "Nanumanga"], resposta: "Funafuti" },
            { pergunta: "Qual é a população estimada de Tuvalu?", opcoes: ["Aproximadamente 11.000", "Aproximadamente 25.000", "Aproximadamente 50.000"], resposta: "Aproximadamente 11.000" },
            { pergunta: "Em que oceano Tuvalu está localizado?", opcoes: ["Oceano Índico", "Oceano Atlântico", "Oceano Pacífico"], resposta: "Oceano Pacífico" }
        ],
        "Comores": [
            { pergunta: "Qual é a capital das Comores?", opcoes: ["Moroni", "Mutsamudu", "Fomboni"], resposta: "Moroni" },
            { pergunta: "As Comores são conhecidas pela exportação de qual especiaria?", opcoes: ["Canela", "Cravo-da-índia", "Baunilha"], resposta: "Baunilha" },
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
                    let paisObtido = endereco.country;
                    if (paisObtido.includes("Comores") || paisObtido.includes("Komori") || paisObtido.includes("جزر القمر")) {
                        paisObtido = "Comores";
                    }
                    return paisObtido;
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

            const paisAtual = await buscarPais(lat, long);
            setPais(paisAtual);
            if (perguntasPorPais[paisAtual]) {
                setPerguntas(perguntasPorPais[paisAtual]);
            }
        };

        buscarCoordenadas();
    }, []);

    const enviarRespostas = () => {
        let acertos = 0;
        let erradas = [];

        perguntas.forEach((p, indice) => {
            if (respostas[indice] === p.resposta) {
                acertos++;
            } else {
                erradas.push(p);
            }
        });

        setResultado(acertos);
        setPerguntasErradas(erradas);
        setTela("resultado");
    };

    if (tela === "inicial") {
        return (
            <View style={styles.container}>
                <Text style={styles.paragraph}>Geolocalização</Text>
                <Text style={styles.t2}>{pais ? `Você está no país: ${pais}` : "Carregando..."}</Text>
                <View style={styles.botao}>
                    <Button
                        color={'#205e53'}
                        title="Iniciar Quiz"
                        onPress={() => {
                            if (perguntas.length > 0) {
                                setTela("quiz");
                            } else {
                                alert("Desculpe, o quiz não está disponível para seu país.");
                            }
                        }}
                    />
                </View>
            </View>
        );
    }

    if (tela === "quiz") {
        return (
            <View style={styles.container}>
                <FlatList
                    data={perguntas}
                    renderItem={({ item, index }) => (
                        <View key={index}>
                            <Text style={styles.t4}>{item.pergunta}</Text>
                            {item.opcoes.map((opcao, i) => (
                                <View style={styles.resposta} key={i}>
                                    <Button
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
            </View>
        );
    }

    if (tela === "resultado") {
        return (
            <View style={styles.container}>
                {perguntasErradas.length > 0 && (
                    <View style={styles.container}>
                        <Text style={styles.t6}>Perguntas incorretas</Text>
                        <FlatList
                            data={perguntasErradas}
                            renderItem={({ item }) => (
                                <View style={styles.container}>
                                    <Text style={styles.t4}>{item.pergunta}</Text>
                                    <Text style={styles.t2}>Resposta Certa: {item.resposta}</Text>
                                </View>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                )}
                <Text style={styles.t5}>Você acertou {resultado} de {perguntas.length} perguntas</Text>

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
        padding: 5,
        fontSize: 19,
        color: '#0000 ',
    },
    t4: {
        marginTop: 50,
        fontSize: 22,
        textAlign: 'center',
        color: '#205e53',
    },
    t5: {
        fontSize: 22,
        textAlign: 'center',
        color: '#205e53',
        marginBottom: 30,
    },
    t6: {
        marginTop: '50%',
        fontSize: 26,
        textAlign: 'center',
        color: '#205e53',
        fontWeight: '700',
    },
    resposta: {
        marginTop: 20,
        textAlign: 'center',
    },
    botao: {
        marginTop: 5,
        width: 300,
        marginBottom: 20,
        height: 50,
    }
});
