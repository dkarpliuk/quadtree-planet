#include <common>
#include <logdepthbuf_pars_fragment>

uniform vec3 center;
uniform float planetRadius;
uniform float shellRadius;
uniform float scaleHeight;
uniform vec3 sunDirection;
uniform vec3 scattering;

varying vec3 vWorld;

//in reality light rescatters multiple times
const float RESCATTERING = 2.5;

//how softly green is held back, as a share of brightness
const float GREEN_EASE = 0.2;

//how much longer the sky keeps its light after sunset than the shadow alone would allow
const float TWILIGHT_TAIL = 6.0;

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

//max and min with the corner rounded off, so a limit never leaves a crease in the sky
float smoothMax(float a, float b, float k) { return 0.5 * (a + b + sqrt((a - b) * (a - b) + k * k)); }
float smoothMin(float a, float b, float k) { return 0.5 * (a + b - sqrt((a - b) * (a - b) + k * k)); }

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
  float toBottom = -dot(origin, ray);
  float lowestRadius = length(origin + ray * clamp(toBottom, near, far));

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

  //clamping this point would crease the sky, so round the limits off over the distance the sun
  //angle needs to change, but never past half the ray
  float rounding = min(sqrt(2.0 * scaleHeight * planetRadius), 0.5 * (far - near));
  vec3 sunPoint = origin + ray * smoothMin(smoothMax(toBottom, near, rounding), far, rounding);
  float sunRadius = length(sunPoint);
  float cosSun = dot(sunPoint / sunRadius, sunDirection);

  //the sun still reaches the gas this far past the terminator, in cosines
  float twilight = sqrt(2.0 * scaleHeight / planetRadius);

  //hold full light until the sun touches the horizon, then let it go out slowly
  float lit = smoothstep(-twilight * TWILIGHT_TAIL, 0.0, cosSun);

  //each channel of scattering is how much gas a straight up column holds, so scale the path to them
  vec3 depth = RESCATTERING * scattering * gas / scaleHeight;

  //sunlight crosses the gas before it scatters, and loses the channels that scatter most
  vec3 sunlight = exp(-scattering * columnUp(sunRadius, max(cosSun, 0.0)) / scaleHeight);

  //gas scatters best towards the sun and straight back from it, and worst across
  //https://en.wikipedia.org/wiki/Rayleigh_scattering
  float mu = dot(ray, sunDirection);
  float phase = 0.75 * (1.0 + mu * mu);

  vec3 sky = sunlight * (1.0 - exp(-depth)) * lit * phase;

  //a real sky never has green ahead of both its neighbours, so hold it back to their midpoint
  float middle = (sky.r + sky.b) * 0.5;
  sky.g = smoothMin(sky.g, middle, middle * GREEN_EASE);

  gl_FragColor = vec4(sky, 1.0);
}
