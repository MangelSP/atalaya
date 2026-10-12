import type { Register } from 'claude-code'

const PANE = 'atalaya'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'atalaya',
      description: 'Abre el dashboard central de Atalaya',
    })
    void $.ui.open({ id: PANE, title: '⚔️ Atalaya' })
    return next(e)
  })

  on('command.run', { command: 'atalaya' }, async $ => {
    await $.ui.open({ id: PANE, title: '⚔️ Atalaya' })
    return { text: 'Dashboard de Atalaya abierto.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Text bold color="cyan">
          ⚔️ ATALAYA
        </Text>
        <Text dimColor>Vigía de tokens, agentes y grafo del proyecto</Text>
        <Text></Text>

        <Text bold>📊 Mods disponibles</Text>
        <Text dimColor>────────────────────</Text>

        <Box>
          <Text color="yellow">💰 token-budget</Text>
          <Text dimColor>  % de límites 5h/semana/premium</Text>
        </Box>

        <Box>
          <Text color="green">👥 agent-panel</Text>
          <Text dimColor>  Tools y subagentes corriendo | /agent-panel</Text>
        </Box>

        <Box>
          <Text color="magenta">🧠 model-advisor</Text>
          <Text dimColor>  Sugiere modelo barato (automático)</Text>
        </Box>

        <Box>
          <Text color="cyan">🔨 plan-build</Text>
          <Text dimColor>  Planificador → Constructor | /plan-build</Text>
        </Box>

        <Box>
          <Text color="blue">📈 graphify-panel</Text>
          <Text dimColor>  Grafo del proyecto | /graphify-panel</Text>
        </Box>

        <Text></Text>
        <Text dimColor>────────────────────</Text>
        <Text dimColor>Corre un comando arriba o usa /[nombre]</Text>
      </Box>
    )
  })
}
