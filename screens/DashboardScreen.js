import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemeContext';

const vagasSetorA = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];

export default function DashboardScreen() {
  const [motos, setMotos] = useState([]);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      const dados = await AsyncStorage.getItem('motos');
      const lista = dados ? JSON.parse(dados) : [];
      setMotos(lista);
    };
    fetchData();
  }, []);

  const getStatusVaga = (vaga) => {
    const moto = motos.find((m) => m.vaga === vaga);
    if (!moto) return 'empty';
    if (!moto.placa || moto.placa.trim() === '') return 'noplate';
    return 'occupied';
  };

  const contarTotal = () => motos.length;
  const contarSemPlaca = () => motos.filter((m) => !m.placa || m.placa.trim() === '').length;
  const contarVagasDisponiveis = () => vagasSetorA.filter((v) => !motos.some((m) => m.vaga === v)).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
      

      <View style={styles.cardContainer}>
        <InfoCard label="Total de Motos" value={contarTotal()} color={theme.text} />
        <InfoCard label="Motos sem placas" value={contarSemPlaca()} color="#F44336" />
        <InfoCard label="Espaços disponíveis" value={contarVagasDisponiveis()} color="#4CAF50" />
      </View>

      <Text style={[styles.setorTitle, { color: theme.text }]}>Setor A</Text>
      <View style={styles.grid}>
        {vagasSetorA.map((vaga, idx) => {
          const status = getStatusVaga(vaga);
          let vagaColor = styles[status]?.backgroundColor || theme.primary;
          return (
            <View key={idx} style={[styles.vaga, { backgroundColor: vagaColor }]}>
              <Text style={styles.vagaText}>{vaga}</Text>
            </View>
          );
        })}
      </View>
     
    </View>
  );
}

const InfoCard = ({ label, value, color = '#000' }) => (
  <View style={styles.card}>
    <Text>{label}</Text>
    <Text style={{ color, fontWeight: 'bold' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vaga: {
    width: 80,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  vagaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  occupied: {
    backgroundColor: '#9E9E9E',
  },
  noplate: {
    backgroundColor: '#F44336',
  },
  empty: {
    backgroundColor: '#4CAF50',
  },
});