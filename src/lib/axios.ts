import Axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = Cookies.get("token");
  config.headers.authorization = `Bearer ${token}`;
  config.headers.Accept = "application/json";
  return config;
}

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_SERVER_URL,
});

axios.interceptors.request.use(authRequestInterceptor);
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    toast.error(error.response.data.message);
    return Promise.reject(error);
  }
);
