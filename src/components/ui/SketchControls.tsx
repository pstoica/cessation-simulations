import { useEffect, useState } from "react";
import type { SketchConfig } from "../../types/sketch";

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
    return initialValues;
  });

  // Add this state for tracking input values
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    onValuesInit?.(values);
  }, []);

  const handleChange = (id: string, value: any) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    onValueChange(id, value);
  };

  // Listen for external value changes (like presets)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { id, value } = e.detail;
      console.log("Received control change:", id, value);
      setValues((prev) => ({ ...prev, [id]: value }));
    };

    window.addEventListener("sketch-control-change" as any, handler);
    return () =>
      window.removeEventListener("sketch-control-change" as any, handler);
  }, []);

  // Listen for value updates from the scene
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { id, value } = e.detail;
      console.log("Received value update:", id, value);

      // Update local state
      setValues((prev) => ({ ...prev, [id]: value }));

      // Re-dispatch as control-change to keep everything in sync
      console.log("Re-dispatching as control change:", id, value);
      window.dispatchEvent(
        new CustomEvent("sketch-control-change", {
          detail: { id, value },
        })
      );
    };

    window.addEventListener("sketch-value-update" as any, handler);
    return () =>
      window.removeEventListener("sketch-value-update" as any, handler);
  }, []);

  // Add handler for input changes
  const handleInputChange = (id: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  // Update handleNumberInput to use the tracked input value
  const handleNumberInput = (id: string) => {
    const value = parseFloat(inputValues[id] || String(values[id]));
    if (!isNaN(value)) {
      handleChange(id, value);
    }
    setInputValues((prev) => ({ ...prev, [id]: undefined })); // Clear input value
  };

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
          <input
            type="number"
            value={
              inputValues[control.id] ?? Number(values[control.id]).toFixed(2)
            }
            onChange={(e) => handleInputChange(control.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
                handleNumberInput(control.id);
              }
            }}
            onBlur={() => handleNumberInput(control.id)}
            className="w-24 px-2 py-1 text-right bg-white border rounded"
            step={control.step}
          />
        </div>
      ))}
    </div>
  );
}
