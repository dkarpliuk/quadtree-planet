#include <common>
#include <logdepthbuf_pars_vertex>

varying vec3 vWorld;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorld = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  #include <logdepthbuf_vertex>
}
