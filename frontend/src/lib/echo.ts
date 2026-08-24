import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

import { env } from "@/config/env";

export function initEcho(token?: string): Echo<any> | null {
  if (typeof window === "undefined") return null;

  window.Pusher = Pusher;

  window.Echo = new Echo({
    broadcaster: "reverb",
    key: env.reverbKey,
    wsHost: env.reverbHost,
    wsPort: env.reverbPort,
    wssPort: env.reverbPort,
    forceTLS: env.reverbScheme === "wss",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${env.apiUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  });

  return window.Echo;
}
