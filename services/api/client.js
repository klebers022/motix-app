import axios from "axios";
import { Platform } from "react-native";

const LOCAL_PC_IP = "192.168.10.212"; // IP da sua máquina na rede
const PORT = 5167;

function getBaseURL() {
  if (Platform.OS === "web") {
    // Browser sempre acessa via localhost
    return `http://localhost:${PORT}/api`;
  }

  if (Platform.OS === "android") {
    // Emulador Android usa 10.0.2.2 para mapear localhost do PC
    return `http://10.0.2.2:${PORT}/api`;
  }

  if (Platform.OS === "ios") {
    // Simulador iOS entende localhost, mas dispositivo físico precisa do IP da rede
    return `http://${LOCAL_PC_IP}:${PORT}/api`;
  }

  // Dispositivo físico Android (quando não é emulador) ou fallback
  return `http://${LOCAL_PC_IP}:${PORT}/api`;
}

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

console.log("🔗 Base URL da API:", getBaseURL());
console.log("📱 Platform:", Platform.OS);

// Interceptors para monitorar requests/responses
api.interceptors.request.use(
  (config) => {
    console.log("📤 Fazendo requisição para:", config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => {
    console.log("✅ Resposta recebida:", res.status, res.config.url);
    return res;
  },
  (error) => {
    console.error("❌ Erro na API:", error.message);

    if (error.response) {
      return Promise.reject({
        message: error.response.data?.message || "Erro na API",
        status: error.response.status,
      });
    }

    if (error.request) {
      return Promise.reject({
        message: "Sem resposta do servidor. Verifique se a API está rodando.",
        status: 0,
      });
    }

    return Promise.reject({ message: error.message, status: 0 });
  }
);
