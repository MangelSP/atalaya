import type { Register } from 'claude-code'

// Trabajos en vuelo, por agentId. Se reinicia en cada recarga (aceptable).
type Job = { task: string; role: 'plan' | 'build' }
const pending = new Map<string, Job>()

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'plan-build',
      description: 'Un subagente planifica y otro construye: /plan-build <tarea>',
    })
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
    $.ui.toast('plan-build: planificando…')
    return { text: `Planificando «${task}». Construyo apenas termine el plan.` }
  })

  // Observa el fin de cada turno; actua solo en los agentes que yo lancé.
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
              $.ui.toast('plan-build: construyendo…')
            } else {
              $.ui.toast('plan-build: no se pudo lanzar el constructor')
            }
          } else {
            $.ui.toast('plan-build: el plan no se completó')
          }
        } else {
          $.ui.toast('plan-build: terminado ✓')
        }
      }
    } catch {}
    return next(e)
  })
}
