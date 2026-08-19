# PATRÓN — Carta digital cinematográfica (patrón reutilizable)

Documento de patrón extraído de una carta digital de restaurante. **No es el código; es la
receta.** El objetivo: que otra sesión, sin ver el original, reconstruya **la misma sensación**
con otra identidad visual y otro contenido.

> **Advertencia de stack (leer primero):** el proyecto de referencia **NO usa Next ni Tailwind
> ni ninguna librería de animación**. Es **un solo `index.html` autocontenido**: HTML + `<style>`
> inline (CSS custom properties, `@keyframes`, transitions) + `<script>` inline (JS vanilla, un
> IIFE, sin dependencias, sin build). Todas las animaciones son **CSS + `requestAnimationFrame` +
> `IntersectionObserver` + scrubbing de `video.currentTime`**. En la sección **6. STACK** está el
> mapeo técnica-por-técnica a Next/Tailwind/Framer-Motion o GSAP por si el proyecto nuevo va con
> framework. No inventes versiones de librerías que acá no existen.

La regla estética que ata todo: **claroscuro editorial**. Fondo oscuro casi plano, un único
acento cálido, tipografía serif de display + sans para datos, y **la foto del plato NUNCA en la
lista** (la lista es tipográfica; la foto vive en un reverso a pantalla completa). El movimiento
es lento, con ease-out fuerte; nada rebota.

---

## 1. ESTRUCTURA (de arriba a abajo)

| # | Sección | Función |
|---|---------|---------|
| 1 | **Entrada / intro** (`.entrada`) | Portada cinematográfica. Un `video` de una sola toma **scrubbeado por scroll** (el scroll mueve el `currentTime`). Encima, capas de texto (`cues`) que hacen cross-fade, un logo que se acerca, una barra de progreso y una invitación a scrollear. |
| 2 | **Barra de progreso + Omitir** | `.bar-top` fija arriba (ancho = progreso del intro). `.omitir` fija abajo-derecha (salta a la carta). Ambas se desvanecen al terminar el intro. |
| 3 | **Cabecera** (`.cabecera`) | Logo + una línea de tagline en serif itálica. Primer bloque ya "dentro" de la carta. |
| 4 | **Servicio / estado** (`.servicio`) | Estado vivo (Abierto/Cerrado, calculado en zona horaria fija) con un punto que late, + horarios especiales (p. ej. degustación). |
| 5 | **Utilidades** (`.utiles`, sticky) | Barra pegajosa: buscador (con plegado de acentos + debounce) + conmutador de idioma. Debajo, `.tamiz`: chips de **navegación** por secciones (scroll horizontal), **no** filtros. |
| 6 | **Menú** (`<main#menu>`) | Render dinámico. Primero el bloque **destacado** (menús de degustación + grilla de "nivel de hambre" con íconos + línea de maridaje), luego **N secciones** (`.acto`), cada una con encabezado (título + ilustración) y grupos de filas (`.item` plato / `.vino` vino). |
| 7 | **Región aria-live** (`#liveResults`, `.sr-only`) | Anuncia a lectores de pantalla el conteo de resultados de búsqueda. Invisible. |
| 8 | **Pie** (`.pie`) | Tagline, cita del chef, horario, dirección, contactos, aviso legal. |
| 9 | **Reverso** (`.reverso`, fixed, fuera de `#menu`) | Overlay a pantalla completa con la **foto del plato** + nombre + descripción + precio. Entra con un giro 3D. Vive fuera del contenedor de la lista porque la lista se redibuja. |

### Cómo se controla la secuencia de entrada

- **Pin pegajoso + riel alto.** `.entrada` contiene `.entrada__pin` (`position:sticky; top:0;
  height:100svh`) y `.entrada__track` (un espaciador de `200vh` que le da altura scrolleable). El
  pin queda fijo en pantalla mientras se recorre el riel.
- **Progreso `p` (0→1).** Una función `medir()` calcula
  `p = clamp( -entrada.getBoundingClientRect().top / (entrada.offsetHeight - documentElement.clientHeight), 0, 1 )`.
  **Clave:** se mide sobre **toda la `.entrada` (pin + track)**, no sobre el track solo. Si se
  mide sobre el track (que empieza *después* del pin), la primera pantalla de scroll queda
  "muerta" y se siente trabado ("scrolleo y no baja hasta el 3er intento"). Medir sobre la entrada
  hace que el scrub responda **desde el primer scroll**.
