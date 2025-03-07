import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const USER_ID_KEY = "mediCopilotUserId";

const SESSION_KEY = "user_session";

// Forcefully set a session ID (for testing purposes)
export const setUserSession = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    console.log("User session set:", userId);
  } catch (error) {
    console.error("Error setting user session:", error);
  }
};

export const saveUserId = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    console.log("User ID saved:", userId);
  } catch (error) {
    console.error("Error saving user ID:", error);
  }
};

export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    console.log("Retrieved User ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error retrieving user ID:", error);
    return null;
  }
};

export const removeUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    console.log("User ID removed from AsyncStorage");
  } catch (error) {
    console.error("Error removing user ID:", error);
  }
};

export const isUserLoggedIn = async (): Promise<boolean> => {
  const userId = await getUserId();
  if (userId) {
    console.log("User is logged in.");
    return true;
  } else {
    console.log("User is not logged in.");
    return false;
  }
};

const TOKEN_KEY = "squashTomatoes"; // Corrected key
//squashTomatoes

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token); // Use TOKEN_KEY
    console.log("Token saved:", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY); // Use TOKEN_KEY
    console.log("Retrieved Token:", token);
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log("Token removed from AsyncStorage");
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();

  if (!token) {
    console.log("No token found, user is not authenticated.");
    return false;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.log("Token has expired.");
      await removeToken();
      return false;
    }

    console.log("Token is valid.");
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};     