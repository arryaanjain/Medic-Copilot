import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { isUserLoggedIn, getUserId } from "../../services/authService";
import Constants from 'expo-constants';


interface Medicine {
  _id: string; // Or ObjectId
  title: string;
  qty: number;
  purchaseDate: string;
  expiryDate: string;
  medicineActive: boolean;
  user_id: string;
  // Add other properties if necessary
}

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.0.114:5000';
const MEDICINES_URL = `${API_BASE_URL}/medicines/active`; // New API endpoint

export default function HomeScreen() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeMedicines, setActiveMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await isUserLoggedIn();
      if (!isLoggedIn) {
        router.replace("../auth/login");
      } else {
        setAuthChecked(true);
      }
    };

    const fetchActiveMedicines = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          return; // User not logged in
        }
        const response = await fetch(`${MEDICINES_URL}?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch active medicines");
        }
        const data = await response.json();
        setActiveMedicines(data);
      } catch (error) {
        console.error("Error fetching active medicines:", error);
      }
    };

    checkAuth();
    fetchActiveMedicines();
  }, []);

  if (!authChecked) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Active Medications</Text>
      {activeMedicines.map((medicine) => (
        <View key={medicine._id} style={styles.card}>
          <Text style={styles.cardTitle}>{medicine.title}</Text>
          <Text>Quantity: {medicine.qty}</Text>
          <Text>Purchase Date: {medicine.purchaseDate}</Text>
          <Text>Expiry Date: {medicine.expiryDate}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.25, // iOS shadow
    shadowRadius: 3.84, // iOS shadow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});