- **`p` maneja todo, por frame:** `video.currentTime`, el cross-fade de las cues, la escala del
  logo, el ancho de la barra de progreso y la opacidad de la pista/omitir.
- **Handler de scroll con throttle de rAF:** el evento `scroll` sólo agenda un
  `requestAnimationFrame` que pinta una vez por frame (nunca dos pintados en el mismo frame).
- **Bucle de seek aparte:** el `currentTime` no se setea de golpe; un `requestAnimationFrame`
  independiente (`seek()`) lo **suaviza** hacia el objetivo (lerp). Se apaga solo al pasar el intro.
- **`prefers-reduced-motion`:** se elimina la entrada entera (`quitarEntrada()`), la carta arranca
  directo.

---

## 2. ANIMACIONES (lo más importante)

**Librería: ninguna.** Técnicas: (A) CSS `@keyframes`/`transition`, (B) `requestAnimationFrame`
mapeando scroll→estilo, (C) `IntersectionObserver`, (D) scrubbing de `video.currentTime`.
Token de easing global: `--ease: cubic-bezier(.19,1,.22,1)` (ease-out fuerte, tipo "expo-out").

### 2.1 Scrub del video por scroll  ·  técnica D + B
- **Dispara:** scroll (vía rAF).
- **Qué hace:** `objetivo = p * (duración − 0.05)`. Un bucle rAF `seek()` mueve el tiempo del video
  hacia el objetivo con **lerp**: `currentTime += (objetivo − currentTime) * 0.4` (sólo si la
  diferencia > 0.015 s). Corre mientras `p < 0.999`; se detiene después.
- **Distancia/duración:** el clip entero (0→dur) mapeado sobre **200vh** de scroll (~2 alturas de
  viewport).
- **Easing:** el lerp 0.4/frame da una sensación amortiguada (crítica), no lineal.
- **Requisito de encode (ver §6):** video **all-intra** (cada frame es keyframe) para poder buscar
  cualquier frame sin lag.

### 2.2 Cross-fade de las cues  ·  técnica B
- **Dispara:** `p`.
- **Qué hace:** `C` cues (aquí 3). Cada cue `i` está centrada en `(i+0.5)/C`. Con `dd=(p−centro)*C`:
  `opacity = clamp(1 − |dd|*2, 0, 1)` (triangular) y `transform: translateY(dd * −24px)`. La primera
  se mantiene llena por debajo de su centro y la última por encima del suyo (sostienen los extremos).
- **Duración/easing:** ninguna; está **atada directamente al scroll** (no hay transition).
- **Layout del texto de cada cue:** el rótulo (`.label`) va **absolute arriba** (`top:
  calc(safe-area + 10vh)`); el titular grande (`.cue__big`) va **abajo** (`align-content:end;
  padding-bottom:var(--cue-pb)`). Así ningún texto tapa el letrero/ingreso del video.
- **`--cue-pb` se calibra POR CARTA** contra su propio video: si el plano tiene un letrero, una
  fachada o un logo físico a media altura, se baja el valor hasta que el titular lo despeje.
  Hoy: 22vh en boro/cannario/chagra/ocio y **15vh en egeo** (el cartel ΕΓΣΟ de la barra).

### 2.3 Zoom del logo en la portada  ·  técnica B
- **Dispara:** `p`. **Qué hace:** `scale = 1 + clamp(p*3,0,1) * 0.12` (1→1.12, sutil).

### 2.4 Barra de progreso del intro  ·  técnica B
- `width = p*100%`. Barra fija de 2px, color de acento, con `box-shadow` de glow.

### 2.5 Invitación a scrollear ("pista")  ·  técnica A (CSS keyframes, loop)
- **`llamar` 2.8s ease-in-out infinite:** el bloque entero cabecea `translateY 0 → 7px → 0`.
- **`caer` 1.9s cubic-bezier(.5,0,.5,1) infinite:** por un riel de `1px × 52px` cae una luz
  (`translateY −110% → 230%`, `opacity` entra al 25% y sale al 75%).
- Se desvanece (`opacity` transition .5s) apenas `p > .03`.

### 2.6 Aparición de filas al hacer scroll ("reveal")  ·  técnica C + A
- **Dispara:** `IntersectionObserver` con `rootMargin: "0px 0px -8% 0px"`, `threshold: 0.02`. Al
  intersectar agrega `.vista` y **deja de observar** (one-shot).
