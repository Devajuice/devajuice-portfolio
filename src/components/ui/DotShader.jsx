import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const VERTEX_SHADER_SRC = `
precision highp float;

attribute vec2 a_position;
attribute vec2 a_grid_pos;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_cursor_radius;
uniform float u_distortion;
uniform float u_max_scale;
uniform float u_wave_intensity;
uniform float u_base_dot_size;
uniform float u_interactive;
uniform float u_dpr;

varying float v_proximity;

void main() {
    vec2 pos = a_position;

    float wave = sin(a_grid_pos.x * 0.15 + a_grid_pos.y * 0.15 + u_time * 1.5) * 4.0 * u_wave_intensity;
    pos.y += wave;

    float dist = distance(pos, u_mouse);
    float normDist = clamp(dist / max(u_cursor_radius, 1.0), 0.0, 1.0);
    float prox = (1.0 - smoothstep(0.0, 1.0, normDist)) * u_interactive;

    vec2 dir = pos - u_mouse;
    float dirLen = length(dir);
    if (dirLen > 0.001) {
        dir = dir / dirLen;
    } else {
        dir = vec2(0.0, 0.0);
    }
    pos += dir * (prox * 24.0 * u_distortion);

    v_proximity = prox;

    float scale = 1.0 + prox * (u_max_scale - 1.0);
    gl_PointSize = u_base_dot_size * 2.0 * scale * u_dpr;

    vec2 zeroToOne = pos / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform vec4 u_dot_color;
uniform vec4 u_accent_color;

varying float v_proximity;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
        discard;
    }

    float alpha = smoothstep(0.5, 0.38, dist);

    vec4 finalColor = mix(u_dot_color, u_accent_color, v_proximity);
    gl_FragColor = vec4(finalColor.rgb, finalColor.a * alpha);
}
`;

