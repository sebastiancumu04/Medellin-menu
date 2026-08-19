# Cartas SYNCRA

Cinco cartas digitales. Cada una es **un solo `index.html` autocontenido**: HTML + CSS inline
+ JS inline. Sin framework, sin build, sin dependencias externas en tiempo de ejecución.

La técnica está en [`docs/PATRON.md`](docs/PATRON.md). Los platos y precios salen de `data/*.json`
y están copiados **verbatim**. La identidad visual sale de `RESTAURANTES_BRAND_KITS/`.

| Carta | URL | Acento | Serif (display) | Sans (datos) | Platos |
|---|---|---|---|---|---|
| Boro | `/boro/` | `#B96A35` | Bodoni Moda | Archivo | 112 |
| La Chagra | `/chagra/` | `#C68421` | Vollkorn | Source Sans 3 | 68 |
| Egeo | `/egeo/` | `#FFBC7D` | Spectral | Inter | 360 |
| Cannario | `/cannario/` | `#EC9F4A` | Playfair Display | Montserrat | 301 |
| OCIO | `/ocio/` | `#FF9061` | DM Serif Display | IBM Plex Mono | 28 |

---

## 1 · Cambiar colores

**Archivo:** `<carta>/index.html` · **líneas 22 a 32.** Mismas líneas en las cinco.

Cada carta ya trae la paleta de su marca. Los valores marcados **MARCA** son literales del
brand kit; el resto se derivó de ellos y se verificó en contraste.

| Token | Línea | Boro | La Chagra | Egeo | Cannario | OCIO |
|---|---|---|---|---|---|---|
| `--void` | 22 | `#0E0906` | `#150E07` | `#071A20` | `#101512` | `#0F0C0A` **M** |
| `--void-2` | 23 | `#181009` | `#211609` | `#0C2A33` | `#18201C` | `#1B1614` |
| `--ink` | 26 | `#EDE2D8` | `#E8D8BE` **M** | `#EEE2D7` **M** | `#FFE8C3` **M** | `#EDE6E0` |
| `--ink-3` | 28 | `#908172` | `#9A8363` | `#7F9096` | `#908A76` | `#908377` |
| `--gold` | 29 | `#B96A35` | `#C68421` **M** | `#FFBC7D` **M** | `#EC9F4A` **M** | `#FF9061` **M** |
| `--gold-2` | 30 | `#D4BAAB` **M** | `#E0A94B` | `#FFD0A2` | `#F4BE72` | `#FFB08A` |
| `--gold-deep` | 31 | `#73371F` **M** | `#49361A` **M** | `#8A5E33` | `#805415` **M** | `#7A5C3E` **M** |

**Un solo acento por marca**, como manda el patrón: `--gold`, `--gold-2` y `--gold-deep` son el
mismo color en tres intensidades, nunca tres colores distintos.

### Contraste verificado

Todo el texto se midió **contra el parche más claro del fondo** — no contra `--void` plano, sino
contra la mezcla con el `body::before` que suma luz al 4,5 % arriba. Las cinco pasan AA:

| | Boro | La Chagra | Egeo | Cannario | OCIO |
|---|---|---|---|---|---|
| `--ink` (mín. 4.5) | 14.33 | 12.43 | 12.54 | 13.90 | 14.45 |
| `--ink-2` (mín. 4.5) | 8.01 | 6.80 | 7.40 | 8.36 | 7.32 |
| `--ink-3` (mín. 4.5) | 4.84 | 4.81 | 4.81 | 4.81 | 4.84 |
| `--gold` (mín. 3.0) | 4.50 | 5.57 | 9.69 | 7.61 | 8.00 |
| `--gold-2` (mín. 4.5) | 9.93 | 8.24 | 11.25 | 9.85 | 10.06 |

`--ink-3` es el que va más justo en las cinco: si oscurecés el fondo, hay que volver a medirlo.

**Otras líneas:** tipografías **35–36** · alto del logo **50** · posición de la cue del logo en el
intro **51** · `--ease` **54** (no la toques).