- **Estado inicial → final:** `.item` `opacity:0; translateY(14px)` → `opacity:1; translateY(0)`,
  `transition: .55s var(--ease)`. `.vino` igual pero `translateY(10px)` y `.5s`.
- **Escalonamiento:** **no hay delay explícito**; el stagger *es* la posición de scroll (cada fila
  entra cuando cruza el umbral). Resultado: cascada natural al bajar.

### 2.7 Reverso (ficha de plato) — giro 3D al abrir  ·  técnica A
- **Dispara:** click / Enter / Space sobre una fila `.item--ver`.
- **Contenedor:** `opacity 0→1` en `.34s var(--ease)` (+ `visibility`). `perspective: 1400px`.
- **Interior** (`.reverso__media` y `.reverso__pie`): `rotateY(−14deg) → 0` con
  `transform .52s var(--ease)` + `opacity 0→1 .38s var(--ease)`. El pie lleva
  `transition-delay: .06s` (micro-escalonamiento imagen→texto). Da el efecto de "carta que se da
  vuelta".
- **Cerrar:** inverso. Además cierra con **swipe hacia abajo > 90px**, Escape o botón.
- **Bloqueo de scroll de fondo:** `body{position:fixed}` + `top` compensado (iOS); foco atrapado
  con `inert` en el fondo; al cerrar se restaura el scroll **instantáneo** (se apaga `scroll-behavior`
  smooth durante el `scrollTo`).

### 2.8 Latido del punto de estado  ·  técnica A
- **`latir` 2.8s ease-out infinite:** anillo que se expande vía `box-shadow 0 → 10px` y se apaga.
  Sólo activo cuando el local está abierto.

### 2.9 Interacciones sin animación
- Conmutador de idioma y búsqueda **re-renderizan** el menú (las filas vuelven a correr el reveal).
- Búsqueda con **debounce 140ms** y plegado de diacríticos (`normalize("NFD")` + quitar combinantes).

### 2.10 Kill-switch de accesibilidad
- `@media (prefers-reduced-motion: reduce)`: todas las `animation`/`transition` a `.001ms`, filas
  forzadas visibles (`.item,.vino{opacity:1;transform:none}`), y el intro se elimina del DOM.

---

## 3. COMPONENTES (responsabilidad en una línea)

- **Entrada** — video scrubbeado por scroll con capas de texto, barra de progreso y skip.
- **Cue** — una capa de texto/logo que cruza (fade + translate) según el progreso del scroll.
- **Pista** — invitación animada a scrollear (cabeceo + luz que cae).
- **Cabecera** — logo + tagline.
- **Servicio** — estado abierto/cerrado en vivo + horarios especiales.
- **Utiles** — barra sticky: buscador + conmutador de idioma.
- **Tamiz** — chips de navegación a secciones (scroll horizontal), no filtros.
- **Destacado / Degustación** — ilustración héroe + copy + tarjetas de menú + grilla de íconos + línea de maridaje.
- **Acto** — sección de menú: encabezado (título + ilustración) + grupos.
- **Grupo** — subtítulo opcional + nota opcional + filas.
- **Item** — fila tipográfica de plato: nombre + precio + descripción opcional + marca "Ver" opcional.
- **Vino** — fila de vino: nombre + descriptor + precios copa/botella.
- **Reverso** — overlay full-screen de la ficha del plato (foto + nombre + desc + precio), entra con giro 3D.
- **liveResults** — región `aria-live` (sr-only) para resultados de búsqueda.
- **Pie** — tagline, cita, horario, dirección, contacto, legal.
- **Capa de datos** — `DICT` (textos de UI i18n), `SECCIONES` (menú), `DEG` (degustación), `ILUS` (mapa sección→ilustración), índice `porId` (id estable por ítem).
- **Motor** — `render`/`pintaItem`/`pintaDeg`/`pintaNav`; `tx` (resolver i18n); `aplicarIdioma`; `latido`; `abrir/cerrar/pintaReverso`; `medir`/`pintarEntrada`/`seek` (intro).

---

## 4. FICHA DE PLATO (el "reverso")

La lista **no** lleva foto: cada fila es nombre (serif) a la izquierda y precio (sans, tabular) a
la derecha (`grid-template-columns: 1fr auto`; el precio con `white-space:nowrap` para que nunca
baje bajo el nombre). Los platos con material muestran una marca discreta **"Ver"**; la foto sólo
aparece al abrir el **reverso**. Así se evita el look de "catálogo de delivery".

