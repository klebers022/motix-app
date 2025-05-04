import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ onLoginSuccess }) {
  const [rm, setRm] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (rm === '557887' && senha === '210106') {
      onLoginSuccess();
    } else {
      alert('RM ou senha incorretos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        MOTI<Text style={styles.logoHighlight}>X</Text>
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          placeholder="RM"
          style={styles.input}
          placeholderTextColor="#888"
          value={rm}
          onChangeText={setRm}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Senha"
          style={styles.input}
          placeholderTextColor="#888"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.forgot}>Esqueceu sua senha?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1B35',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoHighlight: {
    color: '#B6FF00',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  button: {
    backgroundColor: '#B6FF00',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgot: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
});
