import axios from 'axios';

export const API = axios.create({
    baseURL: 'http://localhost:8000',
});

export const getToken = async (credentials) => {
    try {
      const response = await API.post('/auth/jwt/create', credentials);
      return response.data;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  export const register = async (credentials) => {
    try {
      const response = await API.post('/auth/users/', credentials);
      return response
    } catch (error) {
      
      return error;
    }
  };
