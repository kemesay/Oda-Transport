import { io } from "socket.io-client";
import {
  getSocketClientOptions,
  getSocketServerUrl,
} from "../config/realtimeConfig";

let socket = null;
let joinedToken = null;
let connectErrorLogged = false;

export function connectPaymentSocket() {
  if (socket?.connected) return socket;

  const url = getSocketServerUrl();
  const options = getSocketClientOptions();

  socket = io(url, options);

  socket.on("connect_error", (err) => {
    if (!connectErrorLogged && process.env.NODE_ENV !== "production") {
      connectErrorLogged = true;
      console.warn(
        `[Socket.IO] Could not connect to ${url}${options.path}. ` +
          "Payment updates will use API polling. Ensure the API proxy forwards WebSocket upgrades.",
        err?.message || err
      );
    }
  });

  socket.on("connect", () => {
    connectErrorLogged = false;
  });

  return socket;
}

export function disconnectPaymentSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    joinedToken = null;
    connectErrorLogged = false;
  }
}

export function subscribeToBookingPayment({ roomToken, onUpdate }) {
  if (!roomToken || typeof onUpdate !== "function") {
    return () => {};
  }

  const client = connectPaymentSocket();

  const joinRoom = () => {
    if (joinedToken !== roomToken) {
      client.emit("join", { token: roomToken });
      joinedToken = roomToken;
    }
  };

  const handler = (payload) => onUpdate(payload);

  client.on("connect", joinRoom);
  client.on("payment.transaction.updated", handler);
  if (client.connected) {
    joinRoom();
  }

  return () => {
    client.off("connect", joinRoom);
    client.off("payment.transaction.updated", handler);
    if (joinedToken === roomToken) {
      client.emit("leave", { token: roomToken });
      joinedToken = null;
    }
  };
}
