import { PresetControls } from "./PresetControls";
import { SketchControls } from "./SketchControls";
import type { SketchConfig } from "../../types/sketch";
import { useState } from "react";

interface Props {
  config: SketchConfig;
}

export function SketchControlsWrapper({ config }: Props) {
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});

  const handlePresetLoad = (values: Record<string, any>) => {
    Object.entries(values).forEach(([id, value]) => {
      window.dispatchEvent(
        new CustomEvent("sketch-control-change", {
          detail: { id, value },
        })
      );
    });
  };

  const handleValueChange = (id: string, value: any) => {
    setCurrentValues((prev) => ({ ...prev, [id]: value }));
    window.dispatchEvent(
      new CustomEvent("sketch-control-change", {
        detail: { id, value },
      })
    );
  };

  return (
    <div className="p-6 space-y-8">
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
