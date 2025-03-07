// profile.js
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.bottomContainer}>
        <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Align content to the top
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20, // Add some padding
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  bottomContainer: {
    width: "100%",
    position: "absolute", // Position at the bottom
    bottom: 20, // Add some space from the bottom
    paddingHorizontal: 20, // Add horizontal padding
  },
});

export default Profile;