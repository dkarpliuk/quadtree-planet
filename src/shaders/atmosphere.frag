#include <common>
#include <logdepthbuf_pars_fragment>

uniform vec3 color;
uniform float twilight;
uniform vec3 center;
uniform vec3 sunDirection;
uniform float planetRadius;
uniform float shellRadius;
uniform float density;

varying vec3 vWorld;

const int STEPS = 3;

const float FADE_POWER = 2.0;

//distances along the ray where it enters and leaves the sphere, both huge when it misses
vec2 hitSphere(vec3 origin, vec3 ray, float radius) {
  float b = dot(origin, ray);
  float d = b * b - dot(origin, origin) + radius * radius;
  if (d < 0.0) return vec2(1e20, -1e20);

  float root = sqrt(d);
  return vec2(-b - root, -b + root);
}

void main() {
  #include <logdepthbuf_fragment>

  vec3 origin = cameraPosition - center;
  vec3 ray = normalize(vWorld - cameraPosition);

  vec2 shell = hitSphere(origin, ray, shellRadius);
  vec2 ground = hitSphere(origin, ray, planetRadius);

  //looking up still hits the planet, only behind us, so a hit counts only when it is ahead
  float blocked = ground.x > 0.0 ? ground.x : 1e20;

  //start at the camera when it is already inside the shell
  float near = max(shell.x, 0.0);
  float far = max(min(shell.y, blocked), near);

  float thickness = shellRadius - planetRadius;
  float stride = (far - near) / float(STEPS);

  float total = 0.0;

  for (int i = 0; i < STEPS; i++) {
    vec3 point = origin + ray * (near + (float(i) + 0.5) * stride);
    float altitude = length(point) - planetRadius;

    //thick at the ground, gone at the top of the shell
    float air = pow(max(0.0, 1.0 - altitude / thickness), FADE_POWER);
    float lit = smoothstep(-twilight, twilight, dot(normalize(point), sunDirection));

    total += air * lit;
  }

  //air also swallows what it scatters, so thick paths level off instead of growing forever
  float depth = total * stride / thickness * density;

  gl_FragColor = vec4(color * (1.0 - exp(-depth)), 1.0);
}
