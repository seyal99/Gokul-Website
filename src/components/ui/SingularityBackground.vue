<script setup>
import ShaderToy from "./ShaderToy.vue";

const props = defineProps({
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
    default: 0.92
  },
  noise: {
    type: Object,
    default: () => ({
      opacity: 0.03,
      scale: 2.5
    })
  }
});

const shader = `
// ShaderToy URL: https://www.shadertoy.com/view/3csSWB

/*
    "Singularity" by @XorDev

    A whirling blackhole.
    Feel free to code golf!

    FabriceNeyret2: -19
    dean_the_coder: -12
    iq: -4
*/
void mainImage(out vec4 O, vec2 F)
{
  //Iterator and attenuation (distance-squared)
  float i = .2, a;
  //Resolution for scaling and centering
  vec2 r = iResolution.xy,
    //Centered ratio-corrected coordinates
    p = (F + F - r) / r.y / .86,
    //Diagonal vector for skewing
    d = vec2(-1, 1),
    //Blackhole center
    b = p - i * d,
    //Rotate and apply perspective
    c = p * mat2(
      1.0,
      1.0,
      d.x / (.1 + i / dot(b, b)),
      d.y / (.1 + i / dot(b, b))
    ),
    //Rotate into spiraling coordinates
    v = c * mat2(
      cos(.5 * log(a = dot(c, c)) + iTime * i + 0.0),
      cos(.5 * log(a = dot(c, c)) + iTime * i + 33.0),
      cos(.5 * log(a = dot(c, c)) + iTime * i + 11.0),
      cos(.5 * log(a = dot(c, c)) + iTime * i + 0.0)
    ) / i,
    //Waves cumulative total for coloring
    w = vec2(0.0);

  //Loop through waves (WebGL-safe loop form)
  for (int n = 0; n < 9; n++) {
    i += 1.0;
    w += 1. + sin(v);
    //Distort coordinates
    v += .7 * sin(v.yx * i + iTime) / i + .5;
  }
  //Acretion disk radius
  i = length(sin(v / .3) * .4 + c * (3. + d));
  //Red/blue gradient
  O = 1. - exp(-exp(c.x * vec4(.6, -.4, -1, 0))
    //Wave coloring
    / w.xyyx
    //Acretion disk brightness
    / (2. + i * i / 4. - i)
    //Center darkness
    / (.5 + 1. / a)
    //Rim highlight
    / (.03 + abs(length(p) - .7))
  );
}
`;
</script>

<template>
  <div class="singularity-wrap" :class="[props.class]">
    <ShaderToy :shader-code="shader" v-bind="props" />
  </div>
</template>

<style scoped>
.singularity-wrap {
  position: absolute;
  inset: 0;
}
</style>
