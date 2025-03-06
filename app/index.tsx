import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getToken } from "@/services/authService";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      router.replace(token ? "/home" : "/auth/login");
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
