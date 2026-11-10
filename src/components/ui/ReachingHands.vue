<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lightHandsUrl from '../../assets/images/reaching-hands-anime-light-v2.png'
import darkHandsUrl from '../../assets/images/reaching-hands-anime-dark-v2.png'

const artwork = ref(null)
const canvas = ref(null)
const failed = ref(false)
const horizontal = ref(false)
const canvasStyle = ref({})
const fallbackUrl = ref(lightHandsUrl)
const variants = {}
let themeObserver
let context
let source
let sourceBounds
let base
let baseContext
let handFrames = []
let entranceLayer
let entranceContext
let entranceParticles
let entranceParticleContext
let entranceMask
let entranceMaskContext
let entranceMaskData
let entranceFields = []
let dissolveMask
let dissolveContext
let originalPatch
let originalContext
let particlePatch
let particleContext
let pixelRatio = 1
let pixels = []
let anchors = []
let resizeObserver
let intersectionObserver
let inView = true
let motion
let frame = 0
let lastTime = 0
let elapsed = 0
let arrival = 0
let intensity = 0
let active = false
let focused = false
let pointerInside = false
let width = 0
let height = 0
let padding = 0
let fullHeight = 0
let hoverRadius = 0
let phase = Math.random() * Math.PI * 2
let disposed = false
const pointer = { x: 0, y: 0 }
const position = { x: 0, y: 0 }
const entrancePhases = [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2]

function selectSource() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  fallbackUrl.value = theme === 'dark' ? darkHandsUrl : lightHandsUrl
  if (!sourceBounds) return
  const next = variants[theme]?.naturalWidth ? variants[theme] : Object.values(variants).find(image => image.naturalWidth)
  if (!next || source === next) return
  source = next
  rebuild()
  // Paint the ready variant in the theme mutation microtask so the native
  // page fade captures matching artwork without restarting its movement.
  if (width && height && inView && !document.hidden) {
    cancelAnimationFrame(frame)
    frame = 0
    draw(performance.now())
  }
}

function loadSources() {
  if (variants.light) return
  let settled = 0
  const ready = () => {
    if (disposed || ++settled < 2) return
    const canonical = variants.light.naturalWidth ? variants.light : variants.dark
    if (!canonical.naturalWidth) { failed.value = true; return }
    // Share anchors between variants, but reserve room for both silhouettes.
    sourceBounds = locateTips(canonical)
    for (const image of Object.values(variants)) {
      if (!image.naturalWidth || image === canonical) continue
      const other = locateTips(image)
      for (const kind of ['human', 'robot']) {
        sourceBounds[kind].minX = Math.min(sourceBounds[kind].minX, other[kind].minX)
        sourceBounds[kind].maxX = Math.max(sourceBounds[kind].maxX, other[kind].maxX)
      }
    }
    selectSource()
  }
  for (const [theme, url] of Object.entries({ light: lightHandsUrl, dark: darkHandsUrl })) {
    const image = new Image()
    variants[theme] = image
    image.onload = image.onerror = ready
    image.src = url
  }
}

function requestDraw() {
  if (!frame && context && sourceBounds && width && inView && !document.hidden) frame = requestAnimationFrame(draw)
}

function fit() {
  const bounds = artwork.value.getBoundingClientRect()
  // CSS owns the breakpoint. Keep the renderer's portrait coordinate system
  // and rotate its canvas for the in-flow horizontal hero.
  const nextHorizontal = getComputedStyle(artwork.value).position !== 'fixed'
  const nextWidth = Math.round(nextHorizontal ? bounds.height : bounds.width)
  const nextHeight = Math.round(nextHorizontal ? bounds.width : bounds.height)
  if (nextHorizontal !== horizontal.value || nextWidth !== width || nextHeight !== height) pointerInside = false
  horizontal.value = nextHorizontal
  canvasStyle.value = nextHorizontal ? { width: `${bounds.height}px`, height: `${bounds.width}px` } : {}
  width = nextWidth
  height = nextHeight
  syncInteraction()
  if (!width || !height) {
    cancelAnimationFrame(frame)
    frame = 0
    lastTime = 0
    return
  }
  loadSources()
  const ratio = Math.min(devicePixelRatio || 1, horizontal.value ? 3 : 2)
  pixelRatio = ratio
  canvas.value.width = Math.round(width * ratio)
  canvas.value.height = Math.round(height * ratio)
  context?.setTransform(ratio, 0, 0, ratio, 0, 0)
  entranceLayer.width = canvas.value.width
  entranceLayer.height = canvas.value.height
  entranceContext.setTransform(ratio, 0, 0, ratio, 0, 0)
  entranceParticles.width = canvas.value.width
  entranceParticles.height = canvas.value.height
  entranceParticleContext.setTransform(ratio, 0, 0, ratio, 0, 0)
  if (!pointerInside) {
    pointer.x = position.x = width / 2
    pointer.y = position.y = height / 2
  }
  rebuild()
}

