import * as THREE from "three";

// Full-screen CRT pass: barrel lens, rounded tube mask, RGB split, scanlines,
// vignette and grain. `transition` drives the channel-switch collapse between scenes.
export function createCrtMaterial(source: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: source },
      resolution: { value: new THREE.Vector2(1, 1) },
      pixelRatio: { value: 1 },
      time: { value: 0 },
      transition: { value: 0 },
      frame: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float pixelRatio;
      uniform float time;
      uniform float transition;
      uniform float frame;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      vec2 barrel(vec2 uv, float k) {
        vec2 c = uv * 2.0 - 1.0;
        c *= 1.0 + k * dot(c, c);
        return c * 0.5 + 0.5;
      }

      // Signed distance to a rounded rectangle, in pixels.
      float tubeDistance(vec2 uv, vec2 size, float radius) {
        vec2 p = (uv - 0.5) * size;
        vec2 q = abs(p) - (size * 0.5 - radius);
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
      }

      void main() {
        float k = mix(0.008, 0.06, frame) + transition * 0.5;
        // The framed tube sits slightly inside the viewport, like a bezel.
        vec2 uv = barrel(vUv, k);
        uv = (uv - 0.5) * mix(0.985, 1.035, frame) + 0.5;
        // Collapse vertically toward a bright line when switching channels.
        uv.y = (uv.y - 0.5) / max(1.0 - transition * 0.97, 0.03) + 0.5;

        float split = (0.0012 + transition * 0.012) * (0.6 + length(vUv - 0.5));
        vec3 col;
        col.r = texture2D(tDiffuse, uv + vec2(split, 0.0)).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - vec2(split, 0.0)).b;

        float scan = 0.5 + 0.5 * sin(gl_FragCoord.y / pixelRatio * 3.14159);
        col *= mix(1.0, 0.86 + 0.14 * scan, 0.55);

        vec2 v = vUv - 0.5;
        col *= 1.0 - dot(v, v) * mix(0.6, 1.1, frame);
        col += (hash(gl_FragCoord.xy + fract(time) * 100.0) - 0.5) * 0.045;

        // Glow toward phosphor white at the peak of a transition.
        col = mix(col, vec3(1.0, 0.98, 0.9) * (0.4 + dot(col, vec3(0.33))), smoothstep(0.55, 1.0, transition));

        float d = tubeDistance(uv, resolution, 30.0 * pixelRatio);
        float tube = 1.0 - smoothstep(-1.5 * pixelRatio, 1.5 * pixelRatio, d);
        float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
        col *= mix(inside, tube, frame);

        gl_FragColor = vec4(max(col, 0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
}
