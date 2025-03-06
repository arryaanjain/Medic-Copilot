import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

const RESGISTER_URL = process.env.EXPO_PUBLIC_REGISTER_URL || "http://192.168.0.114:5000/register";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<{ name: string; phone: string; password: string; confirmPassword: string }>({
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
      const response = await fetch(RESGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          password: form.password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registration successful!", [
          { text: "OK", onPress: () => router.replace("/auth/login") },
        ]);
      } else {
        Alert.alert("Error", data.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-6">Register</Text>

      <TextInput
        className="w-full p-3 border rounded-lg mb-4"
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
      />
      <TextInput
        className="w-full p-3 border rounded-lg mb-4"
        placeholder="Phone"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
      />
      <TextInput
        className="w-full p-3 border rounded-lg mb-4"
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />
      <TextInput
        className="w-full p-3 border rounded-lg mb-4"
        placeholder="Confirm Password"
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
      />

      <TouchableOpacity
        className="w-full bg-blue-500 p-3 rounded-lg"
        onPress={handleRegister}
      >
        <Text className="text-white text-center font-semibold">Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <Text className="text-blue-500 mt-4">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
