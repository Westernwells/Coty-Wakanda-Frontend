import Axios, { InternalAxiosRequestConfig } from "axios";
// import Cookies from "js-cookie";

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
    // const token = Cookies.get("token");

    config.headers.authorization = `Bearer 7|53qPXDCL7ZZAU0D7SCyV0y9rNy5MiYmRJE8QnhDC2d2c9d0a`;
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
        return Promise.reject(error);
    }
);