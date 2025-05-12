import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import CadastroMotoScreen from './screens/CadastroMotoScreen';
import RelatoriosScreen from './screens/RelatoriosScreen';
import CustomDrawerContent from './components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('usuarioLogado');
      if (user) setUsuario(JSON.parse(user));
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = async (usuario) => {
    await AsyncStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    setUsuario(usuario);
  };
  

  const handleLogout = async () => {
    await AsyncStorage.removeItem('usuarioLogado');
    setUsuario(null);
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      {usuario ? (
        <Drawer.Navigator
          drawerContent={(props) => (
            <CustomDrawerContent {...props} usuario={usuario} onLogout={handleLogout} />
          )}
          initialRouteName="Dashboard"
        >
          <Drawer.Screen name="Dashboard" component={DashboardScreen} />
          <Drawer.Screen name="Cadastro de Motos">
            {() => <CadastroMotoScreen userRM={usuario.rm} />}
          </Drawer.Screen>
          <Drawer.Screen name="Relatórios" component={RelatoriosScreen} />
        </Drawer.Navigator>
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
}