function locateTips(image) {
  const probe = document.createElement('canvas')
  probe.width = image.naturalWidth
  probe.height = image.naturalHeight
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0)
  const data = ctx.getImageData(0, 0, probe.width, probe.height).data
  const seam = Math.floor(probe.height / 2)
  // Find the generated image's real empty band rather than assuming the
  // fingertips land on an exact percentage of its canvas.
  let runStart = 0
  let longest = { start: seam, length: 0 }
  for (let y = Math.floor(probe.height * .35); y < probe.height * .65; y++) {
    let mass = 0
    for (let x = 0; x < probe.width; x++) {
      const alpha = data[(y * probe.width + x) * 4 + 3]
      if (alpha >= 40) mass += alpha
    }
    if (mass <= 200) {
      if (!runStart) runStart = y
      if (y - runStart + 1 > longest.length) longest = { start: runStart, length: y - runStart + 1 }
    } else runStart = 0
  }
  function edge(start, end, direction) {
    for (let y = start; y !== end; y += direction) {
      let mass = 0
      let weightedX = 0
      for (let x = 0; x < probe.width; x++) {
        const alpha = data[(y * probe.width + x) * 4 + 3]
        if (alpha < 40) continue
        mass += alpha
        weightedX += x * alpha
      }
      if (mass > 200) return { y, x: weightedX / mass }
    }
    return { y: start, x: probe.width / 2 }
  }
  const bounds = {
    human: edge(longest.length ? longest.start - 1 : seam - 1, 0, -1),
    robot: edge(longest.length ? longest.start + longest.length : seam, probe.height - 1, 1),
  }
  for (const [kind, tip] of Object.entries(bounds)) {
    tip.minX = probe.width
    tip.maxX = 0
    // Include the entire forearm, not only the fingers near the gap. The old
    // partial bounds let the upper forearm clip against the rail's right side.
    const first = kind === 'human' ? 0 : tip.y
    const last = kind === 'human' ? tip.y : probe.height - 1
    for (let y = first; y <= last; y++) {
      for (let x = 0; x < probe.width; x++) {
        if (data[(y * probe.width + x) * 4 + 3] < 40) continue
        tip.minX = Math.min(tip.minX, x)
        tip.maxX = Math.max(tip.maxX, x)
      }
    }
  }
  return bounds
}

function forearmSegments(crop, hand) {
  const overscan = Math.max(32, height * .025)
  const end = crop.y + crop.height
  const extendTop = hand === 0 && crop.y > -overscan
  const extendBottom = hand === 1 && end < height + overscan
  if (!extendTop && !extendBottom) return [crop]

  // On tall, narrow viewports, continue only the straight forearm to the
  // screen edge. Fingers, palm and wrist retain their uniform proportions.
  const split = Math.round(crop.sourceHeight * (hand === 0 ? .32 : .78))
  const join = crop.y + crop.height * split / crop.sourceHeight
  const top = extendTop ? -overscan : crop.y
  const bottom = extendBottom ? height + overscan : end
  return [
    { ...crop, sourceHeight: split, y: top, height: join - top },
    { ...crop, sourceY: crop.sourceY + split, sourceHeight: crop.sourceHeight - split,
      y: join, height: bottom - join },
  ]
}

