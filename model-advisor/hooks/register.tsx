import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Tip } from '../types'

const tip = atom({ plugin: 'model-advisor', key: 'tip' } as const, null)

const CHEAP = 'haiku'

// Heuristica local (sin llamadas al modelo, no gasta tokens):
// corto + intencion simple, y sin pistas de trabajo pesado.
const SIMPLE = /\b(typo|rename|renombra|format|formatea|lint|explica|explain|qu[eé] es|what is|list|lista|muestra|print|log|comenta|comment|traduce|translate|ortograf|gramatic)\b/i
const HARD = /\b(refactor|arquitect|architecture|debug|dise[nñ]a|design|migrat|migra|optimi|performance|security|seguridad|implementa|build the|construye|disen|test|deploy|concurren|race|algorithm)\b/i

const looksEasy = (text: string) => {
  const t = text.trim()
  if (t.length === 0 || t.length > 220) return false
  if (HARD.test(t)) return false
  return SIMPLE.test(t) || t.length < 60
}

const isPremium = (model: string) => /opus|sonnet/i.test(model)

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    try {
      const model = await $.session.model()
      const verdict: Tip =
        looksEasy(e.text) && isPremium(model) ? { easy: true, cheapModel: CHEAP } : null
      await update($, tip, () => verdict)
    } catch {}
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const t = await read($, tip)
    if (!t || !t.easy) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        <Text bold color="magenta">🧠 Model Advisor</Text>
        <Text dimColor>Este prompt pinta simple, saca máximo provecho</Text>
        <Text></Text>
        <Text>
          <Text color="green">✓</Text>
          <Text dimColor> Cambia a </Text>
          <Text bold color="cyan">/model {t.cheapModel}</Text>
          <Text dimColor> para ahorrar límite (5h/semana)</Text>
        </Text>
      </Box>
    )
  })
}
