import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getUserId, isUserLoggedIn } from "@/services/authService"; // Import session-based services
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      const isLoggedIn = await isUserLoggedIn();
      console.log("Is logged in:", isLoggedIn);
      router.replace(isLoggedIn ? "/home" : "/auth/login");
      console.log("Navigation complete.");
    };
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medi-CoPilot</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: "center", alignItems: "center" }, title: { fontSize: 24, fontWeight: "bold" } });