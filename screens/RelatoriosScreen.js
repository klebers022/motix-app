import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const RelatorioScreen = () => {
  const [setor, setSetor] = useState('A');
  const [placa, setPlaca] = useState('');
  const [data, setData] = useState('18/04/2024');

  const registros = [
    { tipo: 'Entrada', placa: 'ABCC1234', dataHora: '18/04/2024 08:30', rm: 'RM123' },
    { tipo: 'Entrada', placa: 'ABCC1234', dataHora: '18/04/2024 08:30', rm: 'RM123' },
    { tipo: 'Entrada', placa: 'ABCC1234', dataHora: '18/04/2024 08:30', rm: 'RM123' },
    { tipo: 'Entrada', placa: 'ABCC1234', dataHora: '18/04/2024 08:30', rm: 'RM123' },
  ];

  const gerarPDF = async () => {
    const htmlContent = `
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>Relatório MOTIX</h1>
          <p><strong>Setor:</strong> ${setor}</p>
          <p><strong>Placa:</strong> ${placa || 'Todas'}</p>
          <p><strong>Data:</strong> ${data}</p>
          <hr />
          <h2>Registros</h2>
          ${registros.map(item => `
            <p>
              <strong>${item.tipo}</strong> - 
              Placa: ${item.placa} | 
              Data/Hora: ${item.dataHora} | 
              RM: ${item.rm}
            </p>
          `).join('')}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Relatórios</Text>

      <TextInput style={styles.input} placeholder="Setor" value={setor} onChangeText={setSetor} />
      <TextInput style={styles.input} placeholder="Placa" value={placa} onChangeText={setPlaca} />
      <TextInput style={styles.input} placeholder="Data" value={data} onChangeText={setData} />

      <TouchableOpacity style={styles.botao} onPress={gerarPDF}>
        <Text style={styles.botaoTexto}>Exportar</Text>
      </TouchableOpacity>

      <FlatList
        data={registros}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.entrada}>{item.tipo}</Text>
            <Text>{item.placa}</Text>
            <Text>{item.dataHora}</Text>
            <Text>RM: {item.rm}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  botao: {
    backgroundColor: '#C1FF4D',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20
  },
  botaoTexto: { fontWeight: 'bold', color: '#003060' },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6
  },
  entrada: { fontWeight: 'bold' }
});

export default RelatorioScreen;
