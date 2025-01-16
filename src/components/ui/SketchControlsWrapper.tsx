import { SketchControls } from "./SketchControls";
import type { SketchConfig } from "../../types/sketch";
import { useState, useEffect } from "react";

type ControlValue = number | boolean | string | [number, number, number];

interface Props {
  config: SketchConfig;
}

export function SketchControlsWrapper({ config }: Props) {
  const [currentValues, setCurrentValues] = useState<
    Record<string, ControlValue>
  >({});

  const handleValueChange = (id: string, value: ControlValue) => {
    setCurrentValues((prev) => ({ ...prev, [id]: value }));
    window.dispatchEvent(
      new CustomEvent("sketch-control-change", {
        detail: { id, value },
      })
    );
  };

  // Listen for preset loads
  useEffect(() => {
    const handlePresetLoad = (
      e: CustomEvent<{ values: Record<string, ControlValue> }>
    ) => {
      const { values } = e.detail;
      setCurrentValues(values);
      // Dispatch individual control changes for each value
      Object.entries(values).forEach(([id, value]) => {
        window.dispatchEvent(
          new CustomEvent("sketch-control-change", {
            detail: { id, value },
          })
        );
      });
    };

    window.addEventListener("preset-load", handlePresetLoad as EventListener);
    return () =>
      window.removeEventListener(
        "preset-load",
        handlePresetLoad as EventListener
      );
  }, []);

  // Add listener for value updates
  useEffect(() => {
    const handler = (e: CustomEvent<{ id: string; value: ControlValue }>) => {
      const { id, value } = e.detail;
      setCurrentValues((prev) => ({ ...prev, [id]: value }));

      window.dispatchEvent(
        new CustomEvent("sketch-control-change", {
          detail: { id, value },
        })
      );
    };

    window.addEventListener("sketch-value-update", handler as EventListener);
    return () =>
      window.removeEventListener(
        "sketch-value-update",
        handler as EventListener
      );
  }, []);

  return (
    <div className="space-y-4">
      <SketchControls
        config={config}
        onValueChange={handleValueChange}
        onValuesInit={setCurrentValues}
      />
    </div>
  );
}
