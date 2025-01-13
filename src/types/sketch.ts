export interface SketchControl {
  id: string;
  label: string;
  type: "range" | "toggle" | "select" | "color" | "vector";
  value: number | boolean | string | [number, number, number];
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
}

export interface SketchConfig {
  id: string;
  title: string;
  description: string;
  controls: SketchControl[];
}

export interface SketchPreset {
  name: string;
  values: Record<string, any>;
}
