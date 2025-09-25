import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";
import uuid from "react-native-uuid";

// === IMPORTES DA API (.NET) ===
import { listSectors } from "../services/api/sectors";
import { listMotorcycles, createMotorcycle } from "../services/api/motorcycles";
import { createMovement } from "../services/api/movements";

/**
 * ASSUMPTIONS IMPORTANTES:
 * - /api/sectors => [{ id: Guid, code: "A1" | "B7" | ... }]
 * - /api/motorcycles => [{ motorcycleId: Guid, sectorId: Guid, ... }]
 * - POST /api/motorcycles { motorcycleId, sectorId } cria a moto no setor atual
 * - (opcional) POST /api/movements { motorcycleId, sectorId } registra movimento
 *
 * Se sua API usa nomes diferentes (Id/sectorCode etc.), ajuste nos pontos marcados.
 */

export default function CadastroMotoScreen({ userRM }) {
  const { theme } = useContext(ThemeContext);

  // estado de UI
  const [setor, setSetor] = useState("A");           // A | B | C | D (prefixo)
  const [placa, setPlaca] = useState("");
  const [vagaSelecionada, setVagaSelecionada] = useState(null); // guarda o CODE, ex "A3"
  const [loading, setLoading] = useState(false);

  // dados vindos do backend
  const [sectors, setSectors] = useState([]);        // lista completa de setores
  const [motorcycles, setMotorcycles] = useState([]);// lista de motos (para ocupação)

  // dicionários de apoio
  const sectorByCode = useMemo(() => {
    const map = new Map();
    for (const s of sectors) {
      // AJUSTE: se o campo for S.name em vez de S.code, troque aqui
      map.set(s.code, s);
    }
    return map;
  }, [sectors]);

  const sectorById = useMemo(() => {
    const map = new Map();
    for (const s of sectors) {
      // AJUSTE: se o ID vier como s.sectorId, troque aqui
      map.set(s.id || s.sectorId, s);
    }
    return map;
  }, [sectors]);

  // agrupa visualmente: vagas do setor atual (filtra por prefixo "A", "B", "C", "D")
  const vagasDoSetor = useMemo(() => {
    return sectors
      .map(s => s.code)
      .filter(code => typeof code === "string" && code.startsWith(setor))
      // ordena "A1..A9" certinho: extrai número no fim, fallback por string
      .sort((a, b) => {
        const na = parseInt(a.slice(1), 10);
        const nb = parseInt(b.slice(1), 10);
        if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
        return a.localeCompare(b);
      });
  }, [sectors, setor]);

  // calcula ocupadas a partir das motos (sectorId -> code)
  const ocupadas = useMemo(() => {
    const set = new Set();
    for (const m of motorcycles) {
      const s = sectorById.get(m.sectorId);
      if (s?.code) set.add(s.code);
    }
    return set;
  }, [motorcycles, sectorById]);

  // carregar dados iniciais
  async function loadAll() {
    setLoading(true);
    try {
      const [secs, motos] = await Promise.all([
        listSectors(),
        listMotorcycles()
      ]);
      setSectors(Array.isArray(secs) ? secs : []);
      setMotorcycles(Array.isArray(motos) ? motos : []);
    } catch (e) {
      Alert.alert("Erro", e?.message || "Falha ao carregar dados do servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // sempre que mudar o prefixo (A/B/C/D), limpa seleção
  useEffect(() => {
    setVagaSelecionada(null);
  }, [setor]);

  async function handleCadastro() {
    if (!vagaSelecionada) {
      Alert.alert("Ops", "Selecione uma vaga livre antes de cadastrar.");
      return;
    }
    if (ocupadas.has(vagaSelecionada)) {
      Alert.alert("Ops", "Essa vaga está ocupada. Escolha outra vaga.");
      return;
    }

    // pega o setor escolhido pelo CODE (ex: "A3") -> id (Guid) para enviar à API
    const sector = sectorByCode.get(vagaSelecionada);
    if (!sector) {
      Alert.alert("Erro", "Setor selecionado não encontrado.");
      return;
    }

    // AJUSTE: se seu ID do setor vier como sector.sectorId, troque abaixo
    const sectorId = sector.id || sector.sectorId;
    if (!sectorId) {
      Alert.alert("Erro", "Setor sem ID válido.");
      return;
    }

    // gera um novo GUID para a moto (se o backend não gerar)
    const motorcycleId = uuid.v4();

    setLoading(true);
    try {
      // cria a moto já alocada no setor escolhido
      await createMotorcycle({ motorcycleId, sectorId });

      // opcional: registrar também o movimento inicial
      try {
        await createMovement({ motorcycleId, sectorId });
      } catch (_) {
        // silencioso: se sua API já registra o movimento ao criar,
        // esse POST pode falhar por duplicidade — ignoramos.
      }

      // refresh
      await loadAll();
      setPlaca("");
      setVagaSelecionada(null);

      Alert.alert("Sucesso", "Moto cadastrada com sucesso!");
    } catch (e) {
      Alert.alert("Erro ao cadastrar", e?.message || "Falha ao enviar para o servidor.");
    } finally {
      setLoading(false);
    }
  }

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

  if (loading && sectors.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: theme.text }}>Carregando...</Text>
      </View>
    );
  }

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
          ListEmptyComponent={
            <Text style={{ color: theme.text + "99", marginTop: 8 }}>
              Nenhuma vaga cadastrada no setor {setor}.
            </Text>
          }
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
            disabled={loading || !vagaSelecionada}
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
    headerWrap: { marginBottom: 8 },
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
    input: { flex: 1, color: theme.text, height: 44 },

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
    vagaOcupada: { backgroundColor: theme.background, opacity: 0.7 },
    vagaText: { color: theme.text, fontWeight: "700", marginBottom: 6 },
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
