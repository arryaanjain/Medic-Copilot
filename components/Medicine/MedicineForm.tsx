import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { addMedicine } from '@/services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const MedicineForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [qty, setQty] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleAddMedicine = async () => {
    setError('');
    if (!title || !qty) {
      setError('Title and quantity are required.');
      return;
    }
    if (isNaN(Number(qty))) {
      setError('Quantity must be a number');
      return;
    }

    setLoading(true);
    try {
      await addMedicine({
        title,
        qty: parseInt(qty, 10),
        purchaseDate: formatDate(purchaseDate),
        expiryDate: formatDate(expiryDate),
      });
      Alert.alert('Success', 'Medicine added successfully!');
      setTitle('');
      setQty('');
      setPurchaseDate(new Date());
      setExpiryDate(new Date());
    } catch (err: any) {
      console.error('Error adding medicine:', err);
      setError(err.message || 'Failed to add medicine.');
    } finally {
      setLoading(false);
    }
  };

  const onChangePurchase = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || purchaseDate;
    setShowPurchasePicker(false);
    setPurchaseDate(currentDate);
  };

  const onChangeExpiry = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || expiryDate;
    setShowExpiryPicker(false);
    setExpiryDate(currentDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>Title:</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Quantity:</Text>
        <TextInput
          style={styles.input}
          value={qty}
          onChangeText={setQty}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Purchase Date:</Text>
        <Button
          title={formatDate(purchaseDate)}
          onPress={() => setShowPurchasePicker(true)}
        />
        {showPurchasePicker && (
          <DateTimePicker
            testID="purchaseDatePicker"
            value={purchaseDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onChangePurchase}
          />
        )}

        <Text style={styles.label}>Expiry Date:</Text>
        <Button
          title={formatDate(expiryDate)}
          onPress={() => setShowExpiryPicker(true)}
        />
        {showExpiryPicker && (
          <DateTimePicker
            testID="expiryDatePicker"
            value={expiryDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onChangeExpiry}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Add Medicine"
          onPress={handleAddMedicine}
          disabled={loading}
        />
        {loading && <ActivityIndicator />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
  },
  label: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default MedicineForm;