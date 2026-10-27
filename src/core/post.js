/**
 * Restrained post pipeline (standards 4.3): SMAA on Medium+, N8AO ambient
 * occlusion on High+. No bloom (nothing in a daylit room motivates it) and no
 * depth of field (the plan's three cinematics are short orient/reveal shots).
 * If an effect fails to initialize, rendering falls back to the direct path.
 *
 * Chain: RenderPass -> N8AOPass (High+) -> EffectPass(SMAA).
 * @module core/post
 */
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, SMAAEffect } from 'postprocessing';
import { N8AOPass } from 'n8ao';

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {object} presetDef quality preset definition (core/quality.js)
 * @returns {import('postprocessing').EffectComposer|null}
 */
export function createComposer(renderer, scene, camera, presetDef) {
  if (!presetDef.post?.includes('smaa')) return null;
  try {
    const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    if (presetDef.aoEnabled) {
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const ao = new N8AOPass(scene, camera, size.x || 512, size.y || 512);
      // Room scale: contact shadows under hands, sheets and chair legs (radius in meters).
      ao.configuration.aoRadius = 0.5;
      ao.configuration.distanceFalloff = 0.4;
      ao.configuration.intensity = 2.0;
      ao.configuration.aoSamples = 12;
      ao.configuration.denoiseSamples = 6;
      composer.addPass(ao);
    }
    composer.addPass(new EffectPass(camera, new SMAAEffect()));
    return composer;
  } catch (e) {
    console.warn('Post-processing unavailable; rendering directly.', e);
    return null;
  }
}