`--cue-marca-pb` es cuánto sube el logo del intro sobre el borde inferior. Está en `15vh` porque
los cuatro videos terminan sobre el letrero del propio local y, centrada, la cue se pisaba con él.
Si cambiás un video y el letrero queda en otro lado, ajustá este valor en esa carta.

---

## 2 · Tipografías

Auto-hospedadas en `<carta>/fonts/` como `woff2`, subset `latin`. **Cero requests externos**: se
descargaron de Google Fonts y se sirven desde la propia carta, como pide el patrón. Ningún plato
de los cinco datasets usa caracteres fuera del subset `latin`, por eso alcanza.

| Carta | Serif | Sans | Confirmada por el kit |
|---|---|---|---|
| Boro | Bodoni Moda | **Archivo** | Archivo está embebida en el PDF del menú |
| La Chagra | Vollkorn | **Source Sans 3** | Source Sans 3 está en el `@font-face` del sitio |
| Egeo | Spectral | **Inter** | Inter la autoaloja el propio sitio |
| Cannario | Playfair Display | **Montserrat** | Montserrat la importa el restaurante en su CSS |
| OCIO | DM Serif Display | IBM Plex Mono | ninguna de las dos: ver abajo |

Las **sans en negrita son la fuente real de la marca**. Los serif son la aproximación más cercana
disponible, porque el original no está en Google Fonts:

- **Boro** — el wordmark `boro®` está trazado como curvas, no como fuente; el kit dice
  explícitamente que no se puede confirmar la familia. Es una didone de eje vertical y `o` casi
  circular → **Bodoni Moda**.
- **La Chagra** — la carta usa **Kramola** (display de xilografía) y **Book Antiqua**. Ninguna está
  en Google Fonts → **Vollkorn**, old-style cálida y con cuerpo, que aguanta el aire tallado.
- **Egeo** — el sitio usa **Novarese Book** (ITC, autoalojada). No está en Google Fonts →
  **Spectral**, humanista con remates ligeramente acampanados.
- **Cannario** — el logo es una didone con terminales en gota, familia sin confirmar →
  **Playfair Display**, que tiene justamente esas terminales.
- **OCIO** — usa **Ambroise Std**, **Calluna** y **Antarctican Mono**, las tres de Adobe Fonts, no
  descargables → **DM Serif Display** para la didone editorial y **IBM Plex Mono** para los datos.
  El mono no es un capricho: la navegación de OCIO es monoespaciada con tracking muy abierto, y
  además alinea los precios sin esfuerzo.

---

## 3 · Logos

Ya están puestos en cabecera e intro de cada carta, en `<carta>/img/logo.png`.

Los cinco se verificaron **componiéndolos sobre el fondo oscuro real** y midiendo la luminancia de
la tinta, no sólo mirando si el PNG tenía canal alfa (tenerlo no significa ser transparente).

| Carta | Archivo del kit | Tinta |
|---|---|---|
| Boro | `01_LOGOS/VERSIONES/boro_logo_modulo_reservas.png` | nude `#D5BFAF` |
| La Chagra | `01_LOGOS/ICONOS_ISOTIPOS/la_chagra_sello_circular_kraft.png` | sello kraft |
| Egeo | `01_LOGOS/VERSIONES/egeo_logo_footer.webp` | arena `#EBE1D5` |
| Cannario | `01_LOGOS/PNG/cannario_logo_principal_crema.png` | crema `#FFF6CF` |
| OCIO | `01_LOGOS/PNG/ocio_logo_principal.png` | gris `#B7B8B8` |

> **La Chagra va con el sello circular, no con el wordmark.** El logo de header
> (`la_chagra_logo_header.png`) sí tiene fondo transparente, pero su tinta es marrón oscuro
> (`#75563E`): sobre el fondo de la carta queda en 2,6:1 y se hunde. La versión
> `la_chagra_logo_fondo_blanco.png` es 100 % opaca — una caja blanca. El sello kraft es activo
> oficial del kit, tiene transparencia real fuera del círculo y lee con holgura.
> Por ser cuadrado lleva `--logo-h` propio (línea 50): `clamp(112px,30vw,152px)`.

Si querés cambiar un logo, reemplazá `<carta>/img/logo.png`. Si el archivo falta, la carta cae
sola al wordmark tipográfico; nunca muestra un ícono roto.

