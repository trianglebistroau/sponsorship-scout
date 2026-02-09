// src/components/Blob.jsx


import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import frag from "../shaders/blob.frag.glsl";
import vert from "../shaders/blob.vert.glsl";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2);
const toV3 = (v, fallback) => {
  if (v instanceof THREE.Vector3) return v.clone();
  if (Array.isArray(v)) return new THREE.Vector3(v[0], v[1], v[2]);
  if (typeof v === "number") return new THREE.Vector3(v, v, v);
  return (fallback ?? new THREE.Vector3()).clone();
};

const DEFAULT_STATES = {
    idle: { speed:0.9,
            noiseDensity:3.0,
            noiseStrength:0.45,
            frequency:3.2, 
            amplitude:3.0, 
            intensity:2.6, 
            repeat:[6, 6, 4096], 
            autoRotateSpeed:0.7, 
            brightness: [0.5,0.5,0.5], 
            contrast: [0.5,0.5,0.5], 
            oscillation: [1,1,1], 
            phase: [0.0,0.1,0.2] }, 
    thinking: { 
            speed: 1.3,
            noiseDensity: 4.5,
            noiseStrength: 0.8,
            frequency: 4.0,
            amplitude: 6.5,
            intensity: 2.8,
            repeat: [6, 6, 4096],
            autoRotateSpeed: 0.5,
            brightness: [0.5,0.5,0.5],
            contrast: [0.5,0.5,0.5],
            oscillation: [1,1,1],
            phase: [0.0,0.1,0.2] },
    success: { 
            speed: 0.7, 
            noiseDensity: 2.0, 
            noiseStrength: 0.3, 
            frequency: 2.0, 
            amplitude: 1.5, 
            intensity: 2.4, 
            repeat: [6, 6, 4096], 
            autoRotateSpeed: 0.9, 
            brightness: [0.2, 0.5, 0.2], // Change the brightness values to make it more green
            contrast: [0.2, 0.8, 0.2], // Change the contrast values to make it more green
            oscillation: [1.0, 1.0, 0.5],
            phase: [0.80, 0.90, 0.30]},
    fail: { 
            speed: 0.4, 
            noiseDensity:5.0, 
            noiseStrength:3., 
            frequency:1.2, 
            amplitude:7.0, 
            intensity:2.6, 
            repeat:[6, 6, 4096], 
            autoRotateSpeed:0.1, 
            brightness: [0.8, 0.5, 0.4], 
            contrast: [0.2, 0.4, 0.2], 
            oscillation: [2.0, 1.0, 1.0], 
            phase: [0.00, 0.25, 0.25] },
    };

