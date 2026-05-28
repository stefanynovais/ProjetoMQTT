// import React, { useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { env } from 'expo-env';
// import { StyleSheet, View, Text } from 'react-native';
// import MQTTService from './src/services/mqttService';
// import StatusModal from './src/components/StatusModal';
// import LightControl from './src/components/LightControl';
// import Gauges from './src/components/Gauges';

// const mqtt = new MQTTService();

// export default function App() {
//     const [isConnected, setIsConnected] = useState(false);
//     const [showError, setShowError] = useState(false);
//     const [isLightOn, setIsLightOn] = useState(false);
//     const [temp, setTemp] = useState(0);
//     const [hum, setHum] = useState(0);
//     const [history, setHistory] = useState([]);
//     const [alert, setAlert] = useState("");

//     // const mqttConfig = {
//     //     host: '0314b7b57b484df48700114479af9f1a.s1.eu.hivemq.cloud',
//     //     port: parseInt(env.MQTT_PORT),
//     //     path: env.MQTT_PATH,
//     //     user: aluno_etec,
//     //     pass: Senha123,
//     //     clientId: 'RN_App_' + Math.random(),
//     // };

//     const mqttConfig = {
//         host: process.env.EXPO_PUBLIC_MQTT_HOST,
//         port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
//         path: "/mqtt",
//         user: process.env.EXPO_PUBLIC_MQTT_USER,
//         pass: process.env.EXPO_PUBLIC_MQTT_PASS,
//         clientId: 'RN_App_' + Math.random(),
//     };

//     const loadSavedData = async () => {
//         const savedTemp = await AsyncStorage.getItem('temp');
//         const savedHum = await AsyncStorage.getItem('umid');
//         const savedLight = await AsyncStorage.getItem('luz');
//         const savedHistory = await AsyncStorage.getItem('history');
    
//         if (savedTemp) setTemp(parseFloat(savedTemp));
//         if (savedHum) setHum(parseFloat(savedHum));
//         if (savedLight) setIsLightOn(savedLight === "1");
    
//         if (savedHistory) {
//             setHistory(JSON.parse(savedHistory));
//         }
//     };

//     const saveHistory = async (newData) => {
//         const old = await AsyncStorage.getItem("history");
//         const history = old ? JSON.parse(old) : [];
    
//         history.push(newData);
    
//         if (history.length > 20) {
//             history.shift();
//         }
    
//         await AsyncStorage.setItem("history", JSON.stringify(history));
//         setHistory(history);
//     };

//     useEffect(() => {
//         loadSavedData();
//         startConnection();
//     }, []);
//     const startConnection = () => {
//     setShowError(false);
//     console.log(mqttConfig);
//     mqtt.connect(
//         mqttConfig,
//         (topic, message) => {
//             const value = parseFloat(message);
        
//             if (topic === 'casa/temp') {
//                 setTemp(value);
//             }
        
//             if (topic === 'casa/umid') {
//                 setHum(value);
//             }
        
//             if (topic === 'casa/luz') {
//                 setIsLightOn(message === "1");
//             }

//             if (topic === 'casa/temp' && value > 30) {
//                 setAlert("🔥 Temperatura alta!");
//             }
            
//             if (topic === 'casa/umid' && value < 40) {
//                 setAlert("💧 Umidade baixa!");
//             }
        
//             //registro único para histórico
//             const newData = {
//                 temp: topic === 'casa/temp' ? value : temp,
//                 hum: topic === 'casa/umid' ? value : hum,
//                 time: new Date().toLocaleTimeString(),
//             };
        
//             saveHistory(newData);
//         },
//         () => {
//             setIsConnected(true);
//             mqtt.subscribe('casa/temp');
//             mqtt.subscribe('casa/umid');
//             mqtt.subscribe('casa/luz');
//         },
//         (err) => {
//             setIsConnected(false);
//             setShowError(true);
//         }
//     );
// };

// const toggleLight = () => {
//     const newState = isLightOn ? "0" : "1";
//     mqtt.publish('casa/luz', newState);
// };
// return (
//     <View style={styles.container}>
//         <Text style={styles.header}>Smart Home IoT</Text>

//         <LightControl
//             isLightOn={isLightOn}
//             onToggle={toggleLight}
//         />

//         <Gauges temp={temp} hum={hum} />

