import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { isUserLoggedIn } from "../../services/authService"; // Import session-based service

export default function HomeScreen() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await isUserLoggedIn(); // Use session-based check
      if (!isLoggedIn) {
        router.replace("../auth/login");
      } else {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) return null; // Prevent rendering before auth check

  return (
    <View>
      <Text>Welcome to Home</Text>
    </View>
  );
}