import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function App() {
  const [coordinates, setCoordinates] = useState([]);

  // Load coordinates from storage when the app starts
  useEffect(() => {
    loadCoordinates();
  }, []);

  const loadCoordinates = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@coordinates');
      if (jsonValue != null) {
        setCoordinates(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load coordinates', e);
    }
  };

  const saveCoordinates = async (newCoordinates) => {
    try {
      const jsonValue = JSON.stringify(newCoordinates);
      await AsyncStorage.setItem('@coordinates', jsonValue);
      setCoordinates(newCoordinates);
    } catch (e) {
      console.error('Failed to save coordinates', e);
    }
  };

  const addCoordinate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to add coordinates.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const newCoordinate = { id: Date.now().toString(), latitude, longitude };
    const updatedCoordinates = [...coordinates, newCoordinate];
    saveCoordinates(updatedCoordinates);
  };

  const deleteCoordinate = (id) => {
    const updatedCoordinates = coordinates.filter((coord) => coord.id !== id);
    saveCoordinates(updatedCoordinates);
  };

  return (
    <>
      <View style={styles.headerContainer} />
      <View style={styles.container}>
        <Text style={{ backgroundColor: "#F0F0F0", fontSize: 12, lineHeight: 18, fontWeight: 400, paddingHorizontal: 16, paddingVertical: 9 }}>Coordinates</Text>
        <FlatList
          data={coordinates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.coordinateItem}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16
              }}>
                <Image source={require('@/assets/images/OneDriveLogo.svg')} />
                <Text style={{
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 23,
                }}>{`${item.latitude.toFixed(5)},-${item.longitude.toFixed(5)}`}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteCoordinate(item.id)}>
                <Image source={require('@/assets/images/Trash.svg')} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.noDataContainer}>
            <Image source={require('@/assets/images/Ostor.svg')} />
            <Text style={styles.emptyText1}>Welcome to GPS Store</Text>
            <Text style={styles.emptyText2}>Your GPS store is empty</Text>
          </View>}
        />
        <TouchableOpacity style={styles.fab} onPress={addCoordinate}>
          <Image height={73} width={73} source={require('@/assets/images/Add.svg')} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    height: 55,
    backgroundColor: "#33B5EF",
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  noDataContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20%"
  },
  emptyText1: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 20,
    lineHeight: 30,
    fontWeight: 500
  },
  emptyText2: {
    textAlign: 'center',
    color: '#8B8B8B',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: 400,
    marginTop: 5
  },
});
