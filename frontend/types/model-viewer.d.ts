import type React from "react"

type ModelViewerAttributes = {
  src?: string
  alt?: string
  ar?: boolean | string
  "ar-modes"?: string
  "ar-scale"?: string
  "ar-placement"?: "floor" | "wall"
  "camera-controls"?: boolean | string
  "auto-rotate"?: boolean | string
  "rotation-per-second"?: string
  "shadow-intensity"?: string
  "environment-image"?: string
  "skybox-image"?: string
  exposure?: string
  poster?: string
  loading?: "auto" | "lazy" | "eager"
  reveal?: "auto" | "manual"
  "interaction-prompt"?: "auto" | "when-focused" | "none"
  "camera-orbit"?: string
  "field-of-view"?: string
  "max-camera-orbit"?: string
  "min-camera-orbit"?: string
  "touch-action"?: string
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps <
        React.HTMLAttributes<HTMLElement> & ModelViewerAttributes,
        HTMLElement
      >
    }
  }
}
export {}