---

## 4 · Ilustraciones por sección

**Ninguna de las cinco marcas tiene un set de ilustraciones por sección.** Revisé
`06_ILUSTRACIONES` y `08_ELEMENTOS_GRAFICOS` de las cinco y esto es lo que hay:

| Carta | Qué hay | Por qué no entró |
|---|---|---|
| Boro | una ilustración: la mano | Es un único símbolo, no un set. Además viene opaca sobre blanco (hay un `_mascara` aparte para recortarla) |
| La Chagra | dos ornamentos (esquina, pie) | 0 % transparentes: son cajas con fondo |
| Egeo | dos flechas SVG y una trama de puntos | Elementos de interfaz, no ilustraciones |
| Cannario | ocho imágenes de "categoría" | Son banners tipográficos 1200×300: el nombre de la sección en letras crema. En una caja de 64×64 serían una tira ilegible que repite el título |
| OCIO | nada | — |

Las cinco quedan con el **sello del número romano**, que es deliberado y se ve bien.

Por eso el bloque `ILUS` va **vacío**: así no se piden 33 archivos que no existen en cada carga de
Egeo. Justo debajo, en comentario, está la lista con el nombre exacto que espera cada sección.
Cuando tengas la ilustración, la ponés en `<carta>/img/` y descomentás su línea.

Si querés recortar la mano de Boro con su máscara y usarla en algún lado, decímelo y lo hago.

---

## 5 · Dónde va cada archivo

```
<carta>/
├── index.html
├── fonts/     ← woff2 de marca (ya están)
├── img/       ← logo.png + favicon.png (ya están) · ilustraciones y fotos de plato
└── video/     ← intro.mp4 + intro.jpg
```

### Lo que falta poner

**`video/`** — mismo nombre en las cinco:

| Archivo | Qué es |
|---|---|
| `intro.mp4` | 720p, **all-intra**, etalonaje horneado, recortado para que el frame 0 ya esté iluminado |
| `intro.jpg` | Póster: el frame 0 exacto del mp4 |

```bash
ffmpeg -i fuente.mov -c:v libx264 -crf 30 -g 1 -keyint_min 1 -sc_threshold 0 -movflags +faststart intro.mp4
```

**`img/`** — ilustraciones `sec-<id>.webp` (64×64, transparente) y fotos de plato **4:5 vertical**.

**Todas las filas abren la ficha** — platos y vinos. Las que tienen entrada en `FOTOS` muestran su
fotografía; el resto muestra el **marco de producción**. Los vinos muestran su varietal y origen y
el precio por copa y botella.

El bloque `FOTOS` sirve entonces sólo para **asignar la foto** de un plato:

```js
var FOTOS = {
  "ceviche-boro": "img/ceviche-boro.jpg",
  "id-del-plato": "img/id-del-plato.jpg"   ← agregás así
};
```

| Carta | `FOTOS` | `intro.mp4` |
|---|---|---|
| boro | 817 | ✓ 6,04 s |
| chagra | 814 | ✓ 5,17 s |
| egeo | 839 | ✓ 5,63 s |
| cannario | 813 | ✓ 4,17 s — **se funde a negro al final** |
| ocio | 811 | falta |

> **Cannario:** el clip termina en negro (brillo medio 11/255 en el último frame). Como el scrub
> mapea el clip entero sobre el scroll, al final del intro la pantalla queda negra. El patrón pide
> recortar el fundido: cortá el último medio segundo y regenerá el póster.

> En OCIO estas líneas van **una menos** que en el resto: tiene 5 caras tipográficas en vez de 6.
> Los tokens de marca (22–53) sí caen exactamente igual en las cinco.

---

## 6 · Placeholders que hay que reemplazar

No venían en `data/*.json` ni en los brand kits. Mismas líneas en las cinco (OCIO −1).

| Qué | Línea | Estado |
|---|---|---|
| `HORARIO` | **754** | Inventado. Maneja el punto de "Abierto/Cerrado" |
| `ESPECIAL` | **766** | `null` — línea de degustación oculta |
| `CONTACTO` | **770** | `[]` — bloque de contacto oculto |
| `dirV` | dentro de `DICT`, **699** | "Por completar · Medellín" |
| `tagline` | **705** | Genérico en las cinco |

