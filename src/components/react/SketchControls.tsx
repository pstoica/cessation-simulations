import { useEffect, useState } from "react";
import type { SketchConfig } from "../types/sketch";

interface Props {
  config: SketchConfig;
  onValueChange: (id: string, value: any) => void;
  onValuesInit?: (values: Record<string, any>) => void;
}

export function SketchControls({ config, onValueChange, onValuesInit }: Props) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initialValues = Object.fromEntries(
      config.controls.map((control) => [control.id, control.defaultValue])
    );
    onValuesInit?.(initialValues);
    return initialValues;
  });

  const handleChange = (id: string, value: any) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    onValueChange(id, value);
  };

  // Listen for external value changes (like presets)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { id, value } = e.detail;
      setValues((prev) => ({ ...prev, [id]: value }));
    };

    window.addEventListener("sketch-control-change" as any, handler);
    return () =>
      window.removeEventListener("sketch-control-change" as any, handler);
  }, []);

  return (
    <div className="space-y-4">
      {config.controls.map((control) => (
        <div
          key={control.id}
          className="flex justify-between items-center gap-4"
        >
          <label className="flex-1">{control.label}</label>
          <div className="flex-1">
            <input
              type="range"
              id={control.id}
              data-id={control.id}
              min={control.min}
              max={control.max}
              step={control.step}
              value={values[control.id]}
              onChange={(e) =>
                handleChange(control.id, parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div className="w-12 text-right">{values[control.id]}</div>
        </div>
      ))}
    </div>
  );
}