function paintHand(ctx, hand, offsetY = 0) {
  const segments = handFrames[hand]
  for (const crop of segments) {
    if (segments.length === 1) {
      ctx.drawImage(source, 0, crop.sourceY, source.naturalWidth, crop.sourceHeight,
        crop.x, crop.y + offsetY, crop.width, crop.height)
      continue
    }
    // Sample beyond the shared edge, then clip to complementary regions.
    // Add their premultiplied coverage so fractional/rotated joins cannot
    // leave a dark line through the arm or soften the source's outer edge.
    const before = Math.min(2, crop.sourceY)
    const after = Math.min(2, source.naturalHeight - crop.sourceY - crop.sourceHeight)
    const scaleY = crop.height / crop.sourceHeight
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.beginPath()
    ctx.rect(crop.x, crop.y + offsetY, crop.width, crop.height)
    ctx.clip()
    ctx.drawImage(source, 0, crop.sourceY - before, source.naturalWidth, crop.sourceHeight + before + after,
      crop.x, crop.y + offsetY - before * scaleY, crop.width, crop.height + (before + after) * scaleY)
    ctx.restore()
  }
}

function rebuild() {
  if (!context || !sourceBounds || !width || !height) return
  padding = Math.max(48, Math.round(height * .12))
  fullHeight = height + padding * 2
  hoverRadius = Math.min(92, Math.max(62, width * .21))
  dissolveMask.width = dissolveMask.height = 2 * Math.ceil(hoverRadius * 1.3)
  const patchSize = Math.ceil(dissolveMask.width * pixelRatio)
  originalPatch.width = originalPatch.height = patchSize
  particlePatch.width = particlePatch.height = patchSize
  originalContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  base.width = width
  base.height = fullHeight

  // Anchor the visible fingertips on opposite sides of a real empty gap.
  // Rotation pivots at the tips; bounded independent drift cannot close it.
  const gap = horizontal.value ? Math.max(40, Math.min(80, height * .09))
    : Math.max(24, height * .09)
  const partHeight = fullHeight / 2 - gap / 2
  const frameHand = (tip, sourceHeight) => {
    const inset = 22
    // Size uniformly from the viewport height. A percentage of the shrinking
    // desktop rail made zoomed hands thin and required long stretched forearms.
    // Limit width only when the silhouette would actually approach the edges.
    const crossAxisLimit = (width - inset * 2) * .88
    const scale = Math.min(.88 * partHeight / sourceHeight,
      crossAxisLimit / Math.max(1, tip.maxX - tip.minX))
    const drawnWidth = source.naturalWidth * scale
    const desired = width / 2 - tip.x * scale
    const minimum = inset - tip.minX * scale
    const maximum = width - inset - tip.maxX * scale
    return { x: Math.max(minimum, Math.min(maximum, desired)),
      width: drawnWidth, height: sourceHeight * scale }
  }
  const humanHeight = sourceBounds.human.y + 1
  const robotStart = sourceBounds.robot.y
  const human = frameHand(sourceBounds.human, humanHeight)
  const robot = frameHand(sourceBounds.robot, source.naturalHeight - robotStart)
  handFrames = [
    { sourceY: 0, sourceHeight: humanHeight, x: human.x,
      y: height / 2 - gap / 2 - human.height, width: human.width, height: human.height },
    { sourceY: robotStart, sourceHeight: source.naturalHeight - robotStart, x: robot.x,
      y: height / 2 + gap / 2, width: robot.width, height: robot.height },
  ].map(forearmSegments)
  paintHand(baseContext, 0, padding)
  paintHand(baseContext, 1, padding)
  anchors = [
    { x: human.x + human.width * sourceBounds.human.x / source.naturalWidth, y: height / 2 - gap / 2 },
    { x: robot.x + robot.width * sourceBounds.robot.x / source.naturalWidth, y: height / 2 + gap / 2 },
  ]

  // This low-resolution surface is only for particle analysis, never display.
  const data = baseContext.getImageData(0, 0, width, fullHeight).data
  pixels = []
  const pitch = 5
  for (let y = 0; y < fullHeight; y += pitch) {
    for (let x = 0; x < width; x += pitch) {
      let coverage = 0
      let massX = 0
      let massY = 0
      let red = 0
      let green = 0
      let blue = 0
      for (let sy = y; sy < Math.min(y + pitch, fullHeight); sy++) {
        for (let sx = x; sx < Math.min(x + pitch, width); sx++) {
          const i = (sy * width + sx) * 4
          const alpha = data[i + 3] / 255
          coverage += alpha
          massX += sx * alpha
          massY += sy * alpha
          red += data[i] * alpha
          green += data[i + 1] * alpha
          blue += data[i + 2] * alpha
        }
      }
      if (coverage < .14) continue
      pixels.push({
        x: massX / coverage, y: massY / coverage - padding,
        hand: y < fullHeight / 2 ? 0 : 1,
        radius: Math.min(2.15, Math.sqrt(coverage / Math.PI) * .74),
        color: 'rgb(' + Math.round(red / coverage) + ',' + Math.round(green / coverage) + ',' + Math.round(blue / coverage) + ')',
        seed: Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1,
      })
    }
  }
  if (arrival < 1 && !motion.matches) prepareEntrance()
  requestDraw()
}

