import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import CadastroMotoScreen from "./screens/CadastroMotoScreen";
import RelatoriosScreen from "./screens/RelatoriosScreen";
import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext";

// Custom Drawer com botão de alternar tema e logout
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity } from "react-native";

function CustomDrawerContent(props) {
  const { usuario, onLogout, toggleTheme, theme } = props;

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          margin: 20,
          padding: 10,
          backgroundColor: theme.primary,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: theme.background, textAlign: "center", fontWeight: "bold" }}>
          Alternar Tema
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogout}
        style={{
          marginHorizontal: 20,
          padding: 10,
          backgroundColor: "#F44336",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
          Sair
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AppDrawer({ usuario, onLogout }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Drawer.Navigator
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
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Cadastro de Motos">
        {() => <CadastroMotoScreen userRM={usuario?.rm} />}
      </Drawer.Screen>
      <Drawer.Screen name="Relatórios" component={RelatoriosScreen} />
    </Drawer.Navigator>
  );
}

function AuthStack({ handleLoginSuccess }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem("usuarioLogado");
      if (user) setUsuario(JSON.parse(user));
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = async (usuario) => {
    await AsyncStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    setUsuario(usuario);
  };

  const handleLogout = async () => {
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