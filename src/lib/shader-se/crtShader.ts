import * as THREE from "three";

export const CRTShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tBoot: { value: null as THREE.Texture | null },
    uDimensions: { value: new THREE.Vector2(1440, 900) },
    uDistortion: { value: 0.22 },
    uDistortionBorders: { value: 0.0 },
    uProgress: { value: 100.0 },
    uTime: { value: 0.0 },
    uChromaStrength: { value: 0.8 },
    uSepia: { value: 0.25 },
    uBrightness: { value: 1.0 },
    uContrast: { value: 1.0 },
    uIsBoot: { value: 0.0 },
    uScanlines: { value: 0.15 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tBoot;
    uniform vec2 uDimensions;
    uniform float uDistortion;
    uniform float uDistortionBorders;
    uniform float uProgress;
    uniform float uTime;
    uniform float uChromaStrength;
    uniform float uSepia;
    uniform float uBrightness;
    uniform float uContrast;
    uniform float uIsBoot;
    uniform float uScanlines;

    varying vec2 vUv;

    // Barrel distortion formula AH
    vec2 distort(vec2 uv, float t, vec2 r) {
      vec2 d = uv - 0.5;
      float r2 = dot(d, d);
      float ax = 1.0 + r2 * (t + r.x * sqrt(r2));
      float ay = 1.0 + r2 * (t + r.y * sqrt(r2));
      return vec2(d.x * ax, d.y * ay) + 0.5;
    }

    // Scaled distortion Aj
    vec2 getDistortedUV(vec2 uv, float distortion, float borders) {
      float n = mix(0.3655, 0.0, borders);
      float scale = 1.0 - distortion * n;
      float offset = distortion * n * 0.5;
      return scale * distort(uv, 0.0, vec2(distortion)) + offset;
    }

    // Rounded rectangle SDF Az
    float roundedBoxSDF(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    // Chromatic aberration px
    vec4 sampleWithChroma(sampler2D tex, vec2 uv, float strength) {
      vec2 d = abs(uv - 0.5);
      vec2 offset = pow(d, vec2(3.0)) * 0.01 * strength + 0.001 * strength;
      float r = texture2D(tex, uv + vec2(0.0, offset.y)).r;
      float g = texture2D(tex, uv).g;
      float b = texture2D(tex, uv - vec2(0.0, offset.y)).b;
      float a = texture2D(tex, uv).a;
      return vec4(r, g, b, a);
    }

    void main() {
      // Apply barrel distortion
      vec2 uv = getDistortedUV(vUv, uDistortion, uDistortionBorders);

      // Check bounds
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Vignette / Rounded corner mask
      float cornerRadius = 0.07;
      float feather = 0.003;
      vec2 aspect = vec2(uDimensions.x / uDimensions.y, 1.0);
      float sdf = roundedBoxSDF((uv - 0.5) * aspect, aspect * 0.5, cornerRadius);
      float mask = 1.0 - smoothstep(-feather, feather, sdf);

      // Subtle edge vignette
      float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
      float edgeVignette = smoothstep(0.0, 0.035, edgeDist);
      mask *= edgeVignette;

      vec4 color;

      if (uIsBoot > 0.5) {
        // Render CRT boot screen
        vec3 blue1 = vec3(0.0, 2.0 / 255.0, 0.72);
        vec3 blue2 = vec3(0.0, 0.0, 0.52);
        vec3 bg = mix(blue2, blue1, uv.y);

        vec4 textTex = texture2D(tBoot, uv);
        vec3 bootCol = mix(bg, vec3(0.96, 0.94, 0.88), textTex.r);

        // Progress bar container
        vec2 barCenter = vec2(0.5, 0.67);
        vec2 barSize = vec2(0.38, 0.034);
        vec2 p = uv - barCenter;
        if (abs(p.x) < barSize.x * 0.5 && abs(p.y) < barSize.y * 0.5) {
          if (abs(p.x) > barSize.x * 0.5 - 0.002 || abs(p.y) > barSize.y * 0.5 - 0.002) {
            bootCol = vec3(0.96, 0.94, 0.88);
          } else {
            float innerX = (p.x + barSize.x * 0.5) / barSize.x;
            float fillRatio = clamp(uProgress / 100.0, 0.0, 1.0);
            if (innerX < fillRatio) {
              float seg = fract(innerX * 22.0);
              if (seg > 0.18) {
                bootCol = vec3(0.96, 0.94, 0.88);
              }
            }
          }
        }
        color = vec4(bootCol, 1.0);
      } else {
        // Sample main scene with chromatic aberration
        color = sampleWithChroma(tDiffuse, uv, uChromaStrength);

        // Sepia tint
        vec3 sepiaColor = vec3(
          dot(color.rgb, vec3(0.393, 0.769, 0.189)),
          dot(color.rgb, vec3(0.349, 0.686, 0.168)),
          dot(color.rgb, vec3(0.272, 0.534, 0.131))
        );
        color.rgb = mix(color.rgb, sepiaColor, uSepia);

        // Brightness and contrast
        color.rgb = clamp(color.rgb * uBrightness, 0.0, 1.0);
        color.rgb = clamp((color.rgb - 0.5) * uContrast + 0.5, 0.0, 1.0);
      }

      // Subtle scanline overlay
      float scanline = sin(uv.y * uDimensions.y * 1.5) * 0.5 + 0.5;
      color.rgb *= (1.0 - uScanlines * 0.08 * (1.0 - scanline));

      gl_FragColor = vec4(color.rgb * mask, 1.0);
    }
  `,
};