**El reverso** es un overlay `position:fixed; inset:0` con `grid-template-rows: minmax(38svh, 1fr) auto`:

- **Proporción de imagen:** la fila de imagen ocupa **como mínimo 38% de la altura del viewport
  chico** y crece hasta llenar el resto (`1fr`). La imagen va `object-fit: cover`. La fila de texto
  (`.reverso__pie`) es `auto` (su alto natural), abajo.
- **Dónde caen nombre y precio:** nombre (`.reverso__n`, serif, `clamp(1.6rem,8vw,2.2rem)`) arriba
  del pie; descripción debajo; y una **línea final** (`.reverso__linea`) separada por un hairline
  superior con las **marcas a la izquierda y el precio a la derecha** (precio en color de acento,
  tabular-nums).
- **Cómo se reserva el espacio para que la tipografía no tape el plato** — tres mecanismos juntos:
  1. **Scrim en degradé** sobre la imagen (`.reverso__media::after`):
     `linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 22%, transparent 60%, var(--void) 100%)`.
     El **fondo del plato se funde al color de fondo**, creando una cama para el texto; el centro
     (donde vive el plato) queda limpio.
  2. **El pie sube sobre la parte fundida:** `.reverso__pie { margin-top: calc(var(--s8) * -1) }`
     (≈ −68px). El texto se apoya **sobre la transición imagen→fondo**, nunca sobre el plato.
  3. **El `minmax(38svh,1fr)`** garantiza que la imagen tenga altura suficiente y que el pie entre
     sin comprimir la foto; con descripciones largas el overlay hace scroll interno
     (`overflow-y:auto`).

---

## 5. TOKENS (lo que cambia entre una marca y otra)

Todo lo de marca vive en `:root` como CSS custom properties + unos pocos parámetros de motion en JS.
Para una marca nueva, **sólo se tocan estos valores** (la estructura y las animaciones no cambian).

### Color (11 tokens)
```
--void        fondo dominante            (ej. espresso #0E0B08)
--void-2      superficie/tarjeta          (#17120D)
--hair        líneas 12% del blanco       (rgba(245,238,226,.12))
--hair-2      líneas 6%                    (rgba(245,238,226,.06))
--ink         texto principal             (hueso #F1EBDF)
--ink-2       texto secundario/muted       (#B9AE9C)
--ink-3       texto terciario             (#8B8272)   ← verificar AA sobre --void
--gold        ACENTO (filos, latido, activo) (#D9A441)
--gold-2      acento para texto chico (AA)  (#EAC069)
--gold-deep   acento profundo (divisores)   (#7A5A22)
--glow        halo del acento              (rgba(217,164,65,.30))
```
Regla: **un solo color de acento** (`--gold*`). El contraste del texto se verifica **contra el
parche MÁS CLARO del fondo** (el `body::before` suma una luz sutil arriba), no contra el negro plano.

### Tipografía
```
--sans   familia de datos/UI   (aquí "Heebo" + fallbacks system)
--serif  familia de display    (aquí "Playfair Display" + fallbacks serif)
```
Fuentes **auto-hospedadas** (woff2 vía `@font-face`, `font-display:swap`); pesos usados: sans 300/400/500,
serif 400/600/700 + itálica 400. Rol: **serif para nombres/títulos/tagline, sans para precios,
rótulos, chips y datos**. Precios y horas siempre `font-variant-numeric: tabular-nums`.

### Escalas
```
--fs-micro..--fs-2xl   0.6875 / 0.75 / 0.8125 / 0.9375 / 1.0625 / 1.25 / 1.625 / 2.25 rem
--s1..--s10            4 / 8 / 12 / 16 / 24 / 32 / 48 / 68 / 100 / 140 px
--maxw                 640px (ancho de columna de la carta)
--gut                  clamp(20px, 6vw, 38px) (gutter lateral)
```

### Radios
```
pill (conmutador idioma)        999px
botón cerrar reverso            50%
ícono (hambre)                  10px
barras de acento                2px
```
Estética general: **filos rectos/editorial**, radios sólo donde son funcionales.

### Copy de las cues  ·  UNO POR MARCA, nunca compartido
```
cue1k / cue1t / cue1s   rótulo, titular y bajada de la portada
cue2k / cue2t / cue2s   rótulo, titular y bajada de la carta
--cue-pb                separación del titular al borde inferior (calibrar contra el video)
```
El titular de la cue 1 es **la línea editorial de la marca** y es DISTINTO en cada carta:

