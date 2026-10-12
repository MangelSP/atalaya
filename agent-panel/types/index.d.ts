export type Call = {
  id: string
  tool: string
  isDone: boolean
  isError?: boolean
  agent?: string // etiqueta del subagente, o '' para el hilo principal
  detail?: string // ej. tipo de subagente, o comando corto
}

declare module 'claude-code' {
  interface PluginState {
    'agent-panel': { calls: Call[] }
  }
}
