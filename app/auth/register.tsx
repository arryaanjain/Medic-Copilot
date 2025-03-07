// register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { registerUser } from "../../services/api";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      Alert.alert("Error", "Enter a valid 10-digit phone number.");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      await registerUser(form.name.trim(), form.phone.trim(), form.password.trim());
      Alert.alert("Success", "Registration successful!", [
        { text: "OK", onPress: () => router.replace("/auth/login") },
      ]);
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")} style={styles.loginLink}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 16,
  },
  loginText: {
    color: "#3b82f6",
  },
});

export default RegisterScreen;