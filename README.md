# ⚔️ Atalaya

**Vigía de tokens, agentes y grafo del proyecto en Claude Code.**

Una colección de 6 mods integrados para monitorear tu uso de tokens, ver qué herramientas y subagentes corren en vivo, optimizar costos automáticamente, orquestar tareas complejas y visualizar la estructura de tu proyecto.

---

## 📊 Diagrama Visual

Abre **`atalaya-visual-diagram.html`** en tu navegador para ver una visualización interactiva del sistema:
- 6 módulos coloreados conectados a un hub central
- Indicadores en vivo mostrando estado
- Barras de progreso de uso
- Flujo de datos visual

---

## 🎯 Mods Disponibles

### 💰 token-budget
Barra de progreso en tiempo real con el % usado de tus ventanas (5h, semana, premium) y cuánto falta para resetear.

- **Visualización:** Emojis de estado (🟢 bien, 🟡 alerta, 🔴 límite), barra de progreso
- **Integración:** Status line automático + panel superior
- **Uso:** Automático, sin comandos

### 👥 agent-panel
Panel en vivo mostrando qué tools y subagentes corren, estado actual (corriendo/completado/error) y bajo qué agente ejecutan.

- **Visualización:** Lista con símbolos de progreso (▶ corriendo, ✓ completado, ✗ error)
- **Integración:** Pane dedicado `/agent-panel`
- **Uso:** `/agent-panel` para abrir

### 🧠 model-advisor
Sugiere automáticamente cambiar a modelo Haiku cuando detecta un prompt simple, ahorrando límite sin cambiar nada solo.

- **Heurística:** Local, sin gastar tokens (análisis instantáneo)
- **Integración:** Banner automático antes del prompt
- **Uso:** Automático, respeta tu decisión

### 🔨 plan-build
Orquesta dos subagentes: uno planifica la tarea, el otro construye siguiendo el plan. Automatiza tareas complejas.

- **Flujo:** Planificador → Constructor automático
- **Visualización:** Pane con progreso en vivo (📋 planificando, 🔨 construyendo)
- **Uso:** `/plan-build <descripción de tarea>`

### 📈 graphify-panel
Muestra el grafo del proyecto (nodos y conexiones) en un panel interactivo, coloreado por comunidades.

- **Requisito:** Corre `/graphify` en tu sesión para generar el grafo
- **Visualización:** Nodos coloreados, tipo de archivo, cantidad de conexiones
- **Uso:** `/graphify-panel` para abrir, `/graphify` para generar

### ⚔️ atalaya-dashboard
Panel central de navegación. Acceso rápido a todos los mods con descripciones y comandos.

- **Hub:** Un lugar para descubrir y acceder a todo
- **Uso:** `/atalaya` o automático en session.start

---

## 📦 Instalar

### Opción 1: Desde GitHub (recomendado)
```bash
claude plugin marketplace add MangelSP/atalaya
claude plugin install token-budget@atalaya
claude plugin install agent-panel@atalaya
claude plugin install model-advisor@atalaya
claude plugin install plan-build@atalaya
claude plugin install graphify-panel@atalaya
claude plugin install atalaya-dashboard@atalaya
```

### Opción 2: Desde ruta local
```bash
claude plugin marketplace add /ruta/a/atalaya
claude plugin install token-budget@atalaya
# ... y los demás
```

---

## 🚀 Ejemplos de Uso

### Monitorear tokens mientras trabajas
Abre Claude Code. `token-budget` muestra automáticamente el progreso:
```
💰 Token Budget
─────────────────
⏰ 🟢 5h ██████░░░░ 60%
📅 🟡 Semana ████████░░ 82% ⏱️ 2d 3h
💳 🟢 Gasto ███░░░░░░░ 28%
```

### Orquestar una tarea compleja
```
/plan-build agrega autenticación OAuth con Google y guarda tokens en BD
```

1. El planificador crea un plan paso a paso
2. El constructor ejecuta automáticamente
3. Ves el progreso en vivo en el pane

### Ver qué tools corren
```
/agent-panel
```

Lista en vivo: qué `Bash`, `Read`, `Agent` u otros están en vuelo, cuáles completaron, cuáles erraron.

### Explorar tu proyecto
```
/graphify    # genera el grafo
/graphify-panel  # lo visualiza
```

---

## ⚙️ Notas Técnicas

- **Límites:** Por cuenta (5h y semana), no por modelo. Si tu plan reporta ventana premium, `token-budget` la muestra sola.
- **Sin tokens:** `model-advisor` usa heurística local (regex), no consume tokens clasificando.
- **Reset autom.:** El status line se actualiza cuando cambias de ventana (hasta el minuto exacto del reset).
- **Reqs:** Claude Code con soporte de mods (hooks `.tsx`/`.ts`, APIs de atom/read/update).

---

## 🔗 Links

- **GitHub:** https://github.com/MangelSP/atalaya
- **Marketplace:** `MangelSP/atalaya`

---

**Hecho con ❤️ para optimizar tu experiencia en Claude Code.**
