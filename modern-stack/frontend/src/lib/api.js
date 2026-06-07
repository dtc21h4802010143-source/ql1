import axios from "axios";

const envApiUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL?.trim();
const normalizedEnvUrl = envApiUrl ? envApiUrl.replace(/\/$/, "") : "";
let apiBaseUrl = "/api";

if (normalizedEnvUrl) {
	if (normalizedEnvUrl.startsWith("/")) {
		apiBaseUrl = normalizedEnvUrl;
	} else {
		try {
			const parsedUrl = new URL(normalizedEnvUrl);
			const isLocalHost = ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);
			if (!isLocalHost && ["http:", "https:"].includes(parsedUrl.protocol)) {
				apiBaseUrl = normalizedEnvUrl;
			}
		} catch {
			apiBaseUrl = "/api";
		}
	}
}

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