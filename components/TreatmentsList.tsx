import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { getUserId } from "@/services/authService";
import { getTreatments } from "@/services/api";

interface Treatment_GET {
  _id: string;
  treatment_name: string;
  start_date: string;
  end_date?: string;
  notes: string;
  medicines: {
    medicine_name: string;
    dosage: string;
    frequency: string;
  }[];
}

interface TreatmentsListProps {
  onRefresh: () => void;
}

const TreatmentsList: React.FC<TreatmentsListProps> = ({ onRefresh }) => {
  const [treatments, setTreatments] = useState<Treatment_GET[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTreatments = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        setError("User not logged in.");
        setIsLoading(false);
        return;
      }

      const data = await getTreatments(userId);
      setTreatments(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch treatments.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTreatments();
    setRefreshing(false);
    onRefresh(); // Call the parent's refresh function
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {treatments.map((treatment) => (
        <View key={treatment._id} style={styles.card}>
          <Text style={styles.cardTitle}>{treatment.treatment_name}</Text>
          <Text>Start Date: {treatment.start_date}</Text>
          {treatment.end_date && <Text>End Date: {treatment.end_date}</Text>}
          <Text>Notes: {treatment.notes}</Text>
          <Text>Medicines:</Text>
          {treatment.medicines.map((medicine, index) => (
            <View key={index} style={styles.medicineItem}>
              <Text>- {medicine.medicine_name}</Text>
              <Text>  Dosage: {medicine.dosage}</Text>
              <Text>  Frequency: {medicine.frequency}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  medicineItem: {
    marginLeft: 10,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export default TreatmentsList;