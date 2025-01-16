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
