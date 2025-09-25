import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// === IMPORTES DA API (.NET) ===
import { listSectors } from "../services/api/sectors";
import { listMotorcycles } from "../services/api/motorcycles";

/**
 * ASSUMPTIONS:
 * - Sector: { id: Guid, code: "A1" | "B3" | ... }   // AJUSTE se seu backend usa sectorId ou outro nome
 * - Motorcycle: { motorcycleId: Guid, sectorId: Guid, ... }
 * - /api/sectors lista todos os setores (A1..D9)
 * - /api/motorcycles lista todas as motos ativas (ou atuais)
 */

export default function DashboardScreen() {
  const { theme } = useContext(ThemeContext);

  const [setor, setSetor] = useState("A"); // A | B | C | D
  const [sectors, setSectors] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // dicionários auxiliares
  const sectorById = useMemo(() => {
    const map = new Map();
    for (const s of sectors) {
      map.set(s.id || s.sectorId, s); // AJUSTE se o ID do setor vier como sector.sectorId
    }
    return map;
  }, [sectors]);

  const sectorByCode = useMemo(() => {
    const map = new Map();
    for (const s of sectors) {
      map.set(s.code, s); // AJUSTE se o campo do código tiver outro nome
    }
    return map;
  }, [sectors]);

  // lista das vagas do setor selecionado (filtra pelo prefixo A/B/C/D)
  const vagasSetor = useMemo(() => {
    return sectors
      .map(s => s.code)
      .filter(code => typeof code === "string" && code.startsWith(setor))
      .sort((a, b) => {
        const na = parseInt(a.slice(1), 10);
        const nb = parseInt(b.slice(1), 10);
        if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
        return a.localeCompare(b);
      });
  }, [sectors, setor]);

  // set de vagas ocupadas (codes) com base nas motos atuais
  const ocupadasSet = useMemo(() => {
    const set = new Set();
    for (const m of motorcycles) {
      const sec = sectorById.get(m.sectorId);
      if (sec?.code) set.add(sec.code);
    }
    return set;
  }, [motorcycles, sectorById]);

  // buscar dados da API
  const carregar = useCallback(async () => {
    try {
      const [secs, motos] = await Promise.all([listSectors(), listMotorcycles()]);
      setSectors(Array.isArray(secs) ? secs : []);
      setMotorcycles(Array.isArray(motos) ? motos : []);
      setLastUpdated(new Date());
    } catch (e) {
      // você pode trocar por um toast/alert se preferir
      console.warn("Falha ao carregar dados:", e?.message || e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregar();
  };

  // status por vaga no setor atual
  const getStatusVaga = (vagaCode) => {
    // ocupada se existir alguma moto cujo sectorId mapeie para esse code
    const ocupada = ocupadasSet.has(vagaCode);
    if (!ocupada) return "empty";

    // se seu backend não possui "placa", mantenha como "occupied".
    // Caso venha uma propriedade opcional "placa" na Motorcycle, você pode checar:
    const sec = sectorByCode.get(vagaCode);
    const moto = motorcycles.find(m => m.sectorId === (sec?.id || sec?.sectorId));
    if (moto && (!moto.placa || String(moto.placa).trim() === "")) return "noplate";

    return "occupied";
  };

  // métricas (no setor atual)
  const totalMotosSetor = useMemo(() => {
    const idsDoSetor = new Set(
      sectors.filter(s => s.code?.startsWith(setor)).map(s => s.id || s.sectorId)
    );
    return motorcycles.filter(m => idsDoSetor.has(m.sectorId)).length;
  }, [sectors, motorcycles, setor]);

  const semPlacaSetor = useMemo(() => {
    // se sua API não envia placa, isso sempre será 0
    const idsDoSetor = new Set(
      sectors.filter(s => s.code?.startsWith(setor)).map(s => s.id || s.sectorId)
    );
    return motorcycles.filter(m =>
      idsDoSetor.has(m.sectorId) && (!m.placa || String(m.placa).trim() === "")
    ).length;
  }, [sectors, motorcycles, setor]);

  const vagasDisponiveis = useMemo(() => {
    return vagasSetor.filter(code => !ocupadasSet.has(code)).length;
  }, [vagasSetor, ocupadasSet]);

  // UI Components
  const Header = () => (
    <View style={styles(theme).header}>
      <View style={styles(theme).headerLeft}>
        <Ionicons name="speedometer" size={22} color={theme.primary} />
        <Text style={styles(theme).title}>Dashboard</Text>
      </View>
      <Text style={styles(theme).subtitle}>Visão geral de ocupação</Text>
      {lastUpdated && (
        <Text style={styles(theme).lastUpdated}>
          Atualizado: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );

  const SectorTabs = () => (
    <View style={styles(theme).tabs}>
      {["A", "B", "C", "D"].map((s) => {
        const active = setor === s;
        return (
          <TouchableOpacity
            key={s}
            onPress={() => setSetor(s)}
            style={[
              styles(theme).tab,
              active && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
          >
            <Text style={[styles(theme).tabText, active && { color: theme.background, fontWeight: "800" }]}>
              Setor {s}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const StatCard = ({ icon, label, value, accent = theme.text }) => (
    <View style={styles(theme).statCard}>
      <View style={styles(theme).statLeft}>
        {icon}
        <Text style={styles(theme).statLabel}>{label}</Text>
      </View>
      <Text style={[styles(theme).statValue, { color: accent }]}>{value}</Text>
    </View>
  );

  const Legend = () => (
    <View style={styles(theme).legendRow}>
      <View style={styles(theme).legendItem}>
        <View style={[styles(theme).legendDot, { backgroundColor: "#4CAF50" }]} />
        <Text style={styles(theme).legendText}>Livre</Text>
      </View>
      <View style={styles(theme).legendItem}>
        <View style={[styles(theme).legendDot, { backgroundColor: "#9E9E9E" }]} />
        <Text style={styles(theme).legendText}>Ocupada</Text>
      </View>
      <View style={styles(theme).legendItem}>
        <View style={[styles(theme).legendDot, { backgroundColor: "#F44336" }]} />
        <Text style={styles(theme).legendText}>Sem placa</Text>
      </View>
    </View>
  );

  const Vaga = ({ vaga }) => {
    const status = getStatusVaga(vaga);
    let color = "#4CAF50"; // livre
    if (status === "occupied") color = "#9E9E9E";
    if (status === "noplate") color = "#F44336";

    return (
      <View style={[styles(theme).vaga, { backgroundColor: color }]}>
        <Text style={styles(theme).vagaText}>{vaga}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: theme.text }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Header />
      <SectorTabs />

      {/* Cards de métricas */}
      <View style={styles(theme).statsGrid}>
        <StatCard
          icon={<Ionicons name="bicycle" size={18} color={theme.primary} />}
          label={`Motos no setor ${setor}`}
          value={totalMotosSetor}
          accent={theme.text}
        />
        <StatCard
          icon={<MaterialCommunityIcons name="identifier" size={18} color="#F44336" />}
          label="Sem placa"
          value={semPlacaSetor}
          accent="#F44336"
        />
        <StatCard
          icon={<Ionicons name="checkmark-done" size={18} color="#4CAF50" />}
          label="Vagas livres"
          value={vagasDisponiveis}
          accent="#4CAF50"
        />
      </View>

      <Legend />

      {/* Grade de vagas */}
      <FlatList
        data={vagasSetor}
        numColumns={3}
        keyExtractor={(item) => item}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 24 }}
        renderItem={({ item }) => <Vaga vaga={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <Text style={{ color: theme.text + "88", marginTop: 8 }}>
            Nenhuma vaga cadastrada para o setor {setor}.
          </Text>
        }
        ListFooterComponent={
          <View style={styles(theme).footerHint}>
            <Ionicons name="information-circle-outline" size={16} color={theme.text + "88"} />
            <Text style={styles(theme).footerHintText}>
              A ocupação usa os setores da API e as motos ativas por setor. Se sua API também registra "Saída",
              podemos mudar para considerar o último evento por vaga.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    header: { marginBottom: 8 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    title: { fontSize: 24, fontWeight: "800", color: theme.text },
    subtitle: { color: theme.text + "99", marginBottom: 4 },
    lastUpdated: { color: theme.text + "66", fontSize: 12 },

    tabs: { flexDirection: "row", gap: 8, marginVertical: 12 },
    tab: {
      paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
      backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.text + "22",
    },
    tabText: { color: theme.text, fontWeight: "600", fontSize: 12, letterSpacing: 0.2 },

    statsGrid: { gap: 10, marginBottom: 8 },
    statCard: {
      backgroundColor: theme.inputBackground, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
      borderWidth: 1, borderColor: theme.text + "10", flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    statLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    statLabel: { color: theme.text, fontWeight: "600" },
    statValue: { fontWeight: "900", fontSize: 18, letterSpacing: 0.3 },

    legendRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8, marginBottom: 4 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { color: theme.text, fontSize: 12 },

    vaga: { flex: 1, minWidth: 90, height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
    vagaText: { color: "#ffffff", fontWeight: "800", letterSpacing: 0.3 },

    footerHint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    footerHintText: { color: theme.text + "88", fontSize: 12, flex: 1 },
  });