const Blob = forwardRef(function Blob({
  height = 150,
  background = "#050610",
  initialState = "idle",
  states = DEFAULT_STATES,
  enableZoom = true,
  enablePan = false,
  enableDamping = true,
  dampingFactor = 0.07,
  autoRotate = true,
  autoRotateSpeed = 0.6,
  className,
  style,
}, ref) {
  const rootRef = useRef(null);
  const threeRef = useRef({});
  const presets = useMemo(() => ({ ...DEFAULT_STATES, ...states }), [states]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const W = Math.max(1, root.clientWidth || 640);
    const H = height;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.debug.checkShaderErrors = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(new THREE.Color(background));
    renderer.setClearAlpha(0);                     // alpha = 0
    renderer.domElement.style.background = "transparent";
    // also ensure scene has no background
    // (only needed if you were setting it elsewhere)
    // scene.background = null;
    // renderer.domElement.style.display = "block";
    // renderer.domElement.style.cursor = "grab";
    // const onDown = () => (renderer.domElement.style.cursor = "grabbing");
    // const onUp = () => (renderer.domElement.style.cursor = "grab");
    // renderer.domElement.addEventListener("mousedown", onDown);
    // window.addEventListener("mouseup", onUp);
    root.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    camera.position.set(0, -1.5, 14);

    const s0 = presets[initialState] || presets.idle;


    // const controls = null;
    // controls.enableZoom = enableZoom;
    // controls.enablePan = enablePan;
    // controls.enableDamping = enableDamping;
    // controls.dampingFactor = dampingFactor;
    // controls.autoRotate = autoRotate;
    // controls.autoRotateSpeed = autoRotateSpeed;
    // controls.target.set(0, 0, 0);
    // controls.update();

    // ★ use Vector3 for vec3 uniforms so we can clone/lerp
    const uniforms = {
        uTime: { value: 0.0 },
        uMix:  { value: 0.0 },

        // A set
        uSpeedA:         { value: s0.speed },
        uNoiseDensityA:  { value: s0.noiseDensity },
        uNoiseStrengthA: { value: s0.noiseStrength },
        uFrequencyA:     { value: s0.frequency },
        uAmplitudeA:     { value: s0.amplitude },
        uIntensityA:     { value: s0.intensity },
        uRepeatA:        { value: new THREE.Vector3(...s0.repeat) },
        uBrightnessA:    { value: toV3(s0.brightness,  new THREE.Vector3(0.5,0.5,0.5)) },
        uContrastA:      { value: toV3(s0.contrast,    new THREE.Vector3(0.5,0.5,0.5)) },
        uOscillationA:   { value: toV3(s0.oscillation, new THREE.Vector3(1,1,1)) },
        uPhaseA:         { value: toV3(s0.phase,       new THREE.Vector3(0,0.1,0.2)) },

        uSpeedB:         { value: s0.speed },
        uNoiseDensityB:  { value: s0.noiseDensity },
        uNoiseStrengthB: { value: s0.noiseStrength },
        uFrequencyB:     { value: s0.frequency },
        uAmplitudeB:     { value: s0.amplitude },
        uIntensityB:     { value: s0.intensity },
        uRepeatB:        { value: new THREE.Vector3(...s0.repeat) },
        uBrightnessB:    { value: toV3(s0.brightness,  new THREE.Vector3(0.5,0.5,0.5)) },
        uContrastB:      { value: toV3(s0.contrast,    new THREE.Vector3(0.5,0.5,0.5)) },
        uOscillationB:   { value: toV3(s0.oscillation, new THREE.Vector3(1,1,1)) },
        uPhaseB:         { value: toV3(s0.phase,       new THREE.Vector3(0,0.1,0.2)) },
    };

    const writeSet = (obj, which /* 'A' | 'B' */) => {
        uniforms[`uSpeed${which}`].value         = obj.speed;
        uniforms[`uNoiseDensity${which}`].value  = obj.noiseDensity;
        uniforms[`uNoiseStrength${which}`].value = obj.noiseStrength;
        uniforms[`uFrequency${which}`].value     = obj.frequency;
        uniforms[`uAmplitude${which}`].value     = obj.amplitude;
        uniforms[`uIntensity${which}`].value     = obj.intensity;
        uniforms[`uRepeat${which}`].value.copy(      obj.repeat );
        uniforms[`uBrightness${which}`].value.copy(  obj.brightness );
        uniforms[`uContrast${which}`].value.copy(    obj.contrast );
        uniforms[`uOscillation${which}`].value.copy( obj.oscillation );
        uniforms[`uPhase${which}`].value.copy(       obj.phase );
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.8, 160, 160), material);
    scene.add(mesh);

    let rotA = 0, rotB = 0;
    let autoA = 0, autoB = 0;

    // this is to help to convert to the next state of the blob
    const currentEffective = () => ({
        speed:         lerp(uniforms.uSpeedA.value,        uniforms.uSpeedB.value,        uniforms.uMix.value),
        noiseDensity:  lerp(uniforms.uNoiseDensityA.value, uniforms.uNoiseDensityB.value, uniforms.uMix.value),
        noiseStrength: lerp(uniforms.uNoiseStrengthA.value,uniforms.uNoiseStrengthB.value,uniforms.uMix.value),
        frequency:     lerp(uniforms.uFrequencyA.value,    uniforms.uFrequencyB.value,    uniforms.uMix.value),
        amplitude:     lerp(uniforms.uAmplitudeA.value,    uniforms.uAmplitudeB.value,    uniforms.uMix.value),
        intensity:     lerp(uniforms.uIntensityA.value,    uniforms.uIntensityB.value,    uniforms.uMix.value),
        repeat:        new THREE.Vector3().lerpVectors(uniforms.uRepeatA.value,    uniforms.uRepeatB.value,    uniforms.uMix.value),
        brightness:    new THREE.Vector3().lerpVectors(uniforms.uBrightnessA.value,uniforms.uBrightnessB.value,uniforms.uMix.value),
        contrast:      new THREE.Vector3().lerpVectors(uniforms.uContrastA.value,  uniforms.uContrastB.value,  uniforms.uMix.value),
        oscillation:   new THREE.Vector3().lerpVectors(uniforms.uOscillationA.value,uniforms.uOscillationB.value,uniforms.uMix.value),
        phase:         new THREE.Vector3().lerpVectors(uniforms.uPhaseA.value,     uniforms.uPhaseB.value,     uniforms.uMix.value),
        rotationSpeed: lerp(rotA, rotB, uniforms.uMix.value),
        autoRotateSpeed: lerp(autoA, autoB, uniforms.uMix.value),
    });

    const buildParams = (base, partial) => ({
        speed:         partial.speed         ?? base.speed,
        noiseDensity:  partial.noiseDensity  ?? base.noiseDensity,
        noiseStrength: partial.noiseStrength ?? base.noiseStrength,
        frequency:     partial.frequency     ?? base.frequency,
        amplitude:     partial.amplitude     ?? base.amplitude,
        intensity:     partial.intensity     ?? base.intensity,
        repeat:        partial.repeat ? new THREE.Vector3(...partial.repeat) : base.repeat.clone(),
        brightness:    partial.brightness ? toV3(partial.brightness, base.brightness) : base.brightness.clone(),
        contrast:      partial.contrast   ? toV3(partial.contrast,   base.contrast)   : base.contrast.clone(),
        oscillation:   partial.oscillation? toV3(partial.oscillation,base.oscillation): base.oscillation.clone(),
        phase:         partial.phase      ? toV3(partial.phase,      base.phase)      : base.phase.clone(),
        rotationSpeed: partial.rotationSpeed ?? base.rotationSpeed ?? 0,
        autoRotateSpeed: partial.autoRotateSpeed ?? base.autoRotateSpeed ?? 0,
    });


    // Controls
   

    const ro = new ResizeObserver(() => {
      const w = Math.max(1, root.clientWidth || 640);
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(root);

    let raf;
    let tween = null;

    const startCrossfade = (target, dur = 800) => {
        // 1) Snapshot current effective values as new A
        const cur = currentEffective();
        writeSet(cur, 'A');
        rotA  = cur.rotationSpeed;
        autoA = cur.autoRotateSpeed;

        // 2) Build B from current + target partial
        const next = buildParams(cur, target || {});
        writeSet(next, 'B');
        rotB  = next.rotationSpeed;
        autoB = next.autoRotateSpeed;

        // 3) Reset mix and start tween
        uniforms.uMix.value = 0;
        tween = { start: performance.now(), dur: Math.max(1, dur) };
    };


    const clock = new THREE.Clock();

    // ★ put controls.update() back so damping & auto-rotate work
    const animate = (now) => {
    const dt = Math.min(clock.getDelta(), 1/30); // clamp to avoid jumps
    uniforms.uTime.value += dt;

    // step tween
    if (tween) {
      const t = clamp((now - tween.start) / tween.dur, 0, 1);
      const te = easeInOutCubic(t);
      uniforms.uMix.value = te;
      mesh.userData.rotationSpeed = lerp(rotA,  rotB,  te);
    //   controls.autoRotateSpeed    = lerp(autoA, autoB, te);

      if (t >= 1) {
        // Commit B -> A for next transitions; reset mix
        const committed = currentEffective(); // effectively B
        writeSet(committed, 'A');
        rotA = committed.rotationSpeed;
        autoA = committed.autoRotateSpeed;
        uniforms.uMix.value = 0;
        tween = null;
      }
    }

    const rs = mesh.userData.rotationSpeed || 0;
    mesh.rotation.y += rs * dt;
    mesh.rotation.x += rs * 0.25 * dt;
    // controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };
  raf = requestAnimationFrame(animate);

    const api = {
      setState:   (name, opts = {}) => startCrossfade((presets[name] || {}), opts.duration ?? 800),
      setUniforms:(partial = {}, opts = {}) => startCrossfade(partial, opts.duration ?? 600),
      setPalette: ({brightness, contrast, oscillation, phase}, opts = {}) =>
        startCrossfade({brightness, contrast, oscillation, phase}, opts.duration ?? 600),
    };

    threeRef.current = { renderer, scene, camera, material, mesh, api };

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    //   controls.dispose();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    //   renderer.domElement.removeEventListener("mousedown", onDown);
    //   window.removeEventListener("mouseup", onUp);
      if (renderer.domElement.parentNode === root) root.removeChild(renderer.domElement);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setState:   (...a) => threeRef.current?.api?.setState(...a),
    setUniforms:(...a) => threeRef.current?.api?.setUniforms(...a),
    setPalette: (...a) => threeRef.current?.api?.setPalette(...a),
  }), []);

  return (
    <div ref={rootRef} className={className} style={{ width: "120%", height, display: "block", ...style }} />
  );
});

export default Blob;