| carta | cue1t (ES) | cue1t (EN) | cue2t / cue2s |
|---|---|---|---|
| boro | El fuego no se apura | Fire won't be rushed | Todo lo de hoy / Cocina y barra |
| cannario | El mar llega temprano | The sea arrives early | Todo lo de hoy / Cocina y barra |
| chagra | Comer es un rito | Eating is a ritual | Todo lo de hoy / Degustación y barra |
| egeo | Comer juntos, siempre | Eat together, always | Todo lo de hoy / Cocina y barra |
| ocio | Menos carta, más mesa | Less menu, more table | 28 platos / Ni uno de más |

⚠️ **Esto se pisaba al regenerar.** Una regeneración propagó el titular de boro a las cinco y
las dejó diciendo todas lo mismo. Ya no: el generador lee del archivo existente el copy de las cues
(ES y EN, diccionario y fallback) y los tokens `--cue-pb`, `--cue-marca-pb` y `--logo-h`, y los
reinyecta sobre la salida nueva. Verificado: regenerar las cinco da un archivo byte-idéntico.
Aun así, esta tabla sigue siendo la fuente de verdad si hay que reponerlos a mano.

Dos lugares por archivo, y hay que dejarlos **en espejo**:
1. diccionario i18n — `cue1t:"…"` en el bloque ES (~línea 703) y en el EN (~727).
2. fallback sin JS — `<h1 class="cue__big" data-tx="cue1t">…</h1>` (~línea 542).

El diccionario **pisa** al fallback: si editás sólo el HTML no vas a ver ningún cambio en pantalla.

Regla de la bajada (`cue2s`): el conteo de platos **sólo se muestra cuando es chico**. En ocio (28)
la curaduría es el argumento; en egeo (360) o cannario (301) el número produce parálisis, así que
ahí va la naturaleza de la oferta ("Cocina y barra") en vez del número.

### Parámetros de motion (los que dan "la sensación")
```
--ease                 cubic-bezier(.19,1,.22,1)   (ease-out fuerte, global)
reveal duración        .55s (item) / .5s (vino)
reveal distancia       14px (item) / 10px (vino)
reveal observer        rootMargin "0px 0px -8% 0px", threshold .02, one-shot
reverso                rotateY(-14deg)→0, transform .52s, opacity .38s, delay pie .06s, perspective 1400px
scrub lerp             0.4  (suavizado del currentTime por frame)
intro track            200vh   (largo del riel; sube = intro más lento)
cue translate          -24px por unidad de progreso
logo zoom              +0.12 de escala
pista keyframes        llamar 2.8s / caer 1.9s
latido                 latir 2.8s
buscador debounce      140ms
```

### Assets de marca (se reemplazan 1:1)
- `logo.webp` (con alfa), favicon.
- `intro.mp4` + `intro.jpg` (póster = primer frame ya iluminado; ver §6).
- Ilustraciones por sección (una por `.acto`, mapa `ILUS`), adaptadas al fondo.
- `DICT` (todos los textos de UI, en cada idioma), tagline, horarios, contactos, legal.

---

## 6. STACK

### Lo que realmente usa la referencia
- **Sin framework.** Un `index.html` autocontenido: HTML + `<style>` inline + `<script>` inline (IIFE,
  JS vanilla estilo ES5, sin módulos). **Sin build, sin dependencias, sin `package.json`.**
- **Sin Tailwind:** el sistema de diseño son **CSS custom properties** en `:root` (ver §5).
- **Sin librería de animación:** CSS `@keyframes`/`transition` + `requestAnimationFrame` +
  `IntersectionObserver` + scrubbing de `video.currentTime`. Sólo se animan `transform` y `opacity`.
- **Fuentes auto-hospedadas** (woff2 embebidas por `@font-face`; sin Google Fonts, sin request externo).
- **i18n propio:** un diccionario `DICT` + `{es,en}` por dato + un resolver `tx()`. Sin librería. El
  idioma **no persiste** entre recargas (decisión de producto).
- **Servidor local:** un `serve.js` de Node sin dependencias (sirve estáticos con soporte de **Range**
  para el video). Deploy como estático (Vercel), con `vercel.json` cacheando `web-assets` como
  `immutable` y revalidando el HTML.

