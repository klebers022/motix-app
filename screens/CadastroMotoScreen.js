import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

// Mapeia vagas por setor (fácil expandir depois)
const VAGAS_MAP = {
  A: Array.from({ length: 9 }, (_, i) => `A${i + 1}`),
  B: Array.from({ length: 9 }, (_, i) => `B${i + 1}`),
  C: Array.from({ length: 9 }, (_, i) => `C${i + 1}`),
  D: Array.from({ length: 9 }, (_, i) => `D${i + 1}`),
};

export default function CadastroMotoScreen({ userRM }) {
  const { theme } = useContext(ThemeContext);

  const [setor, setSetor] = useState("A");
  const [placa, setPlaca] = useState("");
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [ocupadas, setOcupadas] = useState(new Set()); // controla vagas ocupadas do setor atual
  const [loading, setLoading] = useState(false);

  // Vagas do setor atual
  const vagasDoSetor = useMemo(() => VAGAS_MAP[setor] ?? [], [setor]);

  useEffect(() => {
    // ao trocar setor, limpa seleção e recarrega ocupação
    setVagaSelecionada(null);
    carregarOcupacao();
  }, [setor]);

  useEffect(() => {
    // carrega na primeira renderização
    carregarOcupacao();
  }, []);

  const carregarOcupacao = async () => {
    try {
      const dados = await AsyncStorage.getItem("motos");
      const lista = dados ? JSON.parse(dados) : [];
      // considera ocupada a vaga que tem último registro como "Entrada"
      // (se você tiver 'Saída' depois, pode filtrar pela última ocorrência)
      const ocupadasSet = new Set(
        lista
          .filter((m) => (m?.vaga || "").startsWith(setor) && (m?.tipo || "Entrada").toLowerCase() === "entrada")
          .map((m) => m.vaga)
      );
      setOcupadas(ocupadasSet);
    } catch (e) {
      // Se falhar, apenas não marca ocupadas
      setOcupadas(new Set());
    }
  };

  const handleCadastro = async () => {
    if (!vagaSelecionada) {
      Alert.alert("Ops", "Selecione uma vaga livre antes de cadastrar.");
      return;
    }

    if (ocupadas.has(vagaSelecionada)) {
      Alert.alert("Ops", "Essa vaga está ocupada. Escolha outra vaga.");
      return;
    }

    const novaMoto = {
      tipo: "Entrada",
      placa: (placa || "").trim().toUpperCase() || "Sem placa",
      vaga: vagaSelecionada,
      dataHora: new Date().toISOString().slice(0, 16).replace("T", " "),
      usuarioRM: userRM ?? null,
    };

    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem("motos");
      const lista = dados ? JSON.parse(dados) : [];

      // Segurança extra: não duplica vaga
      const jaOcupada = lista.some((m) => m.vaga === vagaSelecionada && (m?.tipo || "Entrada").toLowerCase() === "entrada");
      if (jaOcupada) {
        Alert.alert("Ops", "Essa vaga acabou de ser ocupada. Escolha outra.");
        await carregarOcupacao();
        return;
      }

      lista.push(novaMoto);
      await AsyncStorage.setItem("motos", JSON.stringify(lista));

      // Atualiza UI
      setPlaca("");
      setVagaSelecionada(null);
      await carregarOcupacao();

      Alert.alert("Sucesso", "Moto cadastrada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setPlaca("");
    setVagaSelecionada(null);
  };

  const SecaoTitulo = () => (
    <View style={styles(theme).headerWrap}>
      <View style={styles(theme).titleRow}>
        <View style={styles(theme).titleLeft}>
          <MaterialCommunityIcons name="motorbike" size={24} color={theme.primary} />
          <Text style={styles(theme).titulo}>Cadastro de Moto</Text>
        </View>
        <View style={styles(theme).smallPill}>
          <Ionicons name="grid-outline" size={14} color={theme.background} />
          <Text style={styles(theme).smallPillText}>{vagasDoSetor.length}</Text>
        </View>
      </View>
      <Text style={styles(theme).subtitulo}>
        Escolha o setor, selecione uma vaga livre e informe a placa.
      </Text>
    </View>
  );

  const ChipSetor = ({ label }) => {
    const ativo = setor === label;
    return (
      <TouchableOpacity
        onPress={() => setSetor(label)}
        style={[
          styles(theme).chip,
          ativo && { backgroundColor: theme.primary, borderColor: theme.primary },
        ]}
      >
        <Text
          style={[
            styles(theme).chipText,
            ativo && { color: theme.background, fontWeight: "800" },
          ]}
        >
          {label || "Todos"}
        </Text>
      </TouchableOpacity>
    );
  };

  const LinhaSetor = () => (
    <View style={styles(theme).chipsRow}>
      {["A", "B", "C", "D"].map((s) => (
        <ChipSetor key={s} label={s} />
      ))}
    </View>
  );

  const VagaItem = ({ vaga }) => {
    const isOcupada = ocupadas.has(vaga);
    const isSelecionada = vagaSelecionada === vaga;

    return (
      <TouchableOpacity
        activeOpacity={isOcupada ? 1 : 0.8}
        onPress={() => {
          if (isOcupada) return;
          setVagaSelecionada(vaga);
        }}
        style={[
          styles(theme).vagaCard,
          isOcupada && styles(theme).vagaOcupada,
          isSelecionada && { borderColor: theme.primary, borderWidth: 2 },
        ]}
      >
        <Text
          style={[
            styles(theme).vagaText,
            isOcupada && { color: theme.text + "55", textDecorationLine: "line-through" },
          ]}
        >
          {vaga}
        </Text>
        <View style={styles(theme).vagaBadge(isOcupada)}>
          <Ionicons
            name={isOcupada ? "close-circle" : "checkmark-circle"}
            size={14}
            color={isOcupada ? "#7f1d1d" : "#14532d"}
          />
          <Text style={styles(theme).vagaBadgeText(isOcupada)}>
            {isOcupada ? "Ocupada" : "Livre"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles(theme).container}>
      <SecaoTitulo />

      {/* Card de formulário */}
      <View style={styles(theme).formCard}>
        <Text style={styles(theme).label}>Setor</Text>
        <LinhaSetor />

        <Text style={styles(theme).label}>Placa</Text>
        <View style={styles(theme).inputWrap}>
          <Ionicons name="car-outline" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <TextInput
            value={placa}
            onChangeText={(t) => setPlaca((t || "").toUpperCase())}
            placeholder="Digite a placa (opcional)"
            style={styles(theme).input}
            placeholderTextColor={theme.text + "80"}
            autoCapitalize="characters"
          />
        </View>

        <Text style={styles(theme).label}>Vagas do setor {setor}</Text>
        <FlatList
          data={vagasDoSetor}
          keyExtractor={(item) => item}
          numColumns={3}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ paddingVertical: 6 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => <VagaItem vaga={item} />}
        />

        <View style={styles(theme).actionsRow}>
          <TouchableOpacity
            onPress={limpar}
            style={[styles(theme).btnOutlined]}
            disabled={loading}
          >
            <Ionicons name="refresh" size={18} color={theme.text} />
            <Text style={styles(theme).btnOutlinedText}>Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCadastro}
            style={[styles(theme).btnPrimary]}
            disabled={loading}
          >
            <Ionicons name="save-outline" size={18} color={theme.background} />
            <Text style={styles(theme).btnPrimaryText}>
              {loading ? "Salvando..." : "Cadastrar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/** ======= Styles (dependentes do theme) ======= */
const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },
    headerWrap: {
      marginBottom: 8,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    titleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    titulo: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      marginLeft: 8,
    },
    subtitulo: {
      color: theme.text + "99",
      marginTop: 6,
      marginLeft: 32,
    },
    smallPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    smallPillText: {
      color: theme.background,
      fontWeight: "800",
      fontSize: 12,
    },

    formCard: {
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.text + "10",
      marginTop: 10,
    },
    label: {
      color: theme.text,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 6,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 6,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.text + "22",
    },
    chipText: {
      color: theme.text,
      fontWeight: "600",
      fontSize: 12,
      letterSpacing: 0.2,
    },

    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.text + "22",
      height: 44,
    },
    input: {
      flex: 1,
      color: theme.text,
      height: 44,
    },

    vagaCard: {
      flex: 1,
      minWidth: 90,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.text + "22",
    },
    vagaOcupada: {
      backgroundColor: theme.background,
      opacity: 0.7,
    },
    vagaText: {
      color: theme.text,
      fontWeight: "700",
      marginBottom: 6,
    },
    vagaBadge: (isOcupada) => ({
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: isOcupada ? "#FEE2E2" : "#DCFCE7",
    }),
    vagaBadgeText: (isOcupada) => ({
      color: isOcupada ? "#7f1d1d" : "#14532d",
      fontWeight: "700",
      fontSize: 12,
    }),

    actionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
    },
    btnPrimary: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 10,
      gap: 8,
    },
    btnPrimaryText: {
      color: theme.background,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    btnOutlined: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.text + "22",
      backgroundColor: theme.background,
    },
    btnOutlinedText: {
      color: theme.text,
      fontWeight: "700",
    },
  });
