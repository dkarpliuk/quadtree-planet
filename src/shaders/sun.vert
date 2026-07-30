varying vec2 vUv;

//keeps the quad facing the camera without touching its rotation
void main() {
  vUv = uv;

  vec4 center = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  gl_Position = projectionMatrix * (center + vec4(position.xy, 0.0, 0.0));
}
