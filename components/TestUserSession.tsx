import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getUserId } from '@/services/authService'; // Adjust the import path as needed

const UserIdTestComponent = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await getUserId();
      setUserId(storedUserId);
    };

    fetchUserId();
  }, []);

  const handleRefresh = async () => {
    const storedUserId = await getUserId();
    setUserId(storedUserId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User ID Test</Text>
      {userId ? (
        <Text style={styles.userIdText}>User ID: {userId}</Text>
      ) : (
        <Text style={styles.userIdText}>User ID: Not found</Text>
      )}
      <Button title="Refresh User ID" onPress={handleRefresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userIdText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default UserIdTestComponent;