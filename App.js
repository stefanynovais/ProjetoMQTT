import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { env } from 'expo-env';
import { StyleSheet, View, Text } from 'react-native';
import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';

const mqtt = new MQTTService();

export default function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isLightOn, setIsLightOn] = useState(false);
    const [temp, setTemp] = useState(0);
    const [hum, setHum] = useState(0);

    // const mqttConfig = {
    //     host: '0314b7b57b484df48700114479af9f1a.s1.eu.hivemq.cloud',
    //     port: parseInt(env.MQTT_PORT),
    //     path: env.MQTT_PATH,
    //     user: aluno_etec,
    //     pass: Senha123,
    //     clientId: 'RN_App_' + Math.random(),
    // };

    const mqttConfig = {
        host: process.env.EXPO_PUBLIC_MQTT_HOST,
        port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
        path: "/mqtt",
        user: process.env.EXPO_PUBLIC_MQTT_USER,
        pass: process.env.EXPO_PUBLIC_MQTT_PASS,
        clientId: 'RN_App_' + Math.random(),
    };

    const loadSavedData = async () => {
        const savedTemp = await AsyncStorage.getItem('temp');
        const savedHum = await AsyncStorage.getItem('umid');
        const savedLight = await AsyncStorage.getItem('luz');
    
        console.log("TEMP salva:", savedTemp);
        console.log("UMID salva:", savedHum);
        console.log("LUZ salva:", savedLight);
    

        if (savedTemp) setTemp(parseFloat(savedTemp));
        if (savedHum) setHum(parseFloat(savedHum));
        if (savedLight) setIsLightOn(savedLight === "1");
    };

    useEffect(() => {
        loadSavedData();
        startConnection();
    }, []);
    const startConnection = () => {
    setShowError(false);
    console.log(mqttConfig);
    mqtt.connect(
        mqttConfig,
        (topic, message) => {
            if (topic === 'casa/temp') {
                setTemp(parseFloat(message));
                AsyncStorage.setItem('temp', message);
            }
        
            if (topic === 'casa/umid') {
                setHum(parseFloat(message));
                AsyncStorage.setItem('umid', message);
            }
        
            if (topic === 'casa/luz') {
                const value = message === "1";
                setIsLightOn(value);
                AsyncStorage.setItem('luz', message);
            }
        },
        () => {
            setIsConnected(true);
            mqtt.subscribe('casa/temp');
            mqtt.subscribe('casa/umid');
            mqtt.subscribe('casa/luz');
        },
        (err) => {
            setIsConnected(false);
            setShowError(true);
        }
    );
};

const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
};
return (
    <View style={styles.container}>
        <Text style={styles.header}>Smart Home IoT</Text>

        <LightControl
            isLightOn={isLightOn}
            onToggle={toggleLight}
        />

        <Gauges temp={temp} hum={hum} />

        {/* Componente de Status de Conexão */}
        <StatusModal
            visible={showError}
            onRetry={startConnection}
            onLater={() => setShowError(false)}
        />
    </View>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        alignItems: 'center',
    },

    header: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20,
    },
});