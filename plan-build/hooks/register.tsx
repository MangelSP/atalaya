import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// Trabajos en vuelo, por agentId. Se reinicia en cada recarga (aceptable).
type Job = { task: string; role: 'plan' | 'build' }
type PlanBuildState = { job: Job | null; stage: 'planning' | 'building' | 'done' }

const pending = new Map<string, Job>()
const state = atom(
  { plugin: 'plan-build', key: 'state' } as const,
  { job: null, stage: 'done' } as PlanBuildState,
)

const PANE = 'plan-build'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'plan-build',
      description: 'Un subagente planifica y otro construye: /plan-build <tarea>',
    })
    void $.ui.open({ id: PANE, title: '🔨 Plan → Build' })
    return next(e)
  })

  on('command.run', { command: 'plan-build' }, async ($, e) => {
    const task = e.args.trim()
    if (!task) {
      return { text: 'Uso: /plan-build <tarea>. Ej: /plan-build agrega login con Google' }
    }
    const r = await $.agent.spawn({
      description: 'Planificar: ' + task.slice(0, 40),
      prompt:
        `Haz un PLAN de implementacion para esta tarea:\n\n${task}\n\n` +
        `Devuelve SOLO el plan: pasos numerados, archivos a tocar y criterios de aceptacion. ` +
        `No ejecutes ni edites nada todavia.`,
    })
    if (!('agentId' in r) || !r.agentId) {
      return { text: 'No se pudo lanzar el planificador' + ('deny' in r ? `: ${r.deny}` : '.') }
    }
    pending.set(r.agentId, { task, role: 'plan' })
    await update($, state, () => ({ job: { task, role: 'plan' }, stage: 'planning' }))
    $.ui.toast('🔨 plan-build: planificando…')
    return { text: `Planificando «${task}». Construyo apenas termine el plan.` }
  })

  on('turn.complete', async ($, e, next) => {
    try {
      const job = e.agentId ? pending.get(e.agentId) : undefined
      if (job) {
        pending.delete(e.agentId!)
        if (job.role === 'plan') {
          if (e.reason === 'answer' && e.answer.trim()) {
            const r = await $.agent.spawn({
              description: 'Construir: ' + job.task.slice(0, 40),
              prompt:
                `Implementa esta tarea siguiendo el PLAN de abajo. Hazlo completo y verifica.\n\n` +
                `TAREA: ${job.task}\n\nPLAN:\n${e.answer}`,
            })
            if ('agentId' in r && r.agentId) {
              pending.set(r.agentId, { task: job.task, role: 'build' })
              await update($, state, s => ({ ...s, stage: 'building' }))
              $.ui.toast('🔨 plan-build: construyendo…')
            } else {
              await update($, state, () => ({ job: null, stage: 'done' }))
              $.ui.toast('🔨 no se pudo lanzar el constructor')
            }
          } else {
            await update($, state, () => ({ job: null, stage: 'done' }))
            $.ui.toast('🔨 el plan no se completó')
          }
        } else {
          await update($, state, () => ({ job: null, stage: 'done' }))
          $.ui.toast('🔨 plan-build: terminado ✓')
        }
      }
    } catch {}
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const s = await read($, state)

    const stageEmoji = { planning: '📋', building: '🔨', done: '✓' }
    const stageColor: Record<string, string> = { planning: 'yellow', building: 'cyan', done: 'green' }

    return (
      <Box flexDirection="column">
        <Text bold color="cyan">🔨 Plan → Build</Text>
        <Text dimColor>Planifica una tarea, luego construye automáticamente</Text>
        <Text></Text>

        {!s.job ? (
          <>
            <Text dimColor>En reposo.</Text>
            <Text dimColor></Text>
            <Text dimColor>Usa:</Text>
            <Text bold color="cyan">  /plan-build &lt;tu tarea&gt;</Text>
          </>
        ) : (
          <>
            <Text bold>
              <Text color={stageColor[s.stage]}>{stageEmoji[s.stage]}</Text>
              <Text> {s.stage === 'planning' ? 'Planificando' : 'Construyendo'}</Text>
            </Text>
            <Text dimColor>{s.job.task.slice(0, 60)}…</Text>
          </>
        )}
      </Box>
    )
  })
}
