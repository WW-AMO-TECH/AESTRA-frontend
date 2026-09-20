import axios from "axios";

const api = axios.create({
  baseURL: "https://aestra.onrender.com/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("Unauthorized API request:", error?.config?.url);
    }

    if (status === 403) {
      console.warn("Access forbidden:", error?.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;