function poses(still) {
  if (still) return [{ x: 0, y: 0, angle: 0 }, { x: 0, y: 0, angle: 0 }]
  const t = elapsed
  return [
    { x: Math.sin(t * .72 + .8) * 5 + Math.cos(t * .31) * 1.5,
      y: Math.sin(t * .91) * 6 + Math.cos(t * .37) * 2,
      angle: Math.sin(t * .48) * .008 },
    { x: Math.sin(t * .58 + 2.1) * 6,
      y: Math.cos(t * .79 + 1.4) * 7 + Math.sin(t * .33) * 1.5,
      angle: Math.cos(t * .43 + 1.2) * .01 },
  ]
}

function smoothStep(value) {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

function directionalDepth(y, hand) {
  const distance = hand ? height - y : y
  const length = hand ? height - anchors[hand].y : anchors[hand].y
  return Math.max(0, Math.min(1, distance / length))
}

function blobLobes(radius, turn) {
  return [
    { x: 0, y: 0, r: radius * .78 },
    { x: Math.cos(turn) * radius * .35, y: Math.sin(turn) * radius * .3, r: radius * .63 },
    { x: Math.cos(turn + 2.5) * radius * .32, y: Math.sin(turn + 2.5) * radius * .35, r: radius * .6 },
  ]
}

function blobSoftEdge(distance) {
  return 1 - smoothStep((distance - .5) / .5)
}

function blobInfluence(dx, dy, lobes) {
  return 1 - lobes.reduce((remaining, lobe) =>
    remaining * (1 - blobSoftEdge(Math.hypot(dx - lobe.x, dy - lobe.y) / lobe.r)), 1)
}

function prepareEntrance() {
  // Grow the same three-lobed shapes as the hover interaction along each
  // arm. A fixed random path per mount replaces the former straight wipe.
  const columns = Math.ceil(width / 4) + 1
  const rows = Math.ceil(fullHeight / 4) + 1
  entranceMask.width = columns
  entranceMask.height = rows
  entranceMaskData = entranceMaskContext.createImageData(columns, rows)
  for (let i = 0; i < columns * rows; i++) entranceMaskData.data.fill(255, i * 4, i * 4 + 3)
  entranceFields = [0, 1].map(hand => {
    const dots = pixels.filter(dot => dot.hand === hand)
    const length = hand ? height - anchors[hand].y : anchors[hand].y
    const count = Math.ceil(length / (hoverRadius * .55))
    const stamps = []
    for (let step = 0; step <= count; step++) {
      const depth = step / count
      const y = hand ? height - depth * length : depth * length
      const nearby = dots.filter(dot => Math.abs(dot.y - y) < hoverRadius * .4)
      const center = nearby.length ? nearby.reduce((sum, dot) => sum + dot.x, 0) / nearby.length : anchors[hand].x
      const span = nearby.length ? Math.max(...nearby.map(dot => dot.x)) - Math.min(...nearby.map(dot => dot.x)) : hoverRadius
      const turn = entrancePhases[hand] + step * 1.3
      const radius = Math.max(hoverRadius, span * .85 + 20) * (1 + Math.sin(turn * 1.7) * .15)
      stamps.push({ x: center + Math.sin(turn) * radius * .16, y,
        delay: depth, lobes: blobLobes(radius, turn) })
    }
    const arrivalAt = (x, y) => {
      let earliest = Infinity
      for (const stamp of stamps) {
        if (stamp.delay >= earliest) continue
        let remaining = 1
        let closest = Infinity
        for (const lobe of stamp.lobes) {
          const distance = Math.hypot(x - stamp.x - lobe.x, y - stamp.y - lobe.y) / lobe.r
          closest = Math.min(closest, distance)
          remaining *= 1 - blobSoftEdge(distance)
        }
        // Avoid a flat arrival time across a blob's core: neighboring dots
        // should flow into view instead of appearing in simultaneous batches.
        earliest = Math.min(earliest, stamp.delay + Math.min(closest, 1) * .1 + remaining * .22 + Math.max(0, closest - 1) * .45)
      }
      return earliest
    }
    // Cache spatial arrival times once. Only alpha changes during playback;
    // the artwork itself continues to render from native-resolution pixels.
    let maximum = 0
    for (const dot of dots) {
      dot.entranceDepth = arrivalAt(dot.x, dot.y)
      maximum = Math.max(maximum, dot.entranceDepth)
    }
    maximum += .08
    for (const dot of dots) dot.entranceDepth /= maximum
    const depths = new Float32Array(columns * rows)
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        depths[row * columns + column] = arrivalAt(column * width / (columns - 1), row * fullHeight / (rows - 1) - padding) / maximum
      }
    }
    return { depths, stamps }
  })
}

