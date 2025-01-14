import { PresetControls } from "./PresetControls";
import { SketchControls } from "./SketchControls";
import type { SketchConfig } from "../../types/sketch";
import { useState, useEffect } from "react";

interface Props {
  config: SketchConfig;
}

export function SketchControlsWrapper({ config }: Props) {
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});

  const handlePresetLoad = (values: Record<string, any>) => {
    console.log("Loading preset:", values);
    Object.entries(values).forEach(([id, value]) => {
      window.dispatchEvent(
        new CustomEvent("sketch-control-change", {
          detail: { id, value },
        })
      );
    });
  };

  const handleValueChange = (id: string, value: any) => {
    console.log("Value change from slider:", id, value);
    setCurrentValues((prev) => ({ ...prev, [id]: value }));
    window.dispatchEvent(
      new CustomEvent("sketch-control-change", {
        detail: { id, value },
      })
    );
  };

  // Add listener for value updates
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { id, value } = e.detail;
      console.log("Received value update in wrapper:", id, value);
      setCurrentValues((prev) => ({ ...prev, [id]: value }));

      // Dispatch control change
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

  return (
    <div className="space-y-8">
      <PresetControls
        config={config}
        presets={config.presets}
        currentValues={currentValues}
        onLoad={handlePresetLoad}
      />
      <div className="space-y-3">
        <SketchControls
          config={config}
          onValueChange={handleValueChange}
          onValuesInit={setCurrentValues}
        />
      </div>
    </div>
  );
}
