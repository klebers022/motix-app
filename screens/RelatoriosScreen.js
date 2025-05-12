import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function RelatorioScreen() {
  const [setor, setSetor] = useState("A");
  const [placa, setPlaca] = useState("");
  const [data, setData] = useState("");
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    carregarRegistros();
  }, []);

  const carregarRegistros = async () => {
    try {
      const dados = await AsyncStorage.getItem("motos");
      const lista = dados ? JSON.parse(dados) : [];

      const filtrados = lista.filter((item) => {
        const setorOK = setor ? item.vaga?.startsWith(setor.toUpperCase()) : true;
        const placaOK = placa ? item.placa?.toLowerCase().includes(placa.toLowerCase()) : true;
        const dataOK = data
          ? item.dataHora?.startsWith(data)
          : true;
        return setorOK && placaOK && dataOK;
      });

      setRegistros(filtrados);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  };

  const gerarPDF = async () => {
    const htmlContent = `
      <html>
        <body style="font-family: sans-serif; padding: 20px; color: #0E1B35">
          <h1 style="color:#0E1B35;">📄 Relatório MOTIX</h1>
          <p><strong>Setor:</strong> ${setor}</p>
          <p><strong>Placa:</strong> ${placa || "Todas"}</p>
          <p><strong>Data:</strong> ${data || "Todas"}</p>
          <hr />
          <h2>📋 Registros</h2>
          ${
            registros.length === 0
              ? "<p>Nenhum resultado encontrado.</p>"
              : registros
                  .map(
                    (item) => `
              <div style="margin-bottom: 10px; border-bottom: 1px solid #ccc; padding: 5px;">
                <p><strong>Entrada</strong></p>
                <p>Placa: ${item.placa || "Sem placa"}</p>
                <p>Vaga: ${item.vaga}</p>
                <p>Data/Hora: ${item.dataHora}</p>
                <p>RM: ${item.usuarioRM}</p>
              </div>`
                  )
                  .join("")
          }
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  };

  const gerarCSV = async () => {
    const csvContent = registros.map((item) =>
      `${item.tipo || "Entrada"},${item.placa || "Sem placa"},${item.vaga},${item.dataHora},${item.usuarioRM}`
    );
    const csvFinal = ["Tipo,Placa,Vaga,DataHora,RM", ...csvContent].join("\n");

    const fileUri = FileSystem.documentDirectory + "relatorio_motix.csv";
    await FileSystem.writeAsStringAsync(fileUri, csvFinal, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Exportar Relatório CSV",
      UTI: "public.comma-separated-values-text",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📊 Relatórios MOTIX</Text>

      <View style={styles.filtros}>
        <TextInput
          style={styles.input}
          placeholder="Setor"
          value={setor}
          onChangeText={setSetor}
        />
        <TextInput
          style={styles.input}
          placeholder="Placa"
          value={placa}
          onChangeText={setPlaca}
        />
        <TextInput
          style={styles.input}
          placeholder="Data (ex: 2024-05-12)"
          value={data}
          onChangeText={setData}
        />
        <TouchableOpacity style={styles.botaoBuscar} onPress={carregarRegistros}>
          <Text style={styles.botaoTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={registros}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.semResultados}>Nenhum registro encontrado.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}> Entrada</Text>
            <Text>Placa: {item.placa || "Sem placa"}</Text>
            <Text>Vaga: {item.vaga}</Text>
            <Text>Data/Hora: {item.dataHora}</Text>
            <Text>RM: {item.usuarioRM}</Text>
          </View>
        )}
      />

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botaoExportar} onPress={gerarPDF}>
          <Text style={styles.botaoTexto}>Exportar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoExportar} onPress={gerarCSV}>
          <Text style={styles.botaoTexto}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E1B35", padding: 16 },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#C1FF4D",
    marginBottom: 10,
  },
  filtros: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  botaoBuscar: {
    backgroundColor: "#C1FF4D",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  botaoExportar: {
    backgroundColor: "#C1FF4D",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  botaoTexto: {
    color: "#0E1B35",
    fontWeight: "bold",
  },
  semResultados: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTitulo: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0E1B35",
  },
  rodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
