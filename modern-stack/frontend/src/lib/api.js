import axios from "axios";

const envApiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL?.trim();
const apiBaseUrl = envApiUrl && envApiUrl !== "" ? envApiUrl : "/api";
const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "") || "/api";

export const api = axios.create({
	baseURL: normalizedBaseUrl,
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