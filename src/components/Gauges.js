// import React from 'react';
// import { StyleSheet, View, Text } from 'react-native';
// import CircularProgress from 'react-native-circular-progress-indicator';

// export default function Gauges({ temp, hum }) {
//   return (
//     <View style={styles.row}>
//       <View style={styles.gaugeBox}>
//         <CircularProgress
//           value={temp}
//           radius={60}
//           title={'°C'}
//           titleColor={'#FFF'}
//           activeStrokeColor={'#E74C3C'}
//           inactiveStrokeColor={'#2C3E50'}
//           textColor={'#FFF'}
//         />
//         <Text style={styles.label}>Temperatura</Text>
//       </View>

//       <View style={styles.gaugeBox}>
//         <CircularProgress
//           value={hum}
//           radius={60}
//           title={'%'}
//           titleColor={'#FFF'}
//           activeStrokeColor={'#3498DB'}
//           inactiveStrokeColor={'#2C3E50'}
//           textColor={'#FFF'}
//         />
//         <Text style={styles.label}>Umidade</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   gaugeBox: {
//     backgroundColor: '#1E1E1E1',
//     padding: 15,
//     borderRadius: 20,
//     alignItems: 'center',
//     width: '48%',
//   },
//   label: {
//     color: '#AAA',
//     marginTop: 10,
//     fontSize: 14,
//   },
// });

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function Gauges({ temp, hum, history = [] }) {
  return (
    <View style={{ width: '100%' }}>

      {/* GRAFICOS */}
      <View style={styles.row}>
        <View style={styles.gaugeBox}>
          <CircularProgress
            value={temp}
            radius={60}
            title={'°C'}
            titleColor={'#FFF'}
            activeStrokeColor={'#E74C3C'}
            inactiveStrokeColor={'#2C3E50'}
            textColor={'#FFF'}
          />
          <Text style={styles.label}>Temperatura</Text>
        </View>

        <View style={styles.gaugeBox}>
          <CircularProgress
            value={hum}
            radius={60}
            title={'%'}
            titleColor={'#FFF'}
            activeStrokeColor={'#3498DB'}
            inactiveStrokeColor={'#2C3E50'}
            textColor={'#FFF'}
          />
          <Text style={styles.label}>Umidade</Text>
        </View>
      </View>

      {/* ALERTAS */}
      {temp > 30 && (
        <Text style={styles.alertRed}>
          🔥 Alerta: Temperatura alta!
        </Text>
      )}

      {hum < 40 && (
        <Text style={styles.alertBlue}>
          💧 Alerta: Umidade baixa!
        </Text>
      )}

      {/* HISTÓRICO */}
      <View style={{ marginTop: 20, width: '100%' }}>
        <Text style={styles.title}>Histórico</Text>

        <ScrollView style={{ maxHeight: 250 }}>
          {history.slice().reverse().map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={{ color: '#FFF' }}>
                🌡 {item.temp}°C | 💧 {item.hum}%
              </Text>
              <Text style={{ color: '#AAA', fontSize: 12 }}>
                🕒 {item.time}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

    </View>
  );
}

// 🔥 ESSE BLOCO ESTAVA FALTANDO OU QUEBRADO
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  gaugeBox: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '48%',
  },

  label: {
    color: '#AAA',
    marginTop: 10,
    fontSize: 14,
  },

  title: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  alertRed: {
    color: '#FF4D4D',
    marginTop: 10,
    fontWeight: 'bold',
  },

  alertBlue: {
    color: '#4DA6FF',
    marginTop: 5,
    fontWeight: 'bold',
  },
});