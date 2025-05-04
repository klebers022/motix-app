import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import CadastroMotoScreen from './screens/CadastroMotoScreen';
import RelatoriosScreen from './screens/RelatoriosScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('usuarioLogado');
      if (user) setIsAuthenticated(true);
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = async () => {
    await AsyncStorage.setItem('usuarioLogado', JSON.stringify({ rm: '557887' }));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('usuarioLogado');
    setIsAuthenticated(false);
  };

  

  if (loading) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Drawer.Navigator initialRouteName="Dashboard">
          <Drawer.Screen name="Dashboard" component={DashboardScreen} />
          <Drawer.Screen name="Cadastro de Motos">
            {() => <CadastroMotoScreen userRM="557887" />}
          </Drawer.Screen>
          <Drawer.Screen name="Relatórios" component={RelatoriosScreen} />
          <Drawer.Screen name="Sair" component={handleLogout} />
        </Drawer.Navigator>
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E1B35',
  },
  logoutText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#B6FF00',
    padding: 15,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
