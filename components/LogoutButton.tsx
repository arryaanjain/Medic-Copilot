import React from "react";
import { Button } from "react-native";
import { useRouter } from "expo-router";
import { removeUserId } from "../services/authService"; // Import session-based service

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    console.log("Logout started");
    await removeUserId(); // Use session-based removal
    console.log("User ID removal complete");
    router.replace("../auth/login");
    console.log("Navigation to login");
  };

  return <Button title="Logout" onPress={handleLogout} />;
}