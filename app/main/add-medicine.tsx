import MedicineForm from '@/components/Medicine/MedicineForm';
import React from 'react';
import { View, StyleSheet } from 'react-native';


const AddMedicineScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <MedicineForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default AddMedicineScreen;