function paintParticle(ctx, dot, x, y, dx, dy, amount, still, offsetX = 0, offsetY = 0, drift = amount) {
  const scatter = still ? 0 : drift * (3 + 5 * Math.abs(dot.seed))
  const angle = Math.atan2(dy, dx) + dot.seed
  const tremble = still ? 0 : Math.sin(elapsed * 1.4 + dot.seed * 12) * 1.2 * drift
  ctx.fillStyle = dot.color
  ctx.beginPath()
  ctx.arc(x + Math.cos(angle) * scatter + tremble - offsetX, y + Math.sin(angle) * scatter - offsetY,
    Math.max(.5, dot.radius * (.85 + amount * .2)), 0, Math.PI * 2)
  ctx.fill()
}

function entranceProgress(progress) {
  // Ease velocity only at the ends, keeping an even flow through the arms.
  const ramp = .12
  const edge = value => (value - ramp / Math.PI * Math.sin(Math.PI * value / ramp)) / 2
  const distance = progress < ramp ? edge(progress)
    : progress > 1 - ramp ? 1 - ramp - edge(1 - progress)
      : progress - ramp / 2
  return distance / (1 - ramp)
}

function solidArrival(depth, sweep) {
  return smoothStep((sweep - depth - .25) / .45)
}

function applyPose(ctx, pose, hand) {
  const anchor = anchors[hand]
  ctx.translate(anchor.x + pose.x, anchor.y + pose.y)
  ctx.rotate(pose.angle)
  ctx.translate(-anchor.x, -anchor.y)
}

function paintArrival(pose, hand, sweep) {
  const field = entranceFields[hand]
  for (let i = 0; i < field.depths.length; i++) {
    entranceMaskData.data[i * 4 + 3] = Math.round(solidArrival(field.depths[i], sweep) * 255)
  }
  entranceMaskContext.putImageData(entranceMaskData, 0, 0)
  entranceContext.clearRect(0, 0, width, height)
  entranceContext.save()
  applyPose(entranceContext, pose, hand)
  entranceContext.imageSmoothingQuality = 'high'
  paintHand(entranceContext, hand)
  entranceContext.globalCompositeOperation = 'destination-in'
  entranceContext.drawImage(entranceMask, 0, -padding, width, fullHeight)
  entranceContext.restore()

  entranceParticleContext.clearRect(0, 0, width, height)
  entranceParticleContext.save()
  applyPose(entranceParticleContext, pose, hand)
  for (const dot of pixels) {
    if (dot.hand !== hand) continue
    const depth = dot.entranceDepth
    const appeared = smoothStep((sweep - depth) / .22)
    const opacity = appeared * (1 - solidArrival(depth, sweep))
    if (opacity < .005) continue
    entranceParticleContext.globalAlpha = opacity
    const origin = field.stamps[Math.min(field.stamps.length - 1, Math.round(directionalDepth(dot.y, hand) * (field.stamps.length - 1)))]
    // Keep the cloud's scatter stable while opacity changes. Scaling its
    // position by opacity made dots dart outward and snap back as they faded.
    paintParticle(entranceParticleContext, dot, dot.x, dot.y, dot.x - origin.x, dot.y - origin.y, opacity, false, 0, 0, .35)
  }
  entranceParticleContext.restore()
  context.save()
  // As in the hover effect, dots overlap with source-over internally, then
  // add to the complementary source layer without dark rims or bright rings.
  context.globalCompositeOperation = 'lighter'
  context.drawImage(entranceLayer, 0, 0, width, height)
  context.drawImage(entranceParticles, 0, 0, width, height)
  context.restore()
}