function parseColorToRgba(colorStr) {
  if (typeof document === 'undefined') {
    return { r: 255, g: 255, b: 255, a: 0.2 };
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { r: 255, g: 255, b: 255, a: 0.2 };

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);

  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return { r: r / 255, g: g / 255, b: b / 255, a: a / 255 };
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function DotShader({
  children,
  className,
  dotColor = 'rgba(255, 255, 255, 0.15)',
  accentColor = '#00F0FF',
  dotSize = 1.5,
  spacing = 22,
  cursorRadius = 180,
  distortionStrength = 0.35,
  maxScale = 2.2,
  waveIntensity = 0.25,
  speed = 1,
  interactive = true,
  overlay = true,
  style,
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const mouseTargetRef = useRef({ x: -9999, y: -9999 });
  const mouseCurrentRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const handlePointerMove = (e) => {
    if (!interactive || reducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerLeave = () => {
    if (!interactive) return;
    mouseTargetRef.current = { x: -9999, y: -9999 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animFrameId;
    let gl = null;

    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      gl = null;
    }

    const safeSpacing = Math.max(10, spacing);
    const safeDotSize = Math.max(0.5, dotSize);
    const safeCursorRadius = Math.max(40, cursorRadius);

    const baseColorParsed = parseColorToRgba(dotColor);
    const accentColorParsed = parseColorToRgba(accentColor);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let vertexCount = 0;
    let positionBuffer = null;
    let gridPosBuffer = null;
    let program = null;

    let uResolutionLoc = null;
    let uMouseLoc = null;
    let uTimeLoc = null;
    let uCursorRadiusLoc = null;
    let uDistortionLoc = null;
    let uMaxScaleLoc = null;
    let uWaveIntensityLoc = null;
    let uBaseDotSizeLoc = null;
    let uInteractiveLoc = null;
    let uDprLoc = null;
    let uDotColorLoc = null;
    let uAccentColorLoc = null;

    let aPositionLoc = -1;
    let aGridPosLoc = -1;

    if (gl) {
      const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
      const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

      if (vertShader && fragShader) {
        program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vertShader);
          gl.attachShader(program, fragShader);
          gl.linkProgram(program);

          if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);

            aPositionLoc = gl.getAttribLocation(program, 'a_position');
            aGridPosLoc = gl.getAttribLocation(program, 'a_grid_pos');

            uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
            uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
            uTimeLoc = gl.getUniformLocation(program, 'u_time');
            uCursorRadiusLoc = gl.getUniformLocation(program, 'u_cursor_radius');
            uDistortionLoc = gl.getUniformLocation(program, 'u_distortion');
            uMaxScaleLoc = gl.getUniformLocation(program, 'u_max_scale');
            uWaveIntensityLoc = gl.getUniformLocation(program, 'u_wave_intensity');
            uBaseDotSizeLoc = gl.getUniformLocation(program, 'u_base_dot_size');
            uInteractiveLoc = gl.getUniformLocation(program, 'u_interactive');
            uDprLoc = gl.getUniformLocation(program, 'u_dpr');
            uDotColorLoc = gl.getUniformLocation(program, 'u_dot_color');
            uAccentColorLoc = gl.getUniformLocation(program, 'u_accent_color');

            positionBuffer = gl.createBuffer();
            gridPosBuffer = gl.createBuffer();
          } else {
            gl = null;
          }
        }
      } else {
        gl = null;
      }
    }

    const setupGridBuffers = (w, h) => {
      width = w;
      height = h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const cols = Math.ceil(w / safeSpacing) + 2;
      const rows = Math.ceil(h / safeSpacing) + 2;
      vertexCount = cols * rows;

      const positions = new Float32Array(vertexCount * 2);
      const gridPositions = new Float32Array(vertexCount * 2);

      const offsetX = (w % safeSpacing) / 2 - safeSpacing / 2;
      const offsetY = (h % safeSpacing) / 2 - safeSpacing / 2;

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * safeSpacing;
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * safeSpacing;
          positions[idx * 2] = x;
          positions[idx * 2 + 1] = y;
          gridPositions[idx * 2] = c;
          gridPositions[idx * 2 + 1] = r;
          idx++;
        }
      }

      if (gl && positionBuffer && gridPosBuffer) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, gridPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gridPositions, gl.STATIC_DRAW);
      }
    };

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setupGridBuffers(rect.width, rect.height);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          setupGridBuffers(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    let startTime = performance.now();
    let lastTime = startTime;

    const render = (now) => {
      const dt = Math.min(0.064, (now - lastTime) / 1000);
      lastTime = now;
      const elapsed = ((now - startTime) * 0.001) / 1 * speed;

      const lerpFactor = 1 - Math.exp(-14 * dt);
      mouseCurrentRef.current.x +=
        (mouseTargetRef.current.x - mouseCurrentRef.current.x) * lerpFactor;
      mouseCurrentRef.current.y +=
        (mouseTargetRef.current.y - mouseCurrentRef.current.y) * lerpFactor;

      if (gl && program && positionBuffer && gridPosBuffer) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(program);

        gl.uniform2f(uResolutionLoc, width, height);
        gl.uniform2f(uMouseLoc, mouseCurrentRef.current.x, mouseCurrentRef.current.y);
        gl.uniform1f(uTimeLoc, reducedMotion ? 0 : elapsed);
        gl.uniform1f(uCursorRadiusLoc, safeCursorRadius);
        gl.uniform1f(uDistortionLoc, distortionStrength);
        gl.uniform1f(uMaxScaleLoc, maxScale);
        gl.uniform1f(uWaveIntensityLoc, reducedMotion ? 0 : waveIntensity);
        gl.uniform1f(uBaseDotSizeLoc, safeDotSize);
        gl.uniform1f(uInteractiveLoc, interactive && !reducedMotion ? 1 : 0);
        gl.uniform1f(uDprLoc, dpr);

        gl.uniform4f(
          uDotColorLoc,
          baseColorParsed.r,
          baseColorParsed.g,
          baseColorParsed.b,
          baseColorParsed.a
        );
        gl.uniform4f(
          uAccentColorLoc,
          accentColorParsed.r,
          accentColorParsed.g,
          accentColorParsed.b,
          accentColorParsed.a
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gridPosBuffer);
        gl.enableVertexAttribArray(aGridPosLoc);
        gl.vertexAttribPointer(aGridPosLoc, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, vertexCount);
      } else {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);

          const cols = Math.ceil(width / safeSpacing) + 2;
          const rows = Math.ceil(height / safeSpacing) + 2;
          const offsetX = (width % safeSpacing) / 2 - safeSpacing / 2;
          const offsetY = (height % safeSpacing) / 2 - safeSpacing / 2;

          const mx = mouseCurrentRef.current.x;
          const my = mouseCurrentRef.current.y;

          for (let r = 0; r < rows; r++) {
            const baseY = offsetY + r * safeSpacing;
            for (let c = 0; c < cols; c++) {
              const baseX = offsetX + c * safeSpacing;

              let x = baseX;
              let y = baseY;

              if (!reducedMotion) {
                const wave =
                  Math.sin(c * 0.15 + r * 0.15 + elapsed * 1.5) * 4.0 * waveIntensity;
                y += wave;
              }

              const dist = Math.hypot(x - mx, y - my);
              let prox = 0;
              if (interactive && !reducedMotion && dist < safeCursorRadius) {
                prox = 1 - dist / safeCursorRadius;
                const angle = Math.atan2(y - my, x - mx);
                x += Math.cos(angle) * (prox * 24.0 * distortionStrength);
                y += Math.sin(angle) * (prox * 24.0 * distortionStrength);
              }

              const scale = 1.0 + prox * (maxScale - 1.0);
              const radius = safeDotSize * scale;

              ctx.beginPath();
              ctx.arc(x, y, radius, 0, Math.PI * 2);

              if (prox > 0.01) {
                ctx.fillStyle = accentColor;
                ctx.globalAlpha = baseColorParsed.a + prox * (accentColorParsed.a - baseColorParsed.a);
              } else {
                ctx.fillStyle = dotColor;
                ctx.globalAlpha = baseColorParsed.a;
              }
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animFrameId);
      if (gl) {
        if (positionBuffer) gl.deleteBuffer(positionBuffer);
        if (gridPosBuffer) gl.deleteBuffer(gridPosBuffer);
        if (program) gl.deleteProgram(program);
      }
    };
  }, [
    dotColor,
    accentColor,
    dotSize,
    spacing,
    cursorRadius,
    distortionStrength,
    maxScale,
    waveIntensity,
    speed,
    interactive,
    reducedMotion,
  ]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn('relative isolate w-full overflow-hidden select-none', className)}
      style={style}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 block h-full w-full"
      />

      {overlay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--color-bg)_100%)]"
        />
      )}

      {children && (
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default DotShader;