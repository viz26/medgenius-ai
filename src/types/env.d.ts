/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GROQ_API_URL: string
  readonly GROQ_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 