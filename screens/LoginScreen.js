import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const USUARIOS = [
  {
    rm: '557887',
    senha: '210106',
    nome: 'Kleber da Silva',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX1tZJeOCL9Qghfzjzsi3qcndhtIJoLafCSg&s',
  },
  {
    rm: '554944',
    senha: '210106',
    nome: 'Nicolas Barutti',
    foto: 'https://i.pinimg.com/236x/76/f4/e1/76f4e168cdfc94d066ebbbf6d3585e2c.jpg',
  },
  {
    rm: '558471',
    senha: '210106',
    nome: 'Lucas Rainha',
    foto: 'https://media.tenor.com/TiMKsmmhZMIAAAAM/messi-meme.gif',
  },
];

export default function LoginScreen({ onLoginSuccess }) {
  const [rm, setRm] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    const usuario = USUARIOS.find(user => user.rm === rm && user.senha === senha);
    if (usuario) {
      onLoginSuccess(usuario);
    } else {
      Alert.alert('Erro', 'RM ou senha incorretos');
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
