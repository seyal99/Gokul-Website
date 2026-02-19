<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  shaderCode: {
    type: String,
    required: true
  },
  class: {
    type: [String, Array, Object],
    default: ""
  },
  hue: {
    type: Number,
    default: 0
  },
  saturation: {
    type: Number,
    default: 1
  },
  brightness: {
    type: Number,
    default: 1
  },
  speed: {
    type: Number,
    default: 1
  },
  mouseSensitivity: {
    type: Number,
    default: 0.5
  },
  damping: {
    type: Number,
    default: 1
  },
  noise: {
    type: Object,
    default: () => ({ opacity: 0, scale: 1 })
  }
});

const canvasRef = ref(null);
const shaderError = ref("");

let gl = null;
let program = null;
let rafId = 0;
let animationTime = 0;
let lastFrameTime = 0;
let currentMouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };

const uniforms = {
  iResolution: null,
  iTime: null,
  iMouse: null,
  uHue: null,
  uSaturation: null,
  uBrightness: null,
  uNoiseOpacity: null,
  uNoiseScale: null
};

const vertexSource = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

function getFragmentSource() {
  return `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform float uHue;
uniform float uSaturation;
uniform float uBrightness;
uniform float uNoiseOpacity;
uniform float uNoiseScale;

${props.shaderCode}

vec3 hueShift(vec3 color, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  mat3 m = mat3(
    0.299 + 0.701 * c + 0.168 * s, 0.587 - 0.587 * c + 0.330 * s, 0.114 - 0.114 * c - 0.497 * s,
    0.299 - 0.299 * c - 0.328 * s, 0.587 + 0.413 * c + 0.035 * s, 0.114 - 0.114 * c + 0.292 * s,
    0.299 - 0.300 * c + 1.250 * s, 0.587 - 0.588 * c - 1.050 * s, 0.114 + 0.886 * c - 0.203 * s
  );
  return clamp(m * color, 0.0, 1.0);
}

float rand(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 outColor = vec4(0.0);
  mainImage(outColor, gl_FragCoord.xy);
  vec3 color = outColor.rgb;
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(gray), color, uSaturation);
  color = hueShift(color, uHue);
  color *= uBrightness;
  float n = rand(gl_FragCoord.xy * uNoiseScale + iMouse * 25.0 + iTime);
  color += (n - 0.5) * uNoiseOpacity;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
}

function compileShader(ctx, type, source) {
  const shader = ctx.createShader(type);
  if (!shader) return null;
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);

  if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    shaderError.value = ctx.getShaderInfoLog(shader) || "Shader compile failed";
    ctx.deleteShader(shader);
    return null;
  }

  return shader;
}

function cleanupProgram() {
  if (!gl || !program) return;
  gl.deleteProgram(program);
  program = null;
}

function initProgram() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  shaderError.value = "";
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    shaderError.value = "WebGL is unavailable in this browser/device.";
    return;
  }

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, getFragmentSource());
  if (!vertexShader || !fragmentShader) return;

  const nextProgram = gl.createProgram();
  if (!nextProgram) {
    shaderError.value = "Failed to create WebGL program.";
    return;
  }

  gl.attachShader(nextProgram, vertexShader);
  gl.attachShader(nextProgram, fragmentShader);
  gl.linkProgram(nextProgram);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
    shaderError.value = gl.getProgramInfoLog(nextProgram) || "Shader link failed";
    gl.deleteProgram(nextProgram);
    return;
  }

  program = nextProgram;
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  uniforms.iResolution = gl.getUniformLocation(program, "iResolution");
  uniforms.iTime = gl.getUniformLocation(program, "iTime");
  uniforms.iMouse = gl.getUniformLocation(program, "iMouse");
  uniforms.uHue = gl.getUniformLocation(program, "uHue");
  uniforms.uSaturation = gl.getUniformLocation(program, "uSaturation");
  uniforms.uBrightness = gl.getUniformLocation(program, "uBrightness");
  uniforms.uNoiseOpacity = gl.getUniformLocation(program, "uNoiseOpacity");
  uniforms.uNoiseScale = gl.getUniformLocation(program, "uNoiseScale");
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas || !gl) return;

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

function renderFrame(time) {
  if (!gl || !program || shaderError.value) return;

  if (!lastFrameTime) lastFrameTime = time;
  resizeCanvas();

  const deltaSeconds = Math.max(0, (time - lastFrameTime) / 1000);
  lastFrameTime = time;
  animationTime += deltaSeconds * Math.max(0, props.speed);

  const damping = Math.min(1, Math.max(0, props.damping));
  currentMouse.x += (targetMouse.x - currentMouse.x) * (1 - damping);
  currentMouse.y += (targetMouse.y - currentMouse.y) * (1 - damping);

  gl.useProgram(program);
  gl.uniform2f(uniforms.iResolution, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(uniforms.iTime, animationTime);
  gl.uniform2f(uniforms.iMouse, currentMouse.x, currentMouse.y);
  gl.uniform1f(uniforms.uHue, props.hue);
  gl.uniform1f(uniforms.uSaturation, props.saturation);
  gl.uniform1f(uniforms.uBrightness, props.brightness);
  gl.uniform1f(uniforms.uNoiseOpacity, props.noise?.opacity ?? 0);
  gl.uniform1f(uniforms.uNoiseScale, props.noise?.scale ?? 1);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  rafId = requestAnimationFrame(renderFrame);
}

function onPointerMove(event) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = 1 - (event.clientY - rect.top) / rect.height;
  targetMouse.x = (x - 0.5) * props.mouseSensitivity;
  targetMouse.y = (y - 0.5) * props.mouseSensitivity;
}

function start() {
  cancelAnimationFrame(rafId);
  cleanupProgram();
  animationTime = 0;
  lastFrameTime = 0;
  initProgram();

  if (!shaderError.value) {
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", onPointerMove);
    rafId = requestAnimationFrame(renderFrame);
  }
}

onMounted(start);

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("resize", resizeCanvas);
  window.removeEventListener("pointermove", onPointerMove);
  cleanupProgram();
});

watch(() => props.shaderCode, start);
</script>

<template>
  <canvas ref="canvasRef" :class="props.class" class="shader-canvas"></canvas>
  <div v-if="shaderError" class="shader-error">{{ shaderError }}</div>
</template>

<style scoped>
.shader-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.shader-error {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  max-width: min(92vw, 560px);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.68);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.5);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
}
</style>