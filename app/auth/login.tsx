// login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { saveUserId } from "../../services/authService"; // Import session-based service
import { loginUser } from "../../services/api"; // Import loginUser from api

const LOGIN_URL = process.env.EXPO_PUBLIC_LOGIN_URL || "http://192.168.0.114:5002/login"; // Use env variable

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Error", "Phone number and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await saveUserId(data.user_id); // Save user ID instead of token
        router.replace("../home"); // Navigate to home on success
      } else {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Failed to connect to the server. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading ? styles.disabledButton : styles.enabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")} style={styles.registerLink}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  enabledButton: {
    backgroundColor: "#3b82f6",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: "#3b82f6",
  },
});

export default LoginScreen;