import Constants from 'expo-constants';
import { saveUserId, getUserId } from '@/services/authService'; // Import new services

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://10.0.16.189:5002'; //10.0.16.189
const LOGIN_URL = `${API_BASE_URL}/login`;
const REGISTER_URL = `${API_BASE_URL}/register`;
const MEDICINES_URL = `${API_BASE_URL}/medicines`;
const TREATMENTS_URL = `${API_BASE_URL}/add_treatment`;
const TREATMENTS_GET_URL = `${API_BASE_URL}/treatments`;

interface Treatment {
  _id: string;
  treatment_name: string;
  start_date: string;
  end_date?: string;
  notes: string;
  medicines: {
    medicine_name: string;
    dosage: string;
    frequency: string;
  }[];
}

export const getTreatments = async (userId: string): Promise<Treatment[]> => {
  try {
    const response = await fetch(`${TREATMENTS_GET_URL}?user_id=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch treatments");
    }
    const data: Treatment[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching treatments:", error);
    throw error;
  }
};



export const loginUser = async (phone: string, password: string) => {
  try {
    console.log("Login Request:", {
      url: LOGIN_URL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    console.log("Login Response:", {
      status: response.status,
      headers: response.headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Login Response Error Data:", errorData);
      throw new Error(errorData.error || "Login failed");
    }

    const responseData = await response.json();
    const userId = responseData.user_id; // Get user ID from response
    if(userId){
      saveUserId(userId); // Save user ID
    }
    console.log("Login Response Data:", responseData);
    return responseData;
  } catch (error: any) {
    console.error("Login Error:", error.message, error);
    throw new Error(error.message || "Failed to connect to the server.");
  }
};

export const registerUser = async (name: string, phone: string, password: string) => {
  try {
    console.log("Register Request:", {
      url: REGISTER_URL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });

    const response = await fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password }),
    });

    console.log("Register Response:", {
      status: response.status,
      headers: response.headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Register Response Error Data:", errorData);
      throw new Error(errorData.error || "Registration failed");
    }

    const responseData = await response.json();
    console.log("Register Response Data:", responseData);
    return responseData;
  } catch (error: any) {
    console.error("Register Error:", error.message, error);
    throw new Error(error.message || "Something went wrong. Please try again.");
  }
};

export const addMedicine = async (medicineData: {
  title: string;
  qty: number;
  purchaseDate: string;
  expiryDate: string;
}) => {
  try {
    const userId = await getUserId(); // Get user ID
    if (!userId) {
      throw new Error("User not logged in");
    }

    console.log("Add Medicine Request:", {
      url: MEDICINES_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...medicineData, userId }), // Send userId in body
    });

    const response = await fetch(MEDICINES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...medicineData, userId }), // Send userID in body
    });

    console.log("Add Medicine Response:", {
      status: response.status,
      headers: response.headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Add Medicine Response Error Data:", errorData);
      throw new Error(errorData.error || 'Failed to add medicine');
    }

    const responseData = await response.json();
    console.log("Add Medicine Response Data:", responseData);
    return responseData;
  } catch (error: any) {
    console.error("Add Medicine Error:", error.message, error);
    throw new Error(error.message || 'Failed to add medicine.');
  }
};


  interface MedicineInput {
    medicine_name: string;
    dosage: string;
    frequency: string;
  }
  
  interface TreatmentData {
    user_id: string;
    treatment_name: string;
    medicines: MedicineInput[];
    start_date?: string;
    end_date?: string;
    notes?: string;
  }
  
  export const addTreatment = async (treatmentData: TreatmentData) => {
    try {
      const response = await fetch(TREATMENTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(treatmentData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add treatment");
      }
  
      return response.json();
    } catch (error: any) {
      console.error("Error adding treatment:", error);
      throw error;
    }
  };