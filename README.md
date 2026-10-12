# Atalaya

Cuatro mods para Claude Code que te ayudan a vigilar tus límites de tokens y tus agentes.

| Mod | Qué hace | Uso |
|-----|----------|-----|
| **token-budget** | Barra + status line con el % real de tus ventanas de límite (5h, semana, y premium si tu plan la reporta) y cuánto falta para resetear. | automático |
| **agent-panel** | Un panel en vivo de qué tools y subagentes corren, cuáles siguen activos y bajo qué agente. | `/agent-panel` |
| **model-advisor** | Cuando el prompt pinta simple, sugiere bajar a `/model haiku` para ahorrar límite. No cambia el modelo solo (la API no lo permite). | automático |
| **plan-build** | Lanza un subagente que planifica y, al terminar, otro que construye con ese plan. | `/plan-build <tarea>` |

## Instalar

Desde una terminal con el CLI `claude`:

```bash
# 1) añade este marketplace (carpeta local, o tu repo de GitHub)
claude plugin marketplace add /ruta/a/atalaya
#   o si lo subes a GitHub:  claude plugin marketplace add tu-usuario/atalaya

# 2) instala los que quieras
claude plugin install token-budget@atalaya
claude plugin install agent-panel@atalaya
claude plugin install model-advisor@atalaya
claude plugin install plan-build@atalaya
```

## Notas

- Los límites son **por cuenta** (5h y semana), no por modelo: no existe un "% de Fable" aparte salvo que tu plan reporte una ventana premium propia (entonces `token-budget` la muestra sola).
- `model-advisor` usa una heurística local, **no gasta tokens** clasificando.
- Requiere una versión de Claude Code con soporte de mods (hooks `.tsx`/`.ts`).
