import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { isAuthenticated } from "../../services/authService";

export default function HomeScreen() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      if (!auth) {
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
