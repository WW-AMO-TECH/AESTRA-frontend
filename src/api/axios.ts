import axios from "axios";

/*
|--------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------
| This is the single connection point between React and Laravel backend
*/
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------
| REQUEST INTERCEPTOR (ATTACH TOKEN)
|--------------------------------------------------
*/
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
|--------------------------------------------------
| RESPONSE INTERCEPTOR (HANDLE ERRORS)
|--------------------------------------------------
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 🔥 Handle unauthorized (token expired / invalid)
    if (status === 401) {
      localStorage.removeItem("token");

      // ⚠️ DO NOT force redirect blindly
      // Let React Router/AuthContext handle navigation
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Optional: handle forbidden
    if (status === 403) {
      console.warn("Access forbidden");
    }

    return Promise.reject(error);
  }
);

export default api;