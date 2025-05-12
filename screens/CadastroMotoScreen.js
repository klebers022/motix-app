import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const vagasSetorA = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];

export default function CadastroMotoScreen({ userRM }) {
  const [placa, setPlaca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState(vagasSetorA[0]);

  const handleCadastro = async () => {
    if (!vagaSelecionada) {
      Alert.alert('Erro', 'Selecione uma vaga.');
      return;
    }

    const novaMoto = {
      tipo: 'Entrada',
      placa: placa.trim() || 'Sem placa',
      vaga: vagaSelecionada,
      dataHora: new Date().toISOString().slice(0, 16).replace("T", " "), 
      usuarioRM: userRM,
    };

    try {
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
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o cadastro.');
    }
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
        placeholderTextColor="#888"
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

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: '#0E1B35',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#C1FF4D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0E1B35',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
