
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

// Componente responsável por exibir:
// - gráficos de temperatura e umidade
// - alertas automáticos
// - histórico das leituras
export default function Gauges({ temp, hum, history = [] }) {

  return (

    <View style={{ width: '100%' }}>

      {/* Área dos gráficos circulares */}
      <View style={styles.row}>

        {/* Gráfico de temperatura */}
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

          <Text style={styles.label}>
            Temperatura
          </Text>

        </View>

        {/* Gráfico de umidade */}
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

          <Text style={styles.label}>
            Umidade
          </Text>

        </View>

      </View>

      {/* Alertas exibidos automaticamente */}
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
     

    </View>
  );
}

// Estilos da interface
const styles = StyleSheet.create({

  // Organização dos gráficos lado a lado
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Caixa individual de cada gráfico
  gaugeBox: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '48%',
  },

  // Texto abaixo dos gráficos
  label: {
    color: '#AAA',
    marginTop: 10,
    fontSize: 14,
  },

  // Área do histórico
  historyContainer: {
    marginTop: 20,
    width: '100%',
  },

  // Título "Histórico"
  title: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 10,
  },

  // Card de cada registro salvo
  card: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  // Horário do registro
  time: {
    color: '#AAA',
    fontSize: 12,
  },

  // Alerta de temperatura alta
  alertRed: {
    color: '#FF4D4D',
    marginTop: 10,
    fontWeight: 'bold',
  },

  // Alerta de baixa umidade
  alertBlue: {
    color: '#4DA6FF',
    marginTop: 5,
    fontWeight: 'bold',
  },
});