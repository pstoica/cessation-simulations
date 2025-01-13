import { useState, useEffect } from "react";
import type { SketchConfig, SketchPreset } from "../../types/sketch";
import { Slider } from "./ui/Slider";
import { PresetSelector } from "./ui/PresetSelector";

interface SketchControlsProps {
  config: SketchConfig;
  onValueChange: (id: string, value: any) => void;
}

export function SketchControls({ config, onValueChange }: SketchControlsProps) {
  const [values, setValues] = useState(() => {
    // Initialize with default values from config
    return Object.fromEntries(
      config.controls.map((control) => [control.id, control.value])
    );
  });

  const [presets, setPresets] = useState<SketchPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`${config.id}-presets`);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets:", e);
      }
    }
  }, [config.id]);

  // Save presets to localStorage when they change
  useEffect(() => {
    if (presets.length > 0) {
      // Only save if we have presets
      localStorage.setItem(`${config.id}-presets`, JSON.stringify(presets));
    }
  }, [presets, config.id]);

  const handleChange = (id: string, value: any) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    onValueChange(id, value);
  };

  return (
    <div className="w-full max-w-sm space-y-6 p-4">
      <PresetSelector
        presets={presets}
        onPresetChange={(presetValues) => {
          setValues(presetValues);
          Object.entries(presetValues).forEach(([id, value]) => {
            onValueChange(id, value);
          });
        }}
        onSavePreset={(preset) => {
          setPresets((prev) => [...prev, { ...preset, values }]);
        }}
      />
      <div className="space-y-4">
        {config.controls.map((control) => (
          <div key={control.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor={control.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {control.label}
              </label>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {values[control.id].toFixed(1)}
              </span>
            </div>
            {control.type === "range" && (
              <div className="relative pt-3">
                <div className="absolute inset-x-0 top-0 h-full">
                  {/* Track marks */}
                  {control.min! < 0 && control.max! > 0 && (
                    <>
                      {/* Center line */}
                      <div
                        className="absolute top-0 h-full w-px bg-border"
                        style={{ left: "50%" }}
                        onClick={() => handleChange(control.id, 0)}
                      />
                      {/* Negative quarter */}
                      <div
                        className="absolute top-0 h-full w-px bg-border opacity-50"
                        style={{ left: "25%" }}
                      />
                      {/* Positive quarter */}
                      <div
                        className="absolute top-0 h-full w-px bg-border opacity-50"
                        style={{ left: "75%" }}
                      />
                    </>
                  )}
                </div>
                <Slider
                  id={control.id}
                  value={[values[control.id] as number]}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  onValueChange={([value]) => handleChange(control.id, value)}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
