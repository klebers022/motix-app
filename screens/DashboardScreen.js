import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
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
import { useTranslation } from "react-i18next";
import "../locales/i18n"; // inicializa i18n
import { ThemeContext } from "../contexts/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// === IMPORTES DA API (.NET) ===
import { listSectors } from "../services/api/sectors";
import { listMotorcycles } from "../services/api/motorcycles";

export default function DashboardScreen() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [setor, setSetor] = useState("A");
  const [sectors, setSectors] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const sectorById = useMemo(() => {
    const map = new Map();
    for (const s of sectors) map.set(s.id || s.sectorId, s);
    return map;
  }, [sectors]);

  const sectorByCode = useMemo(() => {
    const map = new Map();
    for (const s of sectors) map.set(s.code, s);
    return map;
  }, [sectors]);

  const vagasSetor = useMemo(() => {
    return sectors
      .map((s) => s.code)
      .filter((code) => typeof code === "string" && code.startsWith(setor))
      .sort((a, b) => {
        const na = parseInt(a.slice(1), 10);
        const nb = parseInt(b.slice(1), 10);
        if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
        return a.localeCompare(b);
      });
  }, [sectors, setor]);

  const ocupadasSet = useMemo(() => {
    const set = new Set();
    for (const m of motorcycles) {
      const sec = sectorById.get(m.sectorId);
      if (sec?.code) set.add(sec.code);
    }
    return set;
  }, [motorcycles, sectorById]);

  const carregar = useCallback(async () => {
    try {
      const [secs, motos] = await Promise.all([
        listSectors(),
        listMotorcycles(),
      ]);
      setSectors(Array.isArray(secs) ? secs : []);
      setMotorcycles(Array.isArray(motos) ? motos : []);
      setLastUpdated(new Date());
    } catch (e) {
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

  const getStatusVaga = (vagaCode) => {
    const ocupada = ocupadasSet.has(vagaCode);
    if (!ocupada) return "empty";

    const sec = sectorByCode.get(vagaCode);
    const moto = motorcycles.find(
      (m) => m.sectorId === (sec?.id || sec?.sectorId)
    );
    if (moto && (!moto.placa || String(moto.placa).trim() === ""))
      return "noplate";
    return "occupied";
  };

  const totalMotosSetor = useMemo(() => {
    const idsDoSetor = new Set(
      sectors
        .filter((s) => s.code?.startsWith(setor))
        .map((s) => s.id || s.sectorId)
    );
    return motorcycles.filter((m) => idsDoSetor.has(m.sectorId)).length;
  }, [sectors, motorcycles, setor]);

  const semPlacaSetor = useMemo(() => {
    const idsDoSetor = new Set(
      sectors
        .filter((s) => s.code?.startsWith(setor))
        .map((s) => s.id || s.sectorId)
    );
    return motorcycles.filter(
      (m) =>
        idsDoSetor.has(m.sectorId) &&
        (!m.placa || String(m.placa).trim() === "")
    ).length;
  }, [sectors, motorcycles, setor]);

  const vagasDisponiveis = useMemo(
    () => vagasSetor.filter((code) => !ocupadasSet.has(code)).length,
    [vagasSetor, ocupadasSet]
  );

  const Header = () => (
    <View style={styles(theme).header}>
      <View style={styles(theme).headerLeft}>
        <Ionicons name="speedometer" size={22} color={theme.primary} />
        <Text style={styles(theme).title}>{t("dashboard")}</Text>
      </View>
      <Text style={styles(theme).subtitle}>{t("overview")}</Text>
      {lastUpdated && (
        <Text style={styles(theme).lastUpdated}>
          {t("updated")}: {lastUpdated.toLocaleTimeString()}
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
              active && {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles(theme).tabText,
                active && { color: theme.background, fontWeight: "800" },
              ]}
            >
              {t("sector")} {s}
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
        <View
          style={[styles(theme).legendDot, { backgroundColor: "#4CAF50" }]}
        />
        <Text style={styles(theme).legendText}>{t("free")}</Text>
      </View>
      <View style={styles(theme).legendItem}>
        <View
          style={[styles(theme).legendDot, { backgroundColor: "#9E9E9E" }]}
        />
        <Text style={styles(theme).legendText}>{t("occupied")}</Text>
      </View>
      <View style={styles(theme).legendItem}>
        <View
          style={[styles(theme).legendDot, { backgroundColor: "#F44336" }]}
        />
        <Text style={styles(theme).legendText}>{t("noplate")}</Text>
      </View>
    </View>
  );

  const Vaga = ({ vaga }) => {
    const status = getStatusVaga(vaga);
    let color = "#4CAF50";
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
        <Text style={{ marginTop: 8, color: theme.text }}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Header />
      <SectorTabs />
      <View style={styles(theme).statsGrid}>
        <StatCard
          icon={<Ionicons name="bicycle" size={18} color={theme.primary} />}
          label={t("bikesInSector", { setor })}
          value={totalMotosSetor}
        />
        <StatCard
          icon={
            <MaterialCommunityIcons
              name="identifier"
              size={18}
              color="#F44336"
            />
          }
          label={t("noplate")}
          value={semPlacaSetor}
          accent="#F44336"
        />
        <StatCard
          icon={<Ionicons name="checkmark-done" size={18} color="#4CAF50" />}
          label={t("availableSpots")}
          value={vagasDisponiveis}
          accent="#4CAF50"
        />
      </View>
      <Legend />
      <FlatList
        data={vagasSetor}
        numColumns={3}
        keyExtractor={(item) => item}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 24 }}
        renderItem={({ item }) => <Vaga vaga={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <Text style={{ color: theme.text + "88", marginTop: 8 }}>
            {t("emptySector", { setor })}
          </Text>
        }
        ListFooterComponent={
          <View style={styles(theme).footerHint}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={theme.text + "88"}
            />
            <Text style={styles(theme).footerHintText}>{t("apiInfo")}</Text>
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
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    title: { fontSize: 24, fontWeight: "800", color: theme.text },
    subtitle: { color: theme.text + "99", marginBottom: 4 },
    lastUpdated: { color: theme.text + "66", fontSize: 12 },
    tabs: { flexDirection: "row", gap: 8, marginVertical: 12 },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.text + "22",
    },
    tabText: { color: theme.text, fontWeight: "600", fontSize: 12 },
    statsGrid: { gap: 10, marginBottom: 8 },
    statCard: {
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.text + "10",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    statLabel: { color: theme.text, fontWeight: "600" },
    statValue: { fontWeight: "900", fontSize: 18 },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginVertical: 8,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { color: theme.text, fontSize: 12 },
    vaga: {
      flex: 1,
      minWidth: 90,
      height: 56,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    vagaText: { color: "#fff", fontWeight: "800" },
    footerHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },
    footerHintText: { color: theme.text + "88", fontSize: 12, flex: 1 },
  });
