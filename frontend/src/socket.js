import { io } from "socket.io-client";
import CONFIG from "./config";

const socket = io(CONFIG.BACKEND_URL, {
    transports: ["websocket"],
});

export default socket;