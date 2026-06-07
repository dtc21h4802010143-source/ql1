import axios from "axios";

const envApiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL?.trim();
const unsafeLocalUrl = envApiUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(envApiUrl);
const normalizedEnvUrl = envApiUrl ? envApiUrl.replace(/\/$/, "") : "";
const apiBaseUrl = normalizedEnvUrl && !unsafeLocalUrl
	? (normalizedEnvUrl.startsWith("/") ? normalizedEnvUrl : `/${normalizedEnvUrl}`)
	: "/api";

export const api = axios.create({
	baseURL: apiBaseUrl,
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