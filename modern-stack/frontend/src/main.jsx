import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { App } from "./App";
import { useAuthStore } from "./store/authStore";
import { useUiStore } from "./store/uiStore";
import "./styles.css";
import { I18nProvider } from "./lib/i18n";

useUiStore.getState().setTheme(useUiStore.getState().theme);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
				<I18nProvider>
					<App />
				</I18nProvider>
				<Toaster richColors position="top-right" />
			</BrowserRouter>
	</React.StrictMode>
);