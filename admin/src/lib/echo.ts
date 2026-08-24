import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

export function initEcho(token?: string): Echo<any> | null {
  if (typeof window === "undefined") return null;

  window.Pusher = Pusher;

  // Use configuration from environment variables or sensible defaults
  const host = process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname;
  const port = process.env.NEXT_PUBLIC_REVERB_PORT || "8080";
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || "ws";

  window.Echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "daawatakkey",
    wsHost: host,
    wsPort: parseInt(port),
    wssPort: parseInt(port),
    forceTLS: scheme === "wss",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || "/api/v1"}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  });

  return window.Echo;
}
