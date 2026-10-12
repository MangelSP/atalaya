export type RateLimit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'token-budget': { limits: RateLimit[] | null }
  }
}
