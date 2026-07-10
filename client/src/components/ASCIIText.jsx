// ASCII Text — Three.js based, system fonts for reliability
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uEnableWaves;
void main() {
    vUv = uv;
    float time = uTime * 5.;
    vec3 transformed = position;
    transformed.x += sin(time + position.y) * 0.3 * uEnableWaves;
    transformed.y += cos(time + position.z) * 0.1 * uEnableWaves;
    transformed.z += sin(time + position.x) * 0.6 * uEnableWaves;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
void main() {
    vec2 pos = vUv;
    float r = texture2D(uTexture, pos + cos(uTime * 2. + pos.x) * .008).r;
    float g = texture2D(uTexture, pos + tan(uTime * .5 + pos.x) * .008).g;
    float b = texture2D(uTexture, pos - cos(uTime * 2. + pos.y) * .008).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

const CHARS = ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

class ASCIIRenderer {
  constructor(container, { text, fontSize, textColor, enableWaves }) {
    this.container = container;
    this.text = text;
    this.charSize = fontSize;
    this.textColor = textColor;
    this.enableWaves = enableWaves;
    this.running = false;

    this.mouse = { x: 0, y: 0 };
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  async init() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    if (this.width === 0 || this.height === 0) return;

    // Canvas for text rendering
    this.txtCanvas = document.createElement('canvas');
    this.txtCtx = this.txtCanvas.getContext('2d');
    this.txtFont = `bold ${Math.round(this.width * 0.12)}px Arial, Helvetica, sans-serif`;
    this.txtCtx.font = this.txtFont;
    const m = this.txtCtx.measureText(this.text);
    this.txtCanvas.width = Math.ceil(m.width) + 20;
    this.txtCanvas.height = Math.round(this.width * 0.14) + 20;

    // Three.js
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.width, this.height);

    // Texture from text canvas
    this.texture = new THREE.CanvasTexture(this.txtCanvas);
    this.texture.minFilter = THREE.NearestFilter;

    const aspect = this.txtCanvas.width / this.txtCanvas.height;
    const h = 8;
    this.geometry = new THREE.PlaneGeometry(h * aspect, h, 32, 32);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // Output pre
    this.pre = document.createElement('pre');
    Object.assign(this.pre.style, {
      margin: '0', padding: '0', lineHeight: '1em',
      position: 'absolute', left: '0', top: '0', zIndex: '9',
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: `${this.charSize}px`,
      userSelect: 'none',
      backgroundImage: 'radial-gradient(circle, #00ff41 0%, #00cc33 50%, #009922 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    });

    // Offscreen canvas for pixel sampling
    this.sampleCanvas = document.createElement('canvas');
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

    this.container.appendChild(this.pre);
    this.container.appendChild(this.renderer.domElement);
    Object.assign(this.renderer.domElement.style, {
      position: 'absolute', left: '0', top: '0',
      width: '100%', height: '100%', pointerEvents: 'none', opacity: '0',
    });

    this.recalcGrid();
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('touchmove', this.onMouseMove);
  }

  recalcGrid() {
    this.sampleCtx.font = `${this.charSize}px Courier New`;
    const cw = this.sampleCtx.measureText('A').width;
    this.cols = Math.floor(this.width / cw);
    this.rows = Math.floor(this.height / this.charSize);
    this.sampleCanvas.width = this.cols;
    this.sampleCanvas.height = this.rows;
  }

  onMouseMove(e) {
    const t = e.touches ? e.touches[0] : e;
    const r = this.container.getBoundingClientRect();
    this.mouse.x = t.clientX - r.left;
    this.mouse.y = t.clientY - r.top;
  }

  start() {
    this.running = true;
    this.loop();
  }

  loop() {
    if (!this.running) return;
    this.frameId = requestAnimationFrame(() => this.loop());

    const t = performance.now() * 0.001;
    this.texture.needsUpdate = true;
    this.txtCtx.clearRect(0, 0, this.txtCanvas.width, this.txtCanvas.height);
    this.txtCtx.font = this.txtFont;
    this.txtCtx.fillStyle = this.textColor;
    const yOff = 10 + this.txtCtx.measureText(this.text).actualBoundingBoxAscent;
    this.txtCtx.fillText(this.text, 10, yOff);
    this.texture.needsUpdate = true;

    this.mesh.material.uniforms.uTime.value = Math.sin(t);

    // Subtle mouse rotation
    const rx = ((this.mouse.y / this.height) - 0.5) * -0.3;
    const ry = ((this.mouse.x / this.width) - 0.5) * 0.3;
    this.mesh.rotation.x += (rx - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (ry - this.mesh.rotation.y) * 0.05;

    // Render 3D → sample → ASCII
    this.renderer.render(this.scene, this.camera);
    this.sampleCtx.clearRect(0, 0, this.cols, this.rows);
    this.sampleCtx.drawImage(this.renderer.domElement, 0, 0, this.cols, this.rows);

    const img = this.sampleCtx.getImageData(0, 0, this.cols, this.rows).data;
    let str = '';
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const i = (x + y * this.cols) * 4;
        const gray = (0.3 * img[i] + 0.6 * img[i + 1] + 0.1 * img[i + 2]) / 255;
        const idx = Math.floor(gray * (CHARS.length - 1));
        str += CHARS[idx];
      }
      str += '\n';
    }
    this.pre.textContent = str;
  }

  dispose() {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    if (this.pre.parentNode) this.container.removeChild(this.pre);
    if (this.renderer.domElement.parentNode) this.container.removeChild(this.renderer.domElement);
    this.geometry?.dispose();
    this.material?.dispose();
    this.texture?.dispose();
    this.renderer?.dispose();
  }
}

export default function ASCIIText({
  text = 'Hey!',
  asciiFontSize = 10,
  enableWaves = false,
  textColor = '#22c55e',
}) {
  const ref = useRef(null);
  const instRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    const boot = async () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const inst = new ASCIIRenderer(el, {
        text,
        fontSize: asciiFontSize,
        textColor,
        enableWaves,
      });
      if (cancelled) return;
      await inst.init();
      if (cancelled) { inst.dispose(); return; }
      instRef.current = inst;
      inst.start();
    };

    boot();

    return () => {
      cancelled = true;
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, [text, asciiFontSize, textColor, enableWaves]);

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}