function draw(time) {
  frame = 0
  const dt = lastTime ? Math.min(time - lastTime, 1000) : 16
  lastTime = time
  const still = motion.matches
  if (!still) elapsed += dt / 1000
  arrival = still ? 1 : Math.min(1, arrival + dt / 2800)
  const ease = still ? 1 : 1 - Math.exp(-dt / 130)
  intensity += ((active && arrival >= 1 ? 1 : 0) - intensity) * ease
  position.x += (pointer.x - position.x) * ease
  position.y += (pointer.y - position.y) * ease
  if (arrival < 1 && !entranceFields.length) prepareEntrance()
  const sweep = entranceProgress(arrival) * 1.7
  const movement = poses(still).map(p => ({ ...p, cos: Math.cos(p.angle), sin: Math.sin(p.angle) }))
  context.clearRect(0, 0, width, height)
  movement.forEach((pose, hand) => {
    if (arrival < 1) {
      paintArrival(pose, hand, sweep)
      return
    }
    context.save()
    applyPose(context, pose, hand)
    // Draw directly from the native image to the device-resolution canvas.
    // Avoid the old downsample-then-enlarge path that softened the artwork.
    context.imageSmoothingQuality = 'high'
    paintHand(context, hand)
    context.restore()
  })

  if (arrival >= 1 && intensity > .006) dissolve(movement, still)
  if (!still || intensity > .006 && !active) requestDraw()
  else lastTime = 0
}

function dissolve(movement, still) {
  const px = position.x
  const py = position.y
  const radius = hoverRadius
  const strength = intensity
  if (py < -radius * 1.3 || py > height + radius * 1.3) return
  const turn = phase + elapsed * .25
  const lobes = blobLobes(radius, turn)
  const maskSize = 2 * Math.ceil(radius * 1.3)
  if (dissolveMask.width !== maskSize) {
    dissolveMask.width = dissolveMask.height = maskSize
    const size = Math.ceil(maskSize * pixelRatio)
    originalPatch.width = originalPatch.height = size
    particlePatch.width = particlePatch.height = size
    originalContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }
  const center = maskSize / 2
  dissolveContext.clearRect(0, 0, dissolveMask.width, dissolveMask.height)
  for (const lobe of lobes) {
    const x = center + lobe.x
    const y = center + lobe.y
    const fade = dissolveContext.createRadialGradient(x, y, 0, x, y, lobe.r)
    for (let step = 0; step <= 12; step++) {
      fade.addColorStop(step / 12, 'rgba(255,255,255,' + blobSoftEdge(step / 12) + ')')
    }
    dissolveContext.fillStyle = fade
    dissolveContext.fillRect(x - lobe.r, y - lobe.r, lobe.r * 2, lobe.r * 2)
  }
  const extent = originalPatch.width / pixelRatio
  const left = Math.round((px - extent / 2) * pixelRatio) / pixelRatio
  const top = Math.round((py - extent / 2) * pixelRatio) / pixelRatio
  originalContext.clearRect(0, 0, extent, extent)
  originalContext.drawImage(canvas.value, left * pixelRatio, top * pixelRatio,
    originalPatch.width, originalPatch.height, 0, 0, extent, extent)
  particleContext.clearRect(0, 0, extent, extent)

  for (const dot of pixels) {
    const pose = movement[dot.hand]
    const anchor = anchors[dot.hand]
    const localX = dot.x - anchor.x
    const localY = dot.y - anchor.y
    const x = anchor.x + pose.x + localX * pose.cos - localY * pose.sin
    const y = anchor.y + pose.y + localX * pose.sin + localY * pose.cos
    const dx = x - px
    const dy = y - py
    if (Math.abs(dx) > radius * 1.3 || Math.abs(dy) > radius * 1.3) continue
    const influence = blobInfluence(dx, dy, lobes)
    const amount = influence * strength
    paintParticle(particleContext, dot, x, y, dx, dy, amount, still, left, top)
  }
  // Crossfade the two premultiplied images with complementary weights.
  // Source-over after erasure attenuates the original twice under each dot,
  // producing a dark transition band; additive blending preserves its color.
  originalContext.save()
  originalContext.globalCompositeOperation = 'destination-out'
  originalContext.globalAlpha = strength
  originalContext.drawImage(dissolveMask, 0, 0, extent, extent)
  originalContext.restore()
  particleContext.save()
  particleContext.globalCompositeOperation = 'destination-in'
  particleContext.globalAlpha = strength
  particleContext.drawImage(dissolveMask, 0, 0, extent, extent)
  particleContext.restore()
  originalContext.save()
  originalContext.globalCompositeOperation = 'lighter'
  originalContext.drawImage(particlePatch, 0, 0, extent, extent)
  originalContext.restore()
  context.clearRect(left, top, extent, extent)
  context.drawImage(originalPatch, left, top, extent, extent)
}

