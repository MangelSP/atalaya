export type Tip = { easy: boolean; cheapModel: string } | null

declare module 'claude-code' {
  interface PluginState {
    'model-advisor': { tip: Tip }
  }
}
