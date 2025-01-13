import type { SketchConfig } from "../../types/sketch";

export const config: SketchConfig = {
  id: "coupled-kernels",
  title: "Coupled Kernels",
  description:
    "Visualization of coupled oscillators with various coupling strengths",
  controls: [
    {
      id: "coupling1",
      label: "Coupling (1)",
      type: "range",
      value: 10.1,
      min: -20,
      max: 20,
      step: 0.1,
    },
    {
      id: "coupling2",
      label: "Coupling (2)",
      type: "range",
      value: 5.0,
      min: -20,
      max: 20,
      step: 0.1,
    },
    {
      id: "coupling3",
      label: "Coupling (3)",
      type: "range",
      value: 2.5,
      min: -20,
      max: 20,
      step: 0.1,
    },
    {
      id: "coupling4",
      label: "Coupling (4+)",
      type: "range",
      value: 1.0,
      min: -20,
      max: 20,
      step: 0.1,
    },
    {
      id: "couplingSmallWorld",
      label: "Small World",
      type: "range",
      value: 0.0,
      min: -20,
      max: 20,
      step: 0.1,
    },
  ],
};