function syncInteraction() {
  focused = focused && width > 0 && height > 0
    && document.activeElement === artwork.value && artwork.value.matches(':focus-visible')
  active = inView && !document.hidden && document.hasFocus() && (pointerInside || focused)
  if (!pointerInside && focused) {
    pointer.x = width / 2
    pointer.y = height / 2
  }
  // A departed pointer must not leave an animated blob at its old position.
  if (!active) intensity = 0
}

function move(event) {
  const overArtwork = event.target instanceof Node && artwork.value.contains(event.target)
  if (!pointerInside && !overArtwork) return
  if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
    leave()
    return
  }
  const bounds = artwork.value.getBoundingClientRect()
  const inside = overArtwork && event.clientX >= bounds.left && event.clientX < bounds.right
    && event.clientY >= bounds.top && event.clientY < bounds.bottom && bounds.width > 0 && bounds.height > 0
  if (!inside) {
    leave()
    return
  }
  const x = (event.clientX - bounds.left) / bounds.width
  const y = (event.clientY - bounds.top) / bounds.height
  pointer.x = horizontal.value ? y * width : x * width
  pointer.y = horizontal.value ? (1 - x) * height : y * height
  if (!pointerInside) {
    // Re-enter at the real cursor, rather than easing across the artwork
    // from a position left over from the previous hover.
    position.x = pointer.x
    position.y = pointer.y
    phase = Math.random() * Math.PI * 2
  }
  pointerInside = true
  syncInteraction()
  requestDraw()
}

function enter(event) {
  move(event)
}

function leave() {
  pointerInside = false
  syncInteraction()
  requestDraw()
}

function pointerDown(event) {
  // Clicking a tabindex-enabled figure gives it DOM focus, but that is not
  // a request for the centered keyboard preview.
  focused = false
  move(event)
  syncInteraction()
  requestDraw()
}

function focus() {
  focused = artwork.value.matches(':focus-visible')
  if (focused && !pointerInside) {
    pointer.x = position.x = width / 2
    pointer.y = position.y = height / 2
  }
  syncInteraction()
  requestDraw()
}

function blur() {
  focused = false
  syncInteraction()
  requestDraw()
}

function suspendInteraction() {
  pointerInside = false
  active = false
  intensity = 0
  requestDraw()
}

function resume() {
  cancelAnimationFrame(frame)
  frame = 0
  lastTime = 0
  syncInteraction()
  if (!document.hidden) requestDraw()
}

function visibilityChange() {
  if (document.hidden) suspendInteraction()
  resume()
}

function scrollInteraction() {
  if (horizontal.value && pointerInside) leave()
}

