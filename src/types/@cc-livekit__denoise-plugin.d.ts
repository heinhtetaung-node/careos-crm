// Type declarations for @cc-livekit/denoise-plugin
// This file helps TypeScript resolve types when using moduleResolution: "node"
// The package uses "exports" field which isn't fully supported by "node" resolution

declare module '@cc-livekit/denoise-plugin' {
  export {
    DenoiseTrackProcessor,
    type DenoiseFilterOptions,
  } from '../../node_modules/@cc-livekit/denoise-plugin/dist/index.d.ts';
}
