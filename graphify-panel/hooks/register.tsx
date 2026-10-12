import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { GraphData } from '../types'

const state = atom(
  { plugin: 'graphify-panel', key: 'state' } as const,
  { graph: null as GraphData | null, hasFile: false, projectPath: '' },
)

const PANE = 'graphify-panel'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'graphify-panel',
      description: 'Abre el panel del grafo del proyecto',
    })
    // Inicializa el estado con el CWD actual
    await update($, state, s => ({
      ...s,
      projectPath: e.cwd,
      hasFile: false, // Por ahora, espera a que el usuario corra /graphify
    }))
    void $.ui.open({ id: PANE, title: '📈 Grafo del proyecto' })
    return next(e)
  })

  on('command.run', { command: 'graphify-panel' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Grafo del proyecto' })
    return { text: 'Panel de grafo abierto.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const s = await read($, state)

    if (!s.hasFile || !s.graph) {
      return (
        <Box flexDirection="column">
          <Text bold color="blue">📈 Grafo del proyecto</Text>
          <Text dimColor>Mapeo visual de componentes y conexiones</Text>
          <Text></Text>
          <Text dimColor>Sin grafo generado aún.</Text>
          <Text></Text>
          <Text dimColor>Corre:</Text>
          <Text bold color="cyan">  /graphify</Text>
          <Text></Text>
          <Text dimColor>para generar el grafo con nodos (conceptos,</Text>
          <Text dimColor>archivos, componentes) y sus conexiones.</Text>
        </Box>
      )
    }

    const nodes = s.graph.nodes || []
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 5)
    const communityColors: Record<number, string> = {
      0: 'cyan',
      1: 'green',
      2: 'yellow',
      3: 'magenta',
    }

    return (
      <Box flexDirection="column">
        <Text bold color="blue">📈 {nodes.length} nodos</Text>
        <Text dimColor>{s.graph.edges?.length || 0} conexiones</Text>
        <Text></Text>
        {nodes.slice(0, room).map(n => (
          <Text key={n.id} dimColor={n.file_type === 'document'}>
            <Text
              color={
                communityColors[n.community ?? 0] || 'white'
              }
            >
              ●
            </Text>{' '}
            <Text bold>{n.label}</Text>
            <Text dimColor> {n.file_type}</Text>
          </Text>
        ))}
        {nodes.length > room && (
          <Text dimColor>+{nodes.length - room} más…</Text>
        )}
      </Box>
    )
  })
}