### Trucos de rendimiento (portables a cualquier stack)
- **Video all-intra** (`-g 1 -keyint_min 1 -sc_threshold 0`, CRF alto) para poder **buscar cualquier
  frame** sin lag al scrubbear. Etalonaje **horneado en el encode** (`eq=…`), nunca filtro CSS sobre
  el video full-screen.
- **Arranque sin pantalla negra:** el clip se **recorta** para que el frame 0 ya esté iluminado, y el
  contenedor del video lleva el **póster como `background`** — así se ve la imagen apenas carga, aun
  antes de bajar el video.
- **Video liviano:** 720p, ~1.7 MB; total de assets ~3.7 MB. El póster carga al instante.
- **Scroll a 60fps:** handler de scroll **throttled con rAF** (un pintado por frame); el bucle de
  `seek()` **se apaga** al pasar el intro (no sigue buscando en el decoder mientras se lee la carta).
- **Sólo `transform`/`opacity`** en lo animado (no dispara layout/paint), con `will-change` en las
  capas del intro.
- **`IntersectionObserver` one-shot** para reveals (deja de observar tras aparecer).
- **`loading="lazy"`** en ilustraciones y fotos; `preload` sólo del primer asset crítico.
- **`text-wrap: balance`** en títulos, `font-display: swap`, `-webkit-font-smoothing: antialiased`.
- **Caché immutable** de assets en el deploy; el HTML revalida.
- **Kill-switch** `prefers-reduced-motion` (§2.10).

### Mapa a Next / Tailwind / librería de animación (si el proyecto nuevo va con framework)
> La referencia es vanilla; esto es cómo reproducir **cada técnica** en un stack moderno. Elegí UNA
> librería de animación (Framer Motion **o** GSAP+ScrollTrigger), no ambas.

| Técnica de la referencia | Equivalente en framework |
|---|---|
| Custom properties en `:root` | Tokens de **Tailwind** (`theme.extend.colors/fontFamily/spacing`) **+** CSS vars para lo que cambia por marca (permite theming en runtime). |
| Scrub `video.currentTime` por scroll | **GSAP ScrollTrigger** con `scrub:true` animando `video.currentTime` (o Framer Motion `useScroll` + `useTransform` seteando `currentTime` en un `useMotionValueEvent`). Mantener el pin (ScrollTrigger `pin`, o `position:sticky`). |
| Reveal por `IntersectionObserver` | Framer Motion `whileInView`/`useInView`, o ScrollTrigger `batch`. Mismos números: y 14px, .55s, ease `[.19,1,.22,1]` (Framer `ease`) o `expo.out` (GSAP). |
| Reverso con giro 3D | Framer Motion `AnimatePresence` + `rotateY:-14→0`, `perspective` en el padre; o GSAP timeline. |
| Keyframes CSS (pista, latido) | Se quedan como **CSS** (o Tailwind `animation`); no necesitan JS. |
| `serve.js` + `vercel.json` | Next sirve estáticos solo; el video en `/public`, headers de caché en `next.config`/`vercel.json`. **Ojo:** Next NO transcodea video — el encode all-intra hay que hacerlo igual con ffmpeg. |
| i18n `DICT`/`tx()` | `next-intl` o rutas `[lang]`, pero la decisión de **no persistir** y el diccionario único se conservan. |

**Versiones sugeridas (si arrancás nuevo, no es lo que usa la referencia):** Next 15 (App Router),
Tailwind 3.4+, y **GSAP 3.12 + ScrollTrigger** para el scrub por scroll (es la técnica que mejor
calza con "el video fluye 100% con el scroll"). Framer Motion 11 sirve para reveals y el reverso.

---

## Checklist para reconstruir la sensación

1. Encodeá el intro **all-intra**, recortá el fundido, generá el póster del frame 0, ponelo como
   `background` del contenedor. (Sin esto, arranca en negro y el scrub laguea.)
2. Pin `100svh` + track `200vh`; medí el progreso sobre **toda la entrada** (no sobre el track).
3. Scrub con **lerp** (no seteo directo); apagá el bucle al salir del intro.
4. Reveals con observer one-shot, `translateY 14px` + `.55s ease(.19,1,.22,1)`.
5. La **lista es tipográfica**; la foto va sólo en el reverso, con **scrim al fondo + pie con
   margin-top negativo** para que el texto no tape el plato.
6. Un solo acento; contraste AA contra el parche más claro del fondo.
7. Reemplazá **sólo los tokens** (§5) para la marca nueva; no toques estructura ni motion.
