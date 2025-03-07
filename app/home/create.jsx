import React from 'react';
import { View, Text } from 'react-native';
import AddMedicineScreen from '@/app/main/add-medicine';
import MedicineForm from '@/components/Medicine/MedicineForm';

const Create = () => {
    return (
        <View>
            <MedicineForm />
        </View>
    );
}

export default Create