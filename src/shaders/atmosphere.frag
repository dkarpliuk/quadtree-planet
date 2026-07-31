#include <common>
#include <logdepthbuf_pars_fragment>

uniform vec3 center;
uniform float planetRadius;
uniform float shellRadius;
uniform float scaleHeight;
uniform vec3 sunDirection;
uniform vec3 scattering;

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

  //the deepest the ray ever gets, where nearly all of its gas sits
  vec3 lowest = origin + ray * clamp(-dot(origin, ray), near, far);
  float lowestRadius = length(lowest);

  float gas;

  if (cosIn >= 0.0) {
    gas = columnUp(radiusIn, cosIn) - columnUp(radiusOut, cosOut);
  } else if (cosOut < 0.0) {
    //still falling at the end, so mirror the piece onto the rising half of the ray
    gas = columnUp(radiusOut, -cosOut) - columnUp(radiusIn, -cosIn);
  } else {
    //the ray falls, bottoms out, then rises, so add up the two halves
    gas = 2.0 * columnUp(lowestRadius, 0.0) - columnUp(radiusIn, -cosIn) - columnUp(radiusOut, cosOut);
  }

  float cosSun = dot(lowest / lowestRadius, sunDirection);

  //the sun still reaches the gas this far past the terminator, in cosines
  float twilight = sqrt(2.0 * scaleHeight / planetRadius);
  float lit = smoothstep(-twilight, twilight, cosSun);

  //each channel of scattering is how much gas a straight up column holds, so scale the path to them
  vec3 depth = scattering * gas / scaleHeight;

  //sunlight crosses the gas before it scatters, and loses the channels that scatter most
  vec3 sunlight = exp(-scattering * columnUp(lowestRadius, max(cosSun, 0.0)) / scaleHeight);

  gl_FragColor = vec4(sunlight * (1.0 - exp(-depth)) * lit, 1.0);
}
