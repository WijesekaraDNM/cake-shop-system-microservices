import { userApi } from "../axiosconfig";
import { toast } from "react-toastify";

export const getUser = () =>
localStorage.getItem('user')
? JSON.parse(localStorage.getItem('user'))
: null;

export const login = async (email, password) => {
    try {
      const { data } = await userApi.post('/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      console.log("login result: ", data);
      return data;
    } catch (error) {
      // Safely log error response data if exists
      if (error.response && error.response.data) {
        console.error("Login error:", error.response.data);
  
        const errData = error?.response?.data;
  
        // Show specific toast error messages by error code
        if (errData.code === 'USER_NOT_FOUND') {
          toast.error("No user found with this email.");
        } else if (errData.code === 'INVALID_PASSWORD') {
          toast.error("Password is incorrect.");
        } else if (errData.code === 'USER_EXISTS') {
          toast.error(errData.message);
        } else if (errData.message) {
          toast.error(errData.message);
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
  
        // Throw the error data for further handling in frontend if needed
        throw errData;
      } else {
        // For unexpected errors or network issues, log and toast generic error
        console.error("Login error - no response:", error);
        toast.error("Network or server error during login.");
        throw new Error("Network or server error during login.");
      }
    }
};


export const register = async registerData => {
    try {
      const { data } = await userApi.post('/register', registerData);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Registration error:", error.response.data);
  
        const errData = error.response.data;
  
        // Show specific toast error messages by error code
        if (errData.code === 'EMAIL_ALREADY_EXISTS') {
          toast.error("Email is already registered.");
        } else if (errData.code === 'INVALID_DATA') {
          toast.error("Invalid registration data provided.");
        } else if (errData.message) {
          toast.error(errData.message);
        } else {
          toast.error("Registration failed. Please try again.");
        }
  
        throw errData;
      } else {
        console.error("Registration error - no response:", error);
        toast.error("Network or server error during registration.");
        throw new Error("Network or server error during registration.");
      }
    }
};

export const logout =() => {
    localStorage.removeItem('user');
};