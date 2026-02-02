precision highp float;

varying float vDistort;

uniform float uIntensityA, uIntensityB;
uniform float uMix;
uniform vec3 uBrightnessA, uBrightnessB;
uniform vec3 uContrastA,   uContrastB;
uniform vec3 uPhaseA,      uPhaseB;
uniform vec3 uOscillationA,uOscillationB;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

// void main() {
//   float d = vDistort * uIntensity;
// // vec3 color = cosPalette(d, vec3(0.8, 0.5, 0.4), vec3(0.2, 0.4, 0.2), vec3(2.0, 1.0, 1.0), vec3(0.00, 0.25, 0.25));
// // failed

// //   vec3 color = cosPalette(d, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.30, 0.20, 0.20));

//   vec3 color = cosPalette(d, uBrightnessA, uContrastA, uOscillationA, uPhaseA);

//   gl_FragColor = vec4(color, 1.0);
// }

void main() {
    float intensity = mix(uIntensityA, uIntensityB, uMix);
    vec3 brightness = mix(uBrightnessA, uBrightnessB, uMix);
    vec3 contrast   = mix(uContrastA,   uContrastB,   uMix);
    vec3 phase      = mix(uPhaseA,      uPhaseB,      uMix);
    vec3 oscill     = mix(uOscillationA,uOscillationB,uMix);

    // Example shading using vField + palette params (replace with your logic)

    float d = vDistort * intensity;
    vec3 color = cosPalette(d, brightness, contrast, oscill, phase);


    gl_FragColor = vec4(color, 1.0);
}