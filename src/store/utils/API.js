import axios from "axios";

const backendOrigin = (
  process.env.REACT_APP_BACKEND_API || "https://api.odatransportation.com"
    //  "http://localhost:5100"

)
  .trim()
  .replace(/\/$/, "");

// Create an Axios instance with a base URL (API host; paths include /api/v1/...)
export const BACKEND_API = axios.create({
  baseURL: backendOrigin,
});

BACKEND_API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-type"] = "application/json; charset=UTF-8";

    return config;
  },
  (error) => Promise.reject(error)
);

// The backend always returns { message, error, status, ... } with a clean,
// user-safe message (see ODA-TRANSPORTATION's errorSanitizer.js). Not every
// component reads `error.response.data.message` — some read the axios
// error's own `.message`, which defaults to a generic string like "Request
// failed with status code 400". Rewriting it here means EVERY catch block,
// old or new, sees the same clean backend text no matter which property it
// reads, without having to fix each call site individually.
BACKEND_API.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage =
      error?.response?.data?.message || error?.response?.data?.error;
    if (backendMessage) {
      error.message = backendMessage;
    } else if (error?.request && !error?.response) {
      // Request went out but no response came back (offline, timeout, CORS,
      // server down) — axios's default message here is already reasonably
      // clear, but pin a friendlier one for consistency.
      error.message = "Unable to reach the server. Please check your connection and try again.";
    }
    return Promise.reject(error);
  }
);

export default BACKEND_API;
