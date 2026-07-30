#include <logdepthbuf_pars_fragment>

varying vec3 vWorld;

void main() {
  #include <logdepthbuf_fragment>

  gl_FragColor = vec4(0.0);
}
