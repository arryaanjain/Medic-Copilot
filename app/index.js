import { useState, useEffect } from 'react';
import { View, Button, Image, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const API_URL = "http://192.168.0.114:5000/extract_text"; // Replace with your local IP

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        console.error("[ERROR] Camera permission denied");
        Alert.alert("Permission Required", "Camera access is needed to take pictures.");
      } else {
        console.log("[INFO] Camera permission granted");
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      console.log("[INFO] Opening camera...");
      let result = await ImagePicker.launchCameraAsync({ base64: false });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        console.log("[SUCCESS] Image captured:", result.assets[0].uri);
      } else {
        console.warn("[WARNING] Camera was opened but no image was selected.");
      }
    } catch (error) {
      console.error("[ERROR] Error picking image:", error);
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  const sendImageToAPI = async () => {
    if (!image) {
      console.warn("[WARNING] No image to send");
      Alert.alert("No Image", "Please capture an image first.");
      return;
    }

    console.log("[INFO] Sending image to API:", image);

    let formData = new FormData();
    formData.append('image', { uri: image, name: 'medicine.jpg', type: 'image/jpeg' });

    try {
      let response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("[SUCCESS] API Response:", response.data);
      setText(response.data.extracted_text);
    } catch (error) {
      console.error("[ERROR] API request failed:", error);
      Alert.alert("Error", "Failed to extract text from image.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Capture Medicine" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 10 }} />}
      <Button title="Extract Text" onPress={sendImageToAPI} />
      <Text style={{ marginTop: 20 }}>{text}</Text>
    </View>
  );
}