//         {/* Componente de Status de Conexão */}
//         <StatusModal
//             visible={showError}
//             onRetry={startConnection}
//             onLater={() => setShowError(false)}
//         />
//     </View>
// );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#121212',
//         padding: 20,
//         alignItems: 'center',
//     },

//     header: {
//         color: '#FFF',
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginTop: 40,
//         marginBottom: 20,
//     },
// });

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native';
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

    const [history, setHistory] = useState([]);
    const [alert, setAlert] = useState("");

    let latestTemp = 0;
    let latestHum = 0;

    const mqttConfig = {
        host: process.env.EXPO_PUBLIC_MQTT_HOST,
        port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
        path: "/mqtt",
        user: process.env.EXPO_PUBLIC_MQTT_USER,
        pass: process.env.EXPO_PUBLIC_MQTT_PASS,
        clientId: 'RN_App_' + Math.random(),
    };

    // ---------------- LOAD LOCAL DATA ----------------
    const loadSavedData = async () => {
        const savedTemp = await AsyncStorage.getItem('temp');
        const savedHum = await AsyncStorage.getItem('umid');
        const savedLight = await AsyncStorage.getItem('luz');
        const savedHistory = await AsyncStorage.getItem('history');

        if (savedTemp) setTemp(parseFloat(savedTemp));
        if (savedHum) setHum(parseFloat(savedHum));
        if (savedLight) setIsLightOn(savedLight === "1");

        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    };

    // ---------------- SAVE HISTORY ----------------
    const saveHistory = async (newItem) => {
        const old = await AsyncStorage.getItem("history");
        const list = old ? JSON.parse(old) : [];

        const updated = [...list, newItem];

        if (updated.length > 20) updated.shift();

        await AsyncStorage.setItem("history", JSON.stringify(updated));
        setHistory(updated);
    };

    // ---------------- INIT ----------------
    useEffect(() => {
        const init = async () => {
            await loadSavedData();
            startConnection();
        };

        init();
    }, []);

    // ---------------- MQTT ----------------
    const startConnection = () => {
        setShowError(false);

        mqtt.connect(
            mqttConfig,

            (topic, message) => {

                const value = parseFloat(message);

                // -------- TEMPERATURE --------
                if (topic === 'casa/temp') {
                    latestTemp = value;
                    setTemp(value);
                    AsyncStorage.setItem('temp', message);

                    if (value > 30) setAlert("🔥 Temperatura alta!");
                    else setAlert("");
                }

                // -------- HUMIDITY --------
                if (topic === 'casa/umid') {
                    latestHum = value;
                    setHum(value);
                    AsyncStorage.setItem('umid', message);

                    if (value < 40) setAlert("💧 Umidade baixa!");
                    else setAlert("");
                }

                // -------- LIGHT --------
                if (topic === 'casa/luz') {
                    setIsLightOn(message === "1");
                    AsyncStorage.setItem('luz', message);
                }

                // -------- HISTORY (1 registro consistente) --------
                const newItem = {
                    temp: latestTemp,
                    hum: latestHum,
                    time: new Date().toLocaleTimeString(),
                };

                saveHistory(newItem);
            },

            () => {
                setIsConnected(true);
                mqtt.subscribe('casa/temp');
                mqtt.subscribe('casa/umid');
                mqtt.subscribe('casa/luz');
            },

            () => {
                setIsConnected(false);
                setShowError(true);
            }
        );
    };

    // ---------------- TOGGLE LIGHT ----------------
    const toggleLight = () => {
        const newState = isLightOn ? "0" : "1";
        mqtt.publish('casa/luz', newState);
    };

    // ---------------- UI ----------------
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Smart Home IoT</Text>

            <LightControl
                isLightOn={isLightOn}
                onToggle={toggleLight}
            />

            <Gauges temp={temp} hum={hum} history={history} />

            {/* ALERT */}
            {alert !== "" && (
                <Text style={styles.alert}>
                    {alert}
                </Text>
            )}

            {/* DEBUG (opcional) */}
            <Text style={{ color: '#AAA', marginTop: 10 }}>
                Histórico: {history.length}
            </Text>

            {/* ERROR */}
            <StatusModal
                visible={showError}
                onRetry={startConnection}
                onLater={() => setShowError(false)}
            />
        </ScrollView>
    );
}

// ---------------- STYLES ----------------
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

    alert: {
        color: '#FF4D4D',
        fontWeight: 'bold',
        marginTop: 10
    }
});