onMounted(() => {
  context = canvas.value.getContext('2d')
  if (!context) { failed.value = true; return }
  base = document.createElement('canvas')
  baseContext = base.getContext('2d', { willReadFrequently: true })
  entranceLayer = document.createElement('canvas')
  entranceContext = entranceLayer.getContext('2d')
  entranceParticles = document.createElement('canvas')
  entranceParticleContext = entranceParticles.getContext('2d')
  entranceMask = document.createElement('canvas')
  entranceMaskContext = entranceMask.getContext('2d')

  dissolveMask = document.createElement('canvas')
  dissolveContext = dissolveMask.getContext('2d')
  originalPatch = document.createElement('canvas')
  originalContext = originalPatch.getContext('2d')
  particlePatch = document.createElement('canvas')
  particleContext = particlePatch.getContext('2d')
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', resume)
  themeObserver = new MutationObserver(selectSource)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  selectSource()
  resizeObserver = new ResizeObserver(fit)
  resizeObserver.observe(artwork.value)
  intersectionObserver = new IntersectionObserver(([entry]) => {
    if (inView === entry.isIntersecting) return
    inView = entry.isIntersecting
    if (!inView) suspendInteraction()
    resume()
  })
  intersectionObserver.observe(artwork.value)
  document.addEventListener('pointermove', move, true)
  document.addEventListener('pointerdown', pointerDown, true)
  document.addEventListener('pointercancel', leave, true)
  document.documentElement.addEventListener('pointerleave', leave)
  window.addEventListener('blur', suspendInteraction)
  window.addEventListener('focus', resume)
  window.addEventListener('scroll', scrollInteraction, { passive: true })
  document.addEventListener('visibilitychange', visibilityChange)
  fit()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  themeObserver?.disconnect()
  motion?.removeEventListener('change', resume)
  document.removeEventListener('pointermove', move, true)
  document.removeEventListener('pointerdown', pointerDown, true)
  document.removeEventListener('pointercancel', leave, true)
  document.documentElement.removeEventListener('pointerleave', leave)
  window.removeEventListener('blur', suspendInteraction)
  window.removeEventListener('focus', resume)
  window.removeEventListener('scroll', scrollInteraction)
  document.removeEventListener('visibilitychange', visibilityChange)
  for (const image of Object.values(variants)) image.onload = image.onerror = null
})
</script>

<template>
  <figure
    ref="artwork"
    class="reaching-hands"
    :class="{ 'reaching-hands--horizontal': horizontal }"
    tabindex="0"
    role="img"
    :aria-label="`An anime illustration of a brown human hand and a robotic hand reaching ${horizontal ? 'from the right and left' : 'from above and below'}, floating independently across a clear gap. The robot has smooth fingertips matching its black armor in light mode and white armor in dark mode. Move over either hand or focus here to dissolve its surface into dots.`"
    @pointerenter="enter"
    @pointerleave="leave"
    @focus="focus"
    @blur="blur"
  >
    <canvas ref="canvas" :style="canvasStyle" aria-hidden="true" />
    <img v-if="failed" class="hands-fallback" :src="fallbackUrl" :style="canvasStyle" alt="" aria-hidden="true">
  </figure>
</template>

<style scoped>
.reaching-hands {
  display: block;
  position: relative;
  width: 100%;
  height: clamp(180px, min(40vw, 52svh), 320px);
  margin: 0 0 var(--entry-gap);
  overflow: hidden;
  outline: none;
}
.reaching-hands:focus-visible { outline: 1px dashed var(--sketch); outline-offset: -8px; }
.reaching-hands canvas, .hands-fallback { display: block; width: 100%; height: 100%; }
.hands-fallback { position: absolute; inset: -12% 0; height: 124%; object-fit: cover; }
.reaching-hands--horizontal :is(canvas, .hands-fallback) {
  position: absolute;
  inset: auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
}
@media (min-width: 761px) and (max-width: 1280px) {
  .reaching-hands { width: calc(100% + 112px); margin-left: -52px; }
}
@media (min-width: 761px) and (max-width: 1100px) {
  .reaching-hands { width: calc(100% + 80px); margin-left: -40px; }
}
@media (max-width: 760px) {
  .reaching-hands { width: calc(100% + 48px); margin-left: -24px; }
}
@media (max-width: 370px) {
  .reaching-hands { width: calc(100% + 40px); margin-left: -20px; }
}
@media (min-width: 1281px) {
  .reaching-hands {
    position: fixed;
    inset: 0 0 0 var(--home-art-start);
    width: auto;
    height: 100dvh;
    margin: 0;
  }
}
</style>
