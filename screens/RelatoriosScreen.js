import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

export default function RelatoriosScreen() {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  const [setor, setSetor] = useState("A");
  const [placa, setPlaca] = useState("");
  const [data, setData] = useState("");
  const [registros, setRegistros] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarRegistros();
  }, [setor, placa, data]);

  const carregarRegistros = async () => {
    try {
      setLoading(true);
      const dados = await AsyncStorage.getItem("motos");
      const lista = dados ? JSON.parse(dados) : [];

      const filtrados = lista.filter((item) => {
        const setorOK = setor
          ? item.vaga?.toUpperCase().startsWith(setor.toUpperCase())
          : true;
        const placaOK = placa
          ? (item.placa || "").toLowerCase().includes(placa.toLowerCase())
          : true;
        const dataOK = data ? (item.dataHora || "").startsWith(data) : true;
        return setorOK && placaOK && dataOK;
      });

      setRegistros(filtrados);
    } catch (error) {
      Alert.alert(t("error"), t("loadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarRegistros();
  }, []);

  const gerarPDF = async () => {
    const htmlContent = `
      <html>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>📄 ${t("report.title")}</h2>
          <p><b>${t("report.filters")}:</b></p>
          <p>${t("report.sector")}: ${setor || t("all")} | ${t(
      "report.plate"
    )}: ${placa || t("all")} | ${t("date")}: ${data || t("all")}</p>
          <p>${t("records")}: ${registros.length}</p>
          <hr />
          ${
            registros.length === 0
              ? `<p>${t("empty")}</p>`
              : registros
                  .map(
                    (item) => `
            <div style="border:1px solid #ddd; padding: 10px; border-radius: 8px; margin-bottom:8px;">
              <p><b>${t("type")}:</b> ${item.tipo || t("entry")}</p>
              <p><b>${t("plate")}:</b> ${item.placa || t("noPlate")}</p>
              <p><b>${t("spot")}:</b> ${item.vaga}</p>
              <p><b>${t("datetime")}:</b> ${item.dataHora}</p>
              <p><b>RM:</b> ${item.usuarioRM}</p>
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
    const csvContent = registros.map(
      (item) =>
        `${item.tipo || t("entry")},${
          item.placa || t("noPlate")
        },${item.vaga},${item.dataHora},${item.usuarioRM}`
    );
    const csvFinal = [`${t("type")},${t("plate")},${t("spot")},${t("datetime")},RM`, ...csvContent].join("\n");

    const fileUri = FileSystem.documentDirectory + "relatorio_motix.csv";
    await FileSystem.writeAsStringAsync(fileUri, csvFinal, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri);
  };

  const SecaoTitulo = () => (
    <View style={styles(theme).headerWrap}>
      <View style={styles(theme).titleRow}>
        <View style={styles(theme).titleLeft}>
          <Ionicons name="stats-chart" size={22} color={theme.primary} />
          <Text style={styles(theme).titulo}>{t("reports")}</Text>
        </View>
        <View style={styles(theme).badgeTotal}>
          <Ionicons name="list" size={14} color={theme.background} />
          <Text style={styles(theme).badgeTotalText}>{registros.length}</Text>
        </View>
      </View>
      <Text style={styles(theme).subtitulo}>
        {t("reportsSubtitle")}
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
          ativo && { backgroundColor: theme.primary },
        ]}
      >
        <Text
          style={[
            styles(theme).chipText,
            ativo && { color: theme.background, fontWeight: "700" },
          ]}
        >
          {label || t("all")}
        </Text>
      </TouchableOpacity>
    );
  };

  const LinhaFiltro = () => (
    <View style={styles(theme).filtros}>
      <View style={styles(theme).chipsRow}>
        {["A", "B", "C", "D"].map((s) => (
          <ChipSetor key={s} label={s} />
        ))}
        <ChipSetor label={""} />
      </View>

      <View style={styles(theme).inputRow}>
        <View style={styles(theme).inputWrap}>
          <Ionicons name="car-outline" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <TextInput
            style={styles(theme).input}
            placeholder={t("plate")}
            placeholderTextColor={theme.text + "90"}
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles(theme).inputWrap}>
          <Ionicons name="calendar-outline" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <TextInput
            style={styles(theme).input}
            placeholder={t("dateMask")}
            placeholderTextColor={theme.text + "90"}
            value={data}
            onChangeText={setData}
          />
        </View>
      </View>

      <TouchableOpacity style={styles(theme).botaoBuscar} onPress={carregarRegistros}>
        <Ionicons name="search" size={18} color={theme.background} />
        <Text style={styles(theme).botaoBuscarText}>{t("search")}</Text>
      </TouchableOpacity>
    </View>
  );

  const LinhaExport = () => (
    <View style={styles(theme).exportRow}>
      <TouchableOpacity style={styles(theme).botaoExportar} onPress={gerarPDF}>
        <MaterialCommunityIcons name="file-pdf-box" size={20} color={theme.background} />
        <Text style={styles(theme).botaoExportarText}>{t("exportPDF")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles(theme).botaoExportar} onPress={gerarCSV}>
        <MaterialCommunityIcons name="file-delimited" size={20} color={theme.background} />
        <Text style={styles(theme).botaoExportarText}>{t("exportCSV")}</Text>
      </TouchableOpacity>
    </View>
  );

  const CardRegistro = ({ item }) => {
    const tipo = item.tipo || t("entry");
    const isEntrada = (tipo || "").toLowerCase() === t("entry").toLowerCase();
    return (
      <View style={styles(theme).card}>
        <View style={styles(theme).cardHeader}>
          <View style={styles(theme).badgeTipo(isEntrada)}>
            <Ionicons
              name={isEntrada ? "log-in-outline" : "log-out-outline"}
              size={14}
              color={isEntrada ? "#14532d" : "#7f1d1d"}
            />
            <Text style={styles(theme).badgeTipoText(isEntrada)}>{tipo}</Text>
          </View>
          <Text style={styles(theme).cardPlaca}>
            {item.placa || t("noPlate")}
          </Text>
        </View>

        <View style={styles(theme).divider} />

        <View style={styles(theme).row}>
          <Ionicons name="location-outline" size={16} color={theme.text} />
          <Text style={styles(theme).rowText}>
            {t("spot")}: <Text style={styles(theme).rowStrong}>{item.vaga || "-"}</Text>
          </Text>
        </View>
        <View style={styles(theme).row}>
          <Ionicons name="time-outline" size={16} color={theme.text} />
          <Text style={styles(theme).rowText}>
            {t("datetime")}: <Text style={styles(theme).rowStrong}>{item.dataHora || "-"}</Text>
          </Text>
        </View>
        <View style={styles(theme).row}>
          <Ionicons name="person-circle-outline" size={16} color={theme.text} />
          <Text style={styles(theme).rowText}>
            RM: <Text style={styles(theme).rowStrong}>{item.usuarioRM || "-"}</Text>
          </Text>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles(theme).empty}>
      <Ionicons name="search-outline" size={40} color={theme.text + "88"} />
      <Text style={styles(theme).emptyText}>{t("empty")}</Text>
      <Text style={styles(theme).emptySub}>{t("adjustFilters")}</Text>
    </View>
  );

  return (
    <View style={styles(theme).container}>
      <SecaoTitulo />
      <LinhaFiltro />

      <FlatList
        data={registros}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => <CardRegistro item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      />

      <LinhaExport />
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
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
      marginLeft: 8,
    },
    subtitulo: {
      color: theme.text + "99",
      marginTop: 6,
      marginLeft: 30,
    },
    badgeTotal: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeTotalText: {
      color: theme.background,
      fontWeight: "800",
      fontSize: 12,
    },

    filtros: {
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      padding: 12,
      marginVertical: 12,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
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
    inputRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 10,
    },
    inputWrap: {
      flex: 1,
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
    botaoBuscar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 10,
      gap: 8,
    },
    botaoBuscarText: {
      color: theme.background,
      fontWeight: "800",
      letterSpacing: 0.3,
    },

    card: {
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.text + "10",
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    badgeTipo: (isEntrada) => ({
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: isEntrada ? "#DCFCE7" : "#FEE2E2",
    }),
    badgeTipoText: (isEntrada) => ({
      color: isEntrada ? "#14532d" : "#7f1d1d",
      fontWeight: "700",
      fontSize: 12,
      letterSpacing: 0.2,
    }),
    cardPlaca: {
      color: theme.text,
      fontWeight: "800",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.text + "22",
      marginVertical: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginVertical: 2,
    },
    rowText: {
      color: theme.text,
    },
    rowStrong: {
      fontWeight: "700",
    },

    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      gap: 8,
    },
    emptyText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 6,
    },
    emptySub: {
      color: theme.text + "99",
      fontSize: 13,
    },

    exportRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 6,
    },
    botaoExportar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 10,
      gap: 8,
    },
    botaoExportarText: {
      color: theme.background,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
  });
