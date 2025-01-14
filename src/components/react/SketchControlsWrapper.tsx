import { PresetControls } from "./PresetControls";
import { SketchControls } from "./SketchControls";
import type { SketchConfig } from "../types/sketch";

interface Props {
  config: SketchConfig;
}

export function SketchControlsWrapper({ config }: Props) {
  const handlePresetLoad = (values: Record<string, any>) => {
    Object.entries(values).forEach(([id, value]) => {
      window.dispatchEvent(
        new CustomEvent("sketch-control-change", {
          detail: { id, value },
        })
      );
    });
  };

  const handlePresetSave = (name: string, values: Record<string, any>) => {
    // Save preset logic
  };

  return (
    <div className="p-6 space-y-8">
      <PresetControls
        presets={config.presets}
        onLoad={handlePresetLoad}
        onSave={handlePresetSave}
      />
      <div className="space-y-3">
        <SketchControls
          config={config}
          onValueChange={(id, value) => {
            window.dispatchEvent(
              new CustomEvent("sketch-control-change", {
                detail: { id, value },
              })
            );
          }}
        />
      </div>
    </div>
  );
}
