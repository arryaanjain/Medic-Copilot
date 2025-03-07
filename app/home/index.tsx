import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { isUserLoggedIn, getUserId } from "../../services/authService";
import Constants from 'expo-constants';
import TreatmentsList from "@/components/TreatmentsList";

interface Medicine {
  _id: string;
  title: string;
  qty: number;
  purchaseDate: string;
  expiryDate: string;
  medicineActive: boolean;
  user_id: string;
}

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const MEDICINES_URL = `${API_BASE_URL}/medicines/active`;

export default function HomeScreen() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeMedicines, setActiveMedicines] = useState<Medicine[]>([]);
  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  const fetchActiveMedicines = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
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

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await isUserLoggedIn();
      if (!isLoggedIn) {
        router.replace("../auth/login");
      } else {
        setAuthChecked(true);
        fetchActiveMedicines(); // Initial fetch
      }
    };

    checkAuth();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveMedicines();
    setRefreshing(false);
  };

  if (!authChecked) return null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <Text style={styles.title}>Your Active Medications</Text>
        {activeMedicines.map((medicine) => (
          <View key={medicine._id} style={styles.card}>
            <Text style={styles.cardTitle}>{medicine.title}</Text>
            <Text>Quantity: {medicine.qty}</Text>
            <Text>Purchase Date: {medicine.purchaseDate}</Text>
            <Text>Expiry Date: {medicine.expiryDate}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Treatments</Text>
        <TreatmentsList onRefresh={onRefresh} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 20,
  },
});