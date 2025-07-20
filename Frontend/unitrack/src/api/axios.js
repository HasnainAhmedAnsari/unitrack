import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This will proxy to your backend if Vite proxy is set
  withCredentials: true, // if you use cookies/auth
});

export default api;