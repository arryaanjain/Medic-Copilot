import React from "react";
import { Button } from "react-native";
import { useRouter } from "expo-router";
import { removeToken } from "../services/authService";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace("../auth/login");
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
