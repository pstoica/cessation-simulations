export interface SketchControl {
  id: string;
  label: string;
  tooltip?: string;
  type: "range" | "toggle" | "select" | "color" | "vector";
  defaultValue: number | boolean | string | [number, number, number];
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
}

export interface SketchConfig {
  id: string;
  title: string;
  description?: string;
  seizureWarning?: boolean;
  controls: SketchControl[];
  presets?: Preset[];
}

export interface SketchPreset {
  name: string;
  values: Record<string, any>;
}

export interface Preset {
  name: string;
  values: Record<string, any>;
}
