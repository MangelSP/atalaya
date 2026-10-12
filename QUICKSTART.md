# 🚀 Guía Rápida

## Paso 1: Instalar

Abre tu terminal y corre:

```bash
claude plugin marketplace add MangelSP/atalaya
```

## Paso 2: Instala los mods que quieras

```bash
# Los essentials:
claude plugin install token-budget@atalaya
claude plugin install agent-panel@atalaya
claude plugin install atalaya-dashboard@atalaya

# Opcionales (pero útiles):
claude plugin install model-advisor@atalaya
claude plugin install plan-build@atalaya
claude plugin install graphify-panel@atalaya
```

## Paso 3: Usa en Claude Code

### Ver tus tokens (automático)
Abre Claude Code. El `token-budget` aparece automáticamente mostrando:
- ⏰ 5h window
- 📅 Semana
- 💳 Gasto

### Ver qué tools corren (automático)
En el pane `Agent Panel` ves todo lo que está en vuelo.

### Pedir recomendación de modelo (automático)
Escribe un prompt simple como "Explica qué es REST".  
El `model-advisor` sugiere cambiar a Haiku para ahorrar.

### Planificar + Construir
```
/plan-build Agrega login con Google a mi app
```

### Ver el grafo del proyecto
```
/graphify
/graphify-panel
```

---

## Comandos Disponibles

| Comando | Qué hace |
|---------|----------|
| `/atalaya` | Abre dashboard central |
| `/agent-panel` | Abre pane de tools |
| `/plan-build <tarea>` | Planifica y construye automáticamente |
| `/graphify` | Genera grafo del proyecto (requiere graphify skill) |
| `/graphify-panel` | Abre visualización del grafo |

---

## Preguntas Comunes

**¿Los mods gastan mis tokens?**  
No, `token-budget` solo lee, `model-advisor` usa regex local. Solo `plan-build` lanza agentes (es la idea).

**¿Funcionan offline?**  
Sí, excepto `plan-build` que necesita red para los subagentes.

**¿Puedo desinstalar uno solo?**  
Sí: `claude plugin uninstall token-budget@atalaya`

**¿Dónde están los mods en mi máquina?**  
`~/.claude/plugins/atalaya/`

---

¡Listo! Ahora usa `/atalaya` en Claude Code para empezar. 🎯
