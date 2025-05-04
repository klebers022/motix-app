import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const vagasSetorA = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];

export default function CadastroScreen() {
  const [placa, setPlaca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState(vagasSetorA[0]);

  const handleCadastro = async () => {
    const novaMoto = {
      placa: placa.trim(),
      vaga: vagaSelecionada,
      dataHora: new Date().toISOString(), // salva ISO para facilitar relatórios
    };

    const dados = await AsyncStorage.getItem('motos');
    const lista = dados ? JSON.parse(dados) : [];

    const vagaOcupada = lista.some((m) => m.vaga === vagaSelecionada);
    if (vagaOcupada) {
      Alert.alert('Erro', 'Essa vaga já está ocupada.');
      return;
    }

    lista.push(novaMoto);
    await AsyncStorage.setItem('motos', JSON.stringify(lista));

    setPlaca('');
    setVagaSelecionada(vagasSetorA[0]);
    Alert.alert('Sucesso', 'Moto cadastrada com sucesso!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Moto</Text>

      <Text style={styles.label}>Placa</Text>
      <TextInput
        value={placa}
        onChangeText={setPlaca}
        placeholder="Digite a placa (ou deixe em branco)"
        style={styles.input}
      />

      <Text style={styles.label}>Vaga</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={vagaSelecionada}
          onValueChange={(itemValue) => setVagaSelecionada(itemValue)}
        >
          {vagasSetorA.map((vaga) => (
            <Picker.Item key={vaga} label={vaga} value={vaga} />
          ))}
        </Picker>
      </View>

      <Button title="Cadastrar" onPress={handleCadastro} color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 15,
  },
});
