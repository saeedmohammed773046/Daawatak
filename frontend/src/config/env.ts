export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://daawatak.onrender.com/api/v1',
  appName: 'Daawatak',
  appNameAr: 'دعوتك',
  mockDelayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS || 500),
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  reverbHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
  reverbPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  reverbScheme: import.meta.env.VITE_REVERB_SCHEME || 'ws',
  reverbKey: import.meta.env.VITE_REVERB_APP_KEY || 'daawatak_key',
}

