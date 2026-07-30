uniform float reach;

varying vec2 vUv;

const vec3 WHITE  = vec3(1.0, 1.0, 1.0);
const vec3 YELLOW = vec3(1.0, 1.0, 0.2);
const vec3 ORANGE = vec3(1.0, 0.6, 0.1);
const vec3 RED    = vec3(0.8, 0.2, 0.1);

//how fast the glow dies away: higher is a tighter halo
const float FADE = 4.0;

const float BRIGHTNESS = 2.0;

void main() {
  //0 in the middle, 1 at the border of the quad
  float d = length(vUv * 2.0 - 1.0);

  //distance from the middle of the sun, in sun radii
  float radii = d * reach;

  //one pixel wide whatever the distance, otherwise the disc edge is a staircase
  float aa = fwidth(radii);

  vec3 col = mix(WHITE, YELLOW, smoothstep(1.0 - aa, 1.0 + aa, radii));
  col = mix(col, ORANGE, smoothstep(0.5, 1.2, radii));
  col = mix(col, RED, smoothstep(1.2, 2.4, radii));

  float intensity = pow(max(0.0, 1.0 - d * d), FADE);

  gl_FragColor = vec4(col * intensity * BRIGHTNESS, 1.0);
}
