import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getUserId, isUserLoggedIn, setUserSession } from "@/services/authService"; // Ensure setUserSession is available
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const initializeSession = async () => {
      console.log("Setting user session...");
      await setUserSession("67c97af9ef852e45b8fa5ca0"); // Manually setting session
      console.log("User session set.");
      console.log("Checking authentication...");
      const isLoggedIn = await isUserLoggedIn();
      console.log("Is logged in:", isLoggedIn);
      router.replace(isLoggedIn ? "/home" : "/auth/login");
      console.log("Navigation complete.");
    };
    
    initializeSession();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medi-CoPilot</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" }
});
