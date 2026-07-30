#include <logdepthbuf_pars_fragment>

uniform vec3 center;
uniform float planetRadius;
uniform float shellRadius;

varying vec3 vWorld;

//where the ray enters and leaves the sphere, swapped around when it misses
vec2 hitSphere(vec3 origin, vec3 ray, float radius) {
  float b = dot(origin, ray);
  float d = b * b - dot(origin, origin) + radius * radius;
  if (d < 0.0) return vec2(1.0, -1.0);

  float root = sqrt(d);
  return vec2(-b - root, -b + root);
}

void main() {
  #include <logdepthbuf_fragment>

  vec3 origin = cameraPosition - center;
  vec3 ray = normalize(vWorld - cameraPosition);

  vec2 shell = hitSphere(origin, ray, shellRadius);
  vec2 ground = hitSphere(origin, ray, planetRadius);

  //the ground stops the ray only when it is really hit, and in front of the camera
  float blocked = (ground.x < ground.y && ground.x > 0.0) ? ground.x : shell.y;

  float near = max(shell.x, 0.0);
  float far = max(min(shell.y, blocked), near);

  //the longest path there is, grazing the planet from one edge of the shell to the other
  float longest = 2.0 * sqrt(shellRadius * shellRadius - planetRadius * planetRadius);

  gl_FragColor = vec4(vec3((far - near) / longest), 1.0);
}
