import { create } from "zustand";
import { api } from "../lib/api";

export const useAuthStore = create((set, get) => ({
	user: JSON.parse(localStorage.getItem("user") || "null"),
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
			set({ user: data, isReady: true });
		} catch {
			get().clearSession();
			set({ isReady: true });
		}
	}
}));