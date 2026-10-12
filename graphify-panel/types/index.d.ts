export type GraphNode = {
  id: string
  label: string
  file_type?: string
  community?: number
  norm_label?: string
}

export type GraphData = {
  nodes?: GraphNode[]
  edges?: Array<{ source: string; target: string }>
}

export type State = {
  graph: GraphData | null
  hasFile: boolean
  projectPath: string
}

declare module 'claude-code' {
  interface PluginState {
    'graphify-panel': { state: State }
  }
}
