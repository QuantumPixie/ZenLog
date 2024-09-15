interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_BASE_URL?: string // Make it optional
  // Add any other environment variables you're using
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
