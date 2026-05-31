import { create } from "zustand";

export const useUiStore = create((set) => ({
	theme: localStorage.getItem("theme") || "light",
	setTheme: (theme) => {
		localStorage.setItem("theme", theme);
		document.documentElement.classList.toggle("dark", theme === "dark");
		set({ theme });
	}
}));