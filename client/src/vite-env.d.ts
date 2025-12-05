/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_OAUTH_PORTAL_URL: string;
  readonly VITE_APP_ID: string;
  // Tambahkan env vars lain yang kamu pakai
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
