import type { SketchConfig } from "../../types/sketch";
import { SketchControls } from "./SketchControls";

interface SketchControlsWrapperProps {
  config: SketchConfig;
}

export function SketchControlsWrapper({ config }: SketchControlsWrapperProps) {
  return (
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
  );
}
