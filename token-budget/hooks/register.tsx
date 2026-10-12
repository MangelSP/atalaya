import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { RateLimit } from '../types'

const limits = atom({ plugin: 'token-budget', key: 'limits' } as const, null)

// Nombre bonito por ventana. Lo que no conozca lo muestro tal cual (ej. una
// ventana premium/opus/fable que reporte tu cuenta aparece sola).
const LABEL: Record<string, string> = {
  five_hour: '5h',
  seven_day: 'Semana',
  spend_limit: 'Gasto',
}
const label = (kind: string) => LABEL[kind] ?? kind

const emoji = (kind: string) => {
  if (kind.includes('five')) return '⏰'
  if (kind.includes('seven')) return '📅'
  if (kind.includes('spend')) return '💳'
  return '📊'
}

// percentUsed (0-100) -> "█████░░░░░"
const bar = (pct: number) => {
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)))
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

const color = (pct: number) => (pct >= 90 ? 'red' : pct >= 70 ? 'yellow' : 'green')

const status = (pct: number) => {
  if (pct >= 90) return '🔴'
  if (pct >= 70) return '🟡'
  return '🟢'
}

// resetsAt ISO -> "2h 15m" / "3d 4h" / "<1m"
const untilReset = (nowMs: number, resetsAt?: string) => {
  if (!resetsAt) return ''
  const ms = Date.parse(resetsAt) - nowMs
  if (!(ms > 0)) return ''
  const m = Math.floor(ms / 60000)
  const d = Math.floor(m / 1440)
  const h = Math.floor((m % 1440) / 60)
  const min = m % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${min}m`
  return min > 0 ? `${min}m` : '<1m'
}

// Linea compacta para el status line: "5h 23% · Semana 61% · Gasto 4%"
const statusLine = (rows: RateLimit[]) =>
  rows.map(r => `${label(r.kind)} ${Math.round(r.percentUsed)}%`).join(' · ')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      const u = await $.session.usage()
      const rows = u.rateLimits ?? []
      await update($, limits, () => rows)
      if (rows.length) $.ui.status(statusLine(rows))
    } catch {
      // sin datos todavia: no rompemos nada
    }
    return next(e)
  })

  // Se dispara cuando una ventana de limite se mueve un punto entero.
  on('session.measure', async ($, e, next) => {
    const rows = e.rateLimits ?? []
    await update($, limits, () => rows)
    if (rows.length) $.ui.status(statusLine(rows))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const rows = await read($, limits)
    if (!rows || rows.length === 0) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()

    return (
      <Box flexDirection="column">
        <Text bold color="cyan">💰 Token Budget</Text>
        <Text dimColor>Límites semanales de tokens</Text>
        <Text></Text>
        {rows.map(r => {
          const pct = Math.round(r.percentUsed)
          const reset = untilReset(now, r.resetsAt)
          return (
            <Text key={r.kind}>
              <Text>{emoji(r.kind)} {status(pct)}</Text>
              <Text dimColor> {label(r.kind)}</Text>
              <Text color={color(r.percentUsed)}> {bar(r.percentUsed)}</Text>
              <Text color={color(r.percentUsed)} bold> {pct}%</Text>
              {reset && <Text dimColor> ⏱️ {reset}</Text>}
            </Text>
          )
        })}
      </Box>
    )
  })
}
