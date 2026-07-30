#include <common>
#include <logdepthbuf_pars_fragment>

uniform vec3 center;
uniform float planetRadius;
uniform float shellRadius;
uniform float scaleHeight;

varying vec3 vWorld;

//where the ray enters and leaves the sphere, swapped around when it misses
vec2 hitSphere(vec3 origin, vec3 ray, float radius) {
  float b = dot(origin, ray);
  float d = b * b - dot(origin, origin) + radius * radius;
  if (d < 0.0) return vec2(1.0, -1.0);

  float root = sqrt(d);
  return vec2(-b - root, -b + root);
}

//how much more gas a slanted ray meets than one going straight up
//https://en.wikipedia.org/wiki/Chapman_function
float chapman(float x, float cosAngle) {
  float z = cosAngle * sqrt(x * 0.5);
  //exp(z * z) * erfc(z) as one piece, either half alone runs out of float range here
  float scaled = 2.0 / (z * sqrt(PI) + sqrt(z * z * PI + 4.0));
  return sqrt(x * PI * 0.5) * scaled;
}

//gas between this point and space, as a thickness of ground level air, for a rising ray only
float columnUp(float radius, float cosAngle) {
  float height = radius - planetRadius;
  return scaleHeight * exp(-height / scaleHeight) * chapman(radius / scaleHeight, cosAngle);
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

  vec3 entry = origin + ray * near;
  vec3 exit = origin + ray * far;
  float radiusIn = length(entry);
  float radiusOut = length(exit);
  float cosIn = dot(entry / radiusIn, ray);
  float cosOut = dot(exit / radiusOut, ray);

  float gas;

  if (cosIn >= 0.0) {
    gas = columnUp(radiusIn, cosIn) - columnUp(radiusOut, cosOut);
  } else if (cosOut < 0.0) {
    //still falling at the end, so mirror the piece onto the rising half of the ray
    gas = columnUp(radiusOut, -cosOut) - columnUp(radiusIn, -cosIn);
  } else {
    //the ray falls, bottoms out, then rises, so add up the two halves
    float lowest = length(cross(origin, ray));
    gas = 2.0 * columnUp(lowest, 0.0) - columnUp(radiusIn, -cosIn) - columnUp(radiusOut, cosOut);
  }

  //the thickest path there is, grazing the surface and rising away to both sides
  float thickest = 2.0 * columnUp(planetRadius, 0.0);

  gl_FragColor = vec4(vec3(gas / thickest), 1.0);
}
