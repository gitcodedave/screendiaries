import axios from 'axios';

export const API = axios.create({
    baseURL: 'http://localhost:8000',
});

export const getToken = (credentials) => {
    API.post('/auth/jwt/create', credentials)
      .then(response => {
        // Handle the response data
        console.log(response.data);
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });
}
