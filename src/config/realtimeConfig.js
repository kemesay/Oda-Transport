/**
 * Socket.IO client settings — must match backend SOCKET_IO_PATH (default /api/v1/socket.io).
 */

export const DEFAULT_SOCKET_IO_PATH = "/api/v1/socket.io";

/**
 * HTTP origin for Socket.IO (no /api/v1 suffix).
 */
export function getSocketServerUrl() {
  const explicit = process.env.REACT_APP_SOCKET_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const apiBase = (
    process.env.REACT_APP_BACKEND_API ||
    "https://api.odatransportation.com"
  )
    .trim()
    .replace(/\/$/, "");

  return apiBase.replace(/\/api\/v1\/?$/i, "") || apiBase;
}

export function getSocketIoPath() {
  const path = (
    process.env.REACT_APP_SOCKET_IO_PATH || DEFAULT_SOCKET_IO_PATH
  ).trim();
  return path.startsWith("/") ? path : `/${path}`;
}

export function getSocketClientOptions() {
  return {
    path: getSocketIoPath(),
    transports: ["polling", "websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    timeout: 20000,
  };
}
