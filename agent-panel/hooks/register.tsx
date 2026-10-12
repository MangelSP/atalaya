import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Call } from '../types'

const PANE = 'agent-panel'
const calls = atom({ plugin: 'agent-panel', key: 'calls' } as const, [])

// Detalle corto segun la tool, sin reventar el ancho.
const detailOf = (e: Record<string, unknown>): string => {
  if (e.tool === 'Agent' || e.tool === 'Task') {
    return String(e.subagent_type ?? e.description ?? 'subagente')
  }
  if (e.tool === 'Bash') return String(e.command ?? '').trim().slice(0, 48)
  if (e.tool === 'Skill') return String(e.skill ?? '')
  for (const k of ['file_path', 'path', 'pattern', 'url', 'query']) {
    if (e[k]) return String(e[k]).slice(0, 48)
  }
  return ''
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'agent-panel',
      description: 'Abre el panel de agentes y tools en vivo',
    })
    void $.ui.open({ id: PANE, title: 'Agentes y tools' })
    return next(e)
  })

  on('command.run', { command: 'agent-panel' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Agentes y tools' })
    return { text: 'Panel de agentes abierto.' }
  })

  // Solo observa. next(e) corre siempre, pase lo que pase con el registro.
  on('tool.call', async ($, e, next) => {
    try {
      const call: Call = {
        id: e.tool_use_id,
        tool: e.tool,
        isDone: false,
        agent: e.agentId ? e.agentId.slice(0, 6) : '',
        detail: detailOf(e as Record<string, unknown>),
      }
      await update($, calls, list => [...list, call].slice(-200))
    } catch {}

    const ran = await next(e)

    try {
      await update($, calls, list =>
        list.map(one =>
          one.id === e.tool_use_id
            ? { ...one, isDone: true, isError: ran?.isError === true }
            : one,
        ),
      )
    } catch {}
    return ran
  }).catch((_$, e, next) => next(e)) // si el observador falla, deja correr la tool

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, calls)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 3)
    const running = list.filter(c => !c.isDone).length

    return (
      <Box flexDirection="column">
        <Text bold>
          {running > 0 ? `${running} corriendo` : 'en reposo'}
          <Text dimColor> · {list.length} en total</Text>
        </Text>
        {list.length === 0 && <Text dimColor>Aun sin actividad.</Text>}
        {list.slice(-room).map(c => (
          <Text key={c.id} dimColor={c.isDone && !c.isError}>
            <Text color={c.isError ? 'red' : c.isDone ? undefined : 'yellow'}>
              {c.isError ? '✗' : c.isDone ? '·' : '▸'}
            </Text>{' '}
            {c.agent ? <Text color="cyan">[{c.agent}] </Text> : ''}
            <Text bold={!c.isDone}>{c.tool}</Text>
            {c.detail ? <Text dimColor> {c.detail}</Text> : ''}
          </Text>
        ))}
      </Box>
    )
  })
}