El pie muestra **procedencia real** (URL de la carta y fecha de extracción) y los **avisos del
dataset**. Vaciá `AVISOS` a `[]` para producción.

### El único precio pendiente

`OCIO / PESCA PLÁTANO` sale con **"PRECIO PENDIENTE"** y la nota que lo explica: la misma imagen
imprime **$89.000** en la columna en español y **$95.000** en la inglesa. Hay que confirmarlo con
el restaurante.

---

## 7 · Idiomas — estado real

El conmutador ES/EN **traduce la interfaz, no la carta.** Medido sobre las cinco:

| Carta | Nombres traducidos | Descripciones traducidas |
|---|---|---|
| boro | 0 / 112 | 0 / 43 |
| chagra | 0 / 68 | **8 / 28** |
| egeo | 0 / 360 | 0 / 207 |
| cannario | 0 / 301 | 0 / 73 |
| ocio | **1 / 28** | 0 / 28 |

Lo que sí cambia: los 45 textos de interfaz del `DICT` (botones, rótulos, "Ver"/"View",
"Copa"/"Glass", estado del servicio, buscador, pie).

**Todo el inglés que se muestra es real y viene del dato original.** Ninguna traducción se generó:

- Las **8 descripciones de chagra** salen del campo `descripcion_en` de su carta PDF oficial.
- El nombre **PESCA PLÁTANO → PLANTAIN CATCH OF THE DAY** de OCIO sale de la columna inglesa
  registrada en su conflicto de precio. La carta física de OCIO es bilingüe, pero la extracción
  sólo capturó la columna en español.
- Los títulos como `ENTRADAS - STARTERS` o `VINOS / WINE` ya vienen bilingües en el propio dato:
  se muestran igual en los dos idiomas porque así están impresos.

### El motor ya está listo para recibir traducciones

No hay que tocar código. En el bloque `SECCIONES`, cualquier `n` o `d` acepta un objeto:

```js
{id:"ceviche-boro", n:{es:"CEVICHE BORO", en:"BORO CEVICHE"},
                    d:{es:"Con rambután…", en:"With rambutan…"}, p:"$55.000 COP"}
```

Verificado en vivo: al pasar a EN el nombre cambia y el buscador encuentra el plato por su nombre
inglés.

### Lo que NO hice, a propósito

No traduje los 869 nombres ni las 379 descripciones. Traducir una carta ajena a máquina significa
inventar el nombre comercial de un plato y, peor, reescribir alérgenos y preparaciones de un
negocio real. Un "libre de gluten" mal puesto es un problema serio, no un detalle de copy.

Las traducciones tienen que venir del restaurante. OCIO ya tiene su carta en inglés impresa.

---

## 8 · Deploy

`vercel.json` deja el deploy estático sin build. Cada carpeta se sirve en su ruta; `img/`,
`video/` y `fonts/` se cachean `immutable` y el HTML revalida. `.vercelignore` deja fuera
`node_modules`, la app Next, `data/` y los brand kits.

La raíz `/` sirve `index.html`, una portada con las cinco cartas.

Peso por carta: HTML 68–108 KB + fuentes 76–220 KB + imágenes 40–100 KB.

### Previsualizar en local

```bash
node serve.js
```

Abre en `http://localhost:4321` con la portada. Para otro puerto: `node serve.js 8080`.

**Usá este y no `python3 -m http.server`.** El de Python **no implementa Range**: ante un
`Range: bytes=100-199` responde `200` con el archivo entero en vez de `206` con los 100 bytes.
Con el intro cargado eso significa bajarse el video completo en cada seek del scrub, y Safari en
iOS directamente no reproduce sin respuestas `206`. `serve.js` no tiene dependencias y sí lo hace.

---

## 9 · Regenerar desde `data/`

Los cinco se generan desde un template común (`boro/index.html`) más su JSON y sus tokens de
marca. **Cada archivo queda autónomo y editable a mano**: para retoques puntuales editás el
`index.html` y listo. Si tocás estructura o motor y lo querés propagar a las otras cuatro,
avisame y lo regenero.
