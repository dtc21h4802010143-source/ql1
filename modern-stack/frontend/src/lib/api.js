import axios from "axios";

const apiBaseUrl = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
	? import.meta.env.VITE_API_URL
	: "/api";

export const api = axios.create({
	baseURL: apiBaseUrl.replace(/\/$/, ""),
	timeout: 15000
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
		if (error?.response?.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		}
		return Promise.reject(error);
	}
);