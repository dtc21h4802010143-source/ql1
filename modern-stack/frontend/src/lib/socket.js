import { io } from "socket.io-client";

const socketUrl = import.meta.env?.VITE_SOCKET_URL || (
	typeof window !== "undefined" && window.location.hostname === "localhost"
		? "http://localhost:5050"
		: window.location.origin
);

export const socket = io(socketUrl, {
	autoConnect: false,
	withCredentials: true
});