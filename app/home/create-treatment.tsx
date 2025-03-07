// CreateTreatmentScreen.tsx (Screen Code)
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getUserId } from "../../services/authService";
import { addTreatment } from "../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';

interface MedicineInput {
  medicine_name: string;
  dosage: string;
  frequency: string;
}

export default function CreateTreatmentScreen() {
  const router = useRouter();
  const [treatmentName, setTreatmentName] = useState("");
  const [medicines, setMedicines] = useState<MedicineInput[]>([{ medicine_name: "", dosage: "", frequency: "" }]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { medicine_name: "", dosage: "", frequency: "" }]);
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field as keyof MedicineInput] = value;
    setMedicines(updatedMedicines);
  };

  const handleCreateTreatment = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const treatmentData = {
        user_id: userId,
        treatment_name: treatmentName,
        medicines: medicines,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined,
        notes: notes,
      };

      await addTreatment(treatmentData);
      Alert.alert("Success", "Treatment added successfully.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add treatment.");
    }
  };

  const onStartDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || startDate || new Date();
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || endDate || new Date();
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Treatment</Text>

      <TextInput
        style={styles.input}
        placeholder="Treatment Name"
        value={treatmentName}
        onChangeText={setTreatmentName}
      />

      <Text style={styles.subtitle}>Medicines</Text>
      {medicines.map((medicine, index) => (
        <View key={index} style={styles.medicineContainer}>
          <TextInput
            style={styles.medicineInput}
            placeholder="Medicine Name"
            value={medicine.medicine_name}
            onChangeText={(text) => handleMedicineChange(index, "medicine_name", text)}
          />
          <TextInput
            style={styles.medicineInput}
            placeholder="Dosage"
            value={medicine.dosage}
            onChangeText={(text) => handleMedicineChange(index, "dosage", text)}
          />
          <TextInput
            style={styles.medicineInput}
            placeholder="Frequency"
            value={medicine.frequency}
            onChangeText={(text) => handleMedicineChange(index, "frequency", text)}
          />
        </View>
      ))}
      <Button title="Add Medicine" onPress={handleAddMedicine} />

      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartDatePicker(true)}>
        <Text>{startDate ? startDate.toLocaleDateString() : "Select Start Date"}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onStartDateChange}
        />
      )}

      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEndDatePicker(true)}>
        <Text>{endDate ? endDate.toLocaleDateString() : "Select End Date"}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onEndDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Button title="Create Treatment" onPress={handleCreateTreatment} />
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
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  medicineContainer: {
    marginBottom: 8,
  },
  medicineInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center'
  },
});