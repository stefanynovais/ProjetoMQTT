
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, Text } from 'react-native';

import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';

// Cria uma instância do serviço MQTT
const mqtt = new MQTTService();

export default function App() {

    // Estados principais da aplicação
    const [isConnected, setIsConnected] = useState(false);
    const [showError, setShowError] = useState(false);

    // Estados dos sensores e dispositivos
    const [isLightOn, setIsLightOn] = useState(false);
    const [temp, setTemp] = useState(0);
    const [hum, setHum] = useState(0);

    // Apenas alertas exibidos na interface (SEM HISTÓRICO)
    const [alert, setAlert] = useState("");

    // Configurações do broker MQTT
    const mqttConfig = {
        host: process.env.EXPO_PUBLIC_MQTT_HOST,
        port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
        path: "/mqtt",
        user: process.env.EXPO_PUBLIC_MQTT_USER,
        pass: process.env.EXPO_PUBLIC_MQTT_PASS,
        clientId: 'RN_App_' + Math.random(),
    };

    // Carrega os últimos dados salvos localmente
    const loadSavedData = async () => {
        try {
            const savedTemp = await AsyncStorage.getItem('temp');
            const savedHum = await AsyncStorage.getItem('umid');
            const savedLight = await AsyncStorage.getItem('luz');

            if (savedTemp) {
                setTemp(parseFloat(savedTemp));
                console.log('📀 Temp carregada:', savedTemp);
            }
            if (savedHum) {
                setHum(parseFloat(savedHum));
                console.log('📀 Umidade carregada:', savedHum);
            }
            if (savedLight) {
                setIsLightOn(savedLight === "1");
                console.log('💡 Estado da luz carregado:', savedLight === "1" ? "Ligada" : "Desligada");
            }
        } catch (error) {
            console.log('❌ Erro ao carregar dados:', error);
        }
    };

    // Salva os dados individualmente no AsyncStorage
    const saveData = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value.toString());
            console.log(`💾 Salvo no AsyncStorage - ${key}: ${value}`);
        } catch (error) {
            console.log(`❌ Erro ao salvar ${key}:`, error);
        }
    };

    // Executa ao iniciar o aplicativo
    useEffect(() => {
        const init = async () => {
            await loadSavedData();
            startConnection();
        };
        init();
    }, []);

    // Inicia a conexão com o broker MQTT
    const startConnection = () => {
        setShowError(false);

        mqtt.connect(
            mqttConfig,

            // Recebe mensagens publicadas nos tópicos
            (topic, message) => {
                const value = parseFloat(message);
                console.log(`📨 Mensagem recebida - ${topic}: ${message}`);

                // Atualiza a temperatura recebida
                if (topic === 'casa/temp') {
                    setTemp(value);
                    saveData('temp', value);

                    // Exibe alerta caso a temperatura esteja alta
                    if (value > 30) {
                        setAlert("🔥 Temperatura alta!");
                        console.log(`⚠️ ALERTA: Temperatura alta! ${value}°C`);
                    } else if (value < 18) {
                        setAlert("❄️ Temperatura baixa!");
                        console.log(`⚠️ ALERTA: Temperatura baixa! ${value}°C`);
                    } else {
                        setAlert("");
                    }
                }

                // Atualiza a umidade recebida
                if (topic === 'casa/umid') {
                    setHum(value);
                    saveData('umid', value);

                    // Exibe alerta caso a umidade esteja baixa ou alta
                    if (value < 40) {
                        setAlert("💧 Umidade baixa!");
                        console.log(`⚠️ ALERTA: Umidade baixa! ${value}%`);
                    } else if (value > 70) {
                        setAlert("🌊 Umidade alta!");
                        console.log(`⚠️ ALERTA: Umidade alta! ${value}%`);
                    } else if (temp <= 30 || temp >= 18) {
                        // Só limpa o alerta se a temperatura também estiver normal
                        setAlert("");
                    }
                }

                // Atualiza o estado da lâmpada
                if (topic === 'casa/luz') {
                    const isOn = message === "1";
                    setIsLightOn(isOn);
                    saveData('luz', message);
                    console.log(`💡 Luz ${isOn ? "Ligada" : "Desligada"}`);
                }
            },

            // Executado quando conecta com sucesso
            () => {
                setIsConnected(true);
                setShowError(false);
                console.log('✅ Conectado ao broker MQTT!');
                
                mqtt.subscribe('casa/temp');
                mqtt.subscribe('casa/umid');
                mqtt.subscribe('casa/luz');
                
                console.log('📡 Inscrito nos tópicos: casa/temp, casa/umid, casa/luz');
            },

            // Executado caso ocorra erro na conexão
            (error) => {
                setIsConnected(false);
                setShowError(true);
                console.log('❌ Erro na conexão MQTT:', error);
            }
        );
    };

    // Liga ou desliga a lâmpada
    const toggleLight = () => {
        const newState = isLightOn ? "0" : "1";
        mqtt.publish('casa/luz', newState);
        console.log(`🔘 Comando enviado: ${newState === "1" ? "Ligar" : "Desligar"} luz`);
    };

    // Interface principal da aplicação
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ alignItems: 'center' }}
        >
            <Text style={styles.header}>
                Smart Home IoT
            </Text>

            <LightControl
                isLightOn={isLightOn}
                onToggle={toggleLight}
            />

            <Gauges
                temp={temp}
                hum={hum}
            />

            {/* Exibe alertas na tela */}
            {alert !== "" && (
                <Text style={styles.alert}>
                    {alert}
                </Text>
            )}

            {/* Status da conexão */}
            <Text style={styles.status}>
                {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
            </Text>

            {/* Modal exibido em caso de erro de conexão */}
            <StatusModal
                visible={showError}
                onRetry={startConnection}
                onLater={() => setShowError(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    header: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'center',
    },
    alert: {
        color: '#FF4D4D',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: '#2A2A2A',
        padding: 10,
        borderRadius: 8,
    },
    status: {
        color: '#AAA',
        marginTop: 20,
        fontSize: 12,
        textAlign: 'center',
    }
});