import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

export default function RegisterScreen({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const handleRegister = async () => {
    console.log("Botão pressionado!");
    console.log("Tentando cadastro com:", email);
    if (senha !== confirmSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;
      console.log("Cadastro bem-sucedido:", user.uid);
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      onRegisterSuccess?.(user);
      navigation.navigate("Dashboard");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.logo, { color: theme.text }]}>
        MOTI<Text style={{ color: theme.primary }}>X</Text> - Cadastro
      </Text>

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={theme.text}
          style={styles.icon}
        />
        <TextInput
          placeholder="Email"
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={theme.text}
          style={styles.icon}
        />
        <TextInput
          placeholder="Senha"
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={theme.text}
          style={styles.icon}
        />
        <TextInput
          placeholder="Confirmar Senha"
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          secureTextEntry
          value={confirmSenha}
          onChangeText={setConfirmSenha}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleRegister}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  logoHighlight: {
    color: "#B6FF00",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});