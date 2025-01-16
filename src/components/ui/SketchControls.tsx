import { useEffect, useState } from "react";
import type { SketchConfig } from "../../types/sketch";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

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
    <TooltipProvider delayDuration={0}>
      <div className="space-y-2">
        {config.controls.map((control) => (
          <div
            key={control.id}
            className="grid grid-cols-[auto,1fr,1fr,auto] items-center gap-2 text-sm"
          >
            {control.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-0.5 text-neutral-400 hover:text-neutral-950 transition-colors">
                    <Info className="h-3.5 w-3.5" />
                    <span className="sr-only">Info</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  <p>{control.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="w-[20px]" aria-hidden="true" /> // Spacer for alignment
            )}
            <label className="text-sm font-medium">{control.label}</label>
            {control.type === "range" ? (
              <>
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
                <input
                  type="number"
                  value={
                    inputValues[control.id] ??
                    Number(values[control.id]).toFixed(2)
                  }
                  onChange={(e) =>
                    handleInputChange(control.id, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                      handleNumberInput(control.id);
                    }
                  }}
                  onBlur={() => handleNumberInput(control.id)}
                  className="w-16 px-1 py-0.5 text-right text-sm bg-white border rounded"
                  step={control.step}
                />
              </>
            ) : control.type === "toggle" ? (
              <>
                <div className="flex justify-end col-span-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values[control.id]}
                    onClick={() =>
                      handleChange(control.id, !values[control.id])
                    }
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full
                      ${values[control.id] ? "bg-blue-600" : "bg-gray-200"}
                      transition-colors duration-200
                    `}
                  >
                    <span className="sr-only">{control.label}</span>
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                        ${
                          values[control.id] ? "translate-x-6" : "translate-x-1"
                        }
                      `}
                    />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
