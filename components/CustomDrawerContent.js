import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function CustomDrawerContent(props) {
  const { usuario, onLogout } = props;

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image source={{ uri: usuario.foto }} style={styles.avatar} />
        <Text style={styles.nome}>{usuario.nome}</Text>
        <Text style={styles.rm}>RM: {usuario.rm}</Text>
      </View>

      <DrawerItemList {...props} />

      <TouchableOpacity style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 20,
    
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderColor: '#0E1B35',
    borderWidth: 2,
  },
  nome: {
    color: '#0E1B35',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rm: {
    color: '#0E1B35',
    fontSize: 12,
  },
  logout: {
    marginTop: 20,
    marginLeft: 20,
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
