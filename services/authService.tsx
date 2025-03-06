import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken";

/**
 * Save JWT token in AsyncStorage.
 * @param token - JWT token from login response.
 */
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("token", token);
    console.log("Token saved:", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

/**
 * Retrieve JWT token from AsyncStorage.
 * @returns {Promise<string | null>} The stored token or null if not found.
 */

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("Retrieved Token:", token);
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Remove JWT token (Logout user).
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

/**
 * Check if user is authenticated.
 * @returns {Promise<boolean>} True if user is logged in, otherwise false.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token; // Returns true if token exists, otherwise false
};
