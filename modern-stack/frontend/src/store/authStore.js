import { create } from "zustand";
import { api } from "../lib/api";

const safeParseUser = (rawUser) => {
	if (!rawUser) return null;

	try {
		const parsed = JSON.parse(rawUser);
		if (!parsed || typeof parsed !== "object") return null;
		return parsed;
	} catch {
		return null;
	}
};

export const useAuthStore = create((set, get) => ({
	user: safeParseUser(localStorage.getItem("user")),
	token: localStorage.getItem("token") || "",
	isReady: false,
	setSession: (session) => {
		localStorage.setItem("token", session.token);
		localStorage.setItem("user", JSON.stringify(session.user));
		set({ token: session.token, user: session.user });
	},
	clearSession: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		set({ token: "", user: null });
	},
	bootstrap: async () => {
		const token = get().token;
		if (!token) {
			set({ isReady: true });
			return;
		}

		try {
			const { data } = await api.get("/auth/me");
			localStorage.setItem("user", JSON.stringify(data));
			set({ user: data, isReady: true });
		} catch {
			get().clearSession();
			set({ isReady: true });
		}
	}
}));