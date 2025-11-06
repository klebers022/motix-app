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
import { useTranslation } from "react-i18next";

// ✅ IMPORT PARA NOTIFICAÇÕES
import * as Notifications from "expo-notifications";

// === IMPORTES DA API (.NET) ===
import { listSectors } from "../services/api/sectors";
import { listMotorcycles, createMotorcycle } from "../services/api/motorcycles";
import { createMovement } from "../services/api/movements";

export default function CadastroMotoScreen({ userRM }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [expoPushToken, setExpoPushToken] = useState(null);

  // ✅ CONFIGURAR NOTIFICAÇÕES
  useEffect(() => {
    async function registerForPushNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Atenção", "Permissão de notificação negada");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    }

    registerForPushNotifications();
  }, []);

  // FUNÇÃO PARA DISPARAR PUSH
  async function sendLocalNotification(vaga) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Nova moto cadastrada 🏍️",
        body: `Uma moto foi cadastrada na vaga ${vaga}`,
        sound: true,
      },
      trigger: null,
    });
  }

  // estado de UI
  const [setor, setSetor] = useState("A");
  const [placa, setPlaca] = useState("");
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);

  // dados vindos do backend
  const [sectors, setSectors] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);

  // dicionários
  const sectorByCode = useMemo(() => {
    const map = new Map();
    sectors.forEach((s) => map.set(s.code, s));
    return map;
  }, [sectors]);

  const sectorById = useMemo(() => {
    const map = new Map();
    sectors.forEach((s) => map.set(s.id || s.sectorId, s));
    return map;
  }, [sectors]);

  const vagasDoSetor = useMemo(() => {
    return sectors
      .map((s) => s.code)
      .filter((code) => code?.startsWith(setor))
      .sort((a, b) => {
        const na = parseInt(a.slice(1), 10);
        const nb = parseInt(b.slice(1), 10);
        return Number.isFinite(na) && Number.isFinite(nb)
          ? na - nb
          : a.localeCompare(b);
      });
  }, [sectors, setor]);

  const ocupadas = useMemo(() => {
    const set = new Set();
    motorcycles.forEach((m) => {
      const s = sectorById.get(m.sectorId);
      if (s?.code) set.add(s.code);
    });
    return set;
  }, [motorcycles, sectorById]);

  async function loadAll() {
    setLoading(true);
    try {
      const [secs, motos] = await Promise.all([
        listSectors(),
        listMotorcycles(),
      ]);
      setSectors(secs || []);
      setMotorcycles(motos || []);
    } catch {
      Alert.alert(t("erro"), t("alertErroCarregar"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setVagaSelecionada(null);
  }, [setor]);

  // ✅ ALTERADO: cadastra moto e envia notificação
  async function handleCadastro() {
    console.log("Ricardo Safado")
    if (!vagaSelecionada)
      return Alert.alert(t("ops"), t("alertOpsEscolhaVaga"));

    if (ocupadas.has(vagaSelecionada))
      return Alert.alert(t("ops"), t("alertVagaOcupada"));

    const sector = sectorByCode.get(vagaSelecionada);
    if (!sector) return Alert.alert(t("erro"), t("alertSetorNaoEncontrado"));

    const sectorId = sector.id || sector.sectorId;
    if (!sectorId) return Alert.alert(t("erro"), t("alertSetorSemId"));

    const motorcycleId = uuid.v4();
    setLoading(true);

    try {
      await createMotorcycle({ motorcycleId, sectorId });
      await createMovement({ userId, sectorId });

      await loadAll();
      setPlaca("");
      setVagaSelecionada(null);

      // ✅ ENVIAR PUSH LOCAL
      await sendLocalNotification(vagaSelecionada);

      Alert.alert(t("sucesso"), t("alertSucesso"));
    } catch (e) {
      Alert.alert(t("erro"), t("alertErroCadastrar"));
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
          <MaterialCommunityIcons
            name="motorbike"
            size={24}
            color={theme.primary}
          />
          <Text style={styles(theme).titulo}>{t("cadastroTitulo")}</Text>
        </View>
      </View>
      <Text style={styles(theme).subtitulo}>{t("cadastroSubtitulo")}</Text>
    </View>
  );

  const ChipSetor = ({ label }) => {
    const ativo = setor === label;
    return (
      <TouchableOpacity
        onPress={() => setSetor(label)}
        style={[
          styles(theme).chip,
          ativo && {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          },
        ]}
      >
        <Text
          style={[
            styles(theme).chipText,
            ativo && { color: theme.background, fontWeight: "800" },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const VagaItem = ({ vaga }) => {
    const isOcupada = ocupadas.has(vaga);
    const isSelecionada = vagaSelecionada === vaga;

    return (
      <TouchableOpacity
        activeOpacity={isOcupada ? 1 : 0.8}
        onPress={() => !isOcupada && setVagaSelecionada(vaga)}
        style={[
          styles(theme).vagaCard,
          isOcupada && styles(theme).vagaOcupada,
          isSelecionada && { borderColor: theme.primary, borderWidth: 2 },
        ]}
      >
        <Text
          style={[
            styles(theme).vagaText,
            isOcupada && {
              color: theme.text + "55",
              textDecorationLine: "line-through",
            },
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
            {isOcupada ? t("ocupada") : t("livre")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && sectors.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: theme.text }}>
          {t("carregando")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <SecaoTitulo />

      <View style={styles(theme).formCard}>
        <Text style={styles(theme).label}>{t("setor")}</Text>

        <View style={styles(theme).chipsRow}>
          {["A", "B", "C", "D", "E"].map((s) => (
            <ChipSetor key={s} label={s} />
          ))}
        </View>

        <Text style={styles(theme).label}>{t("placa")}</Text>
        <View style={styles(theme).inputWrap}>
          <Ionicons
            name="car-outline"
            size={18}
            color={theme.text}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={placa}
            onChangeText={(t) => setPlaca((t || "").toUpperCase())}
            placeholder={t("placeholderPlaca")}
            style={styles(theme).input}
            placeholderTextColor={theme.text + "80"}
            autoCapitalize="characters"
          />
        </View>

        <Text style={styles(theme).label}>{t("vagasDoSetor", { setor })}</Text>

        <FlatList
          data={vagasDoSetor}
          keyExtractor={(i) => i}
          numColumns={3}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => <VagaItem vaga={item} />}
          ListEmptyComponent={
            <Text style={{ color: theme.text + "99" }}>
              {t("nenhumaVaga", { setor })}
            </Text>
          }
        />

        <View style={styles(theme).actionsRow}>
          <TouchableOpacity
            onPress={limpar}
            style={styles(theme).btnOutlined}
            disabled={loading}
          >
            <Ionicons name="refresh" size={18} color={theme.text} />
            <Text style={styles(theme).btnOutlinedText}>{t("limpar")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            
            onPress={handleCadastro}
            style={styles(theme).btnPrimary}
          >
            <Ionicons name="save-outline" size={18} color={theme.background} />
            <Text style={styles(theme).btnPrimaryText}>
              {loading ? t("salvando") : t("cadastrar")}
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
    titleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    titulo: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      marginLeft: 8,
    },
    subtitulo: { color: theme.text + "99", marginTop: 6, marginLeft: 32 },
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
    vagaOcupada: { opacity: 0.7 },
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
