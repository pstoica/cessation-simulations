import type { SketchConfig } from "../../types/sketch";

export const config: SketchConfig = {
  id: "gestalt-detector",
  name: "Gestalt Detector",
  controls: [
    {
      id: "angleX",
      label: "Angle X",
      type: "range",
      min: -180,
      max: 180,
      step: 1,
      defaultValue: 0,
    },
    {
      id: "angleY",
      label: "Angle Y",
      type: "range",
      min: -180,
      max: 180,
      step: 1,
      defaultValue: 0,
    },
    {
      id: "angleZ",
      label: "Angle Z",
      type: "range",
      min: -180,
      max: 180,
      step: 1,
      defaultValue: 0,
    },
    {
      id: "scale",
      label: "Scale",
      type: "range",
      min: 0.5,
      max: 2,
      step: 0.1,
      defaultValue: 1.0,
    },
    {
      id: "nearMissDepth",
      label: "Near Miss Depth",
      type: "range",
      min: 0,
      max: 0.5,
      step: 0.01,
      defaultValue: 0.2,
    },
  ],
};
