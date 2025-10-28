// App.js
import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "./screens/../services/firebaseConfig";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import CadastroMotoScreen from "./screens/CadastroMotoScreen";
import RelatoriosScreen from "./screens/RelatoriosScreen";
import "./locales/i18n";
import i18n from "./locales/i18n";

import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext";

import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props) {
  const { usuario, onLogout, toggleTheme, theme } = props;
  const isDark = (theme?.background ?? "#000") !== "#fff";

  // idioma atual
  const currentLang = i18n.language;
  const [lang, setLang] = useState(currentLang);

  const toggleLanguage = async () => {
    const newLang = lang === "pt" ? "es" : "pt";
    setLang(newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("appLanguage", newLang);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.drawerContainer,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Cabeçalho com avatar e nome */}
      <View style={[styles.header, { backgroundColor: theme.inputBackground }]}>
        <Image
          source={{
            uri:
              "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(
                usuario?.displayName || usuario?.email || "U"
              ) +
              "&background=111111&color=B6FF00",
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {usuario?.displayName || "Bem-vindo!"}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text }]}>
            {usuario?.email}
          </Text>
        </View>
      </View>

      {/* Lista padrão de telas */}
      <View style={{ flex: 1, paddingTop: 6 }}>
        <DrawerItemList {...props} />
      </View>

      {/* Ações rápidas no rodapé */}
      <View style={styles.footer}>
        {/* Alternar idioma */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleLanguage}
          style={[styles.rowButton, { backgroundColor: theme.inputBackground }]}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="language"
              size={22}
              color={theme.primary}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {lang === "pt" ? "Idioma: Português 🇧🇷" : "Idioma: Español 🇪🇸"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Alternar tema */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTheme}
          style={[styles.rowButton, { backgroundColor: theme.inputBackground }]}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={theme.primary}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>
              {isDark ? "Tema escuro" : "Tema claro"}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? theme.primary : "#e5e5e5"}
            trackColor={{ false: "#9e9e9e", true: "#3d3d3d" }}
          />
        </TouchableOpacity>

        {/* Sair */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={props.onLogout}
          style={[styles.rowButton, { backgroundColor: theme.inputBackground }]}
        >
          <View style={styles.rowLeft}>
            <MaterialCommunityIcons
              name="logout"
              size={22}
              color="#F44336"
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.rowText, { color: theme.text }]}>Sair</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

/** =========== Drawer com ícones nas telas =========== */
function AppDrawer({ usuario, onLogout }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        drawerStyle: { backgroundColor: theme.background },
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.text,
        drawerLabelStyle: { fontWeight: "600" },
      }}
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          usuario={usuario}
          onLogout={onLogout}
          toggleTheme={toggleTheme}
          theme={theme}
        />
      )}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
          title: "Dashboard",
        }}
      />
      <Drawer.Screen
        name="Cadastro de Motos"
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="motorbike"
              size={size}
              color={color}
            />
          ),
        }}
      >
        {() => <CadastroMotoScreen userRM={usuario?.rm} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Relatórios"
        component={RelatoriosScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

/** =========== Auth Stack =========== */
function AuthStack({ handleLoginSuccess }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => (
          <RegisterScreen {...props} onRegisterSuccess={handleLoginSuccess} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

/** =========== App Root =========== */
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão e idioma do AsyncStorage
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await AsyncStorage.getItem("usuarioLogado");
        const savedLang = await AsyncStorage.getItem("appLanguage");
        if (savedLang) i18n.changeLanguage(savedLang);
        if (user) setUsuario(JSON.parse(user));
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = async (u) => {
    const normalized = {
      uid: u?.uid,
      email: u?.email,
      rm: u?.rm ?? null,
      displayName: u?.displayName ?? null,
    };
    await AsyncStorage.setItem("usuarioLogado", JSON.stringify(normalized));
    setUsuario(normalized);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    await AsyncStorage.removeItem("usuarioLogado");
    setUsuario(null);
  };

  if (loading) return null;

  return (
    <ThemeProvider>
      <NavigationContainer>
        {usuario ? (
          <AppDrawer usuario={usuario} onLogout={handleLogout} />
        ) : (
          <AuthStack handleLoginSuccess={handleLoginSuccess} />
        )}
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  header: {
    margin: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 10,
  },
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
