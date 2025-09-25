import axios from "axios";
import { Platform } from "react-native";

// 🚨 troque pelo IP da sua máquina quando for rodar em dispositivo físico
const LOCAL_PC_IP = "192.168.56.1"; // <-- AJUSTE AQUI (veja em ipconfig/ifconfig)

// Porta da sua API .NET (http)
const PORT = 5167;

function getBaseURL() {
  if (Platform.OS === "android") {
    // Android Emulator AVD (10.0.2.2)
    return `http://10.0.2.2:${PORT}/api`;
  }

  if (Platform.OS === "ios") {
    // iOS Simulator acessa direto localhost
    return `http://localhost:${PORT}/api`;
  }

  // Dispositivo físico (Android/iOS)
  return `http://${LOCAL_PC_IP}:${PORT}/api`;
}

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

// Interceptor para tratar erros amigáveis
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      return Promise.reject({
        message: error.response.data?.message || "Erro na API",
        status: error.response.status,
      });
    }
    if (error.request) {
      return Promise.reject({
        message: "Sem resposta do servidor",
        status: 0,
      });
    }
    return Promise.reject({ message: error.message, status: 0 });
  }
);
