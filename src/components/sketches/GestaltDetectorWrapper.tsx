import { useEffect, useState } from "react";
import { GestaltDetector } from "./GestaltDetector";

interface Values {
  angleX: number;
  angleY: number;
  angleZ: number;
  scale: number;
  nearMissDepth: number;
}

export function GestaltDetectorWrapper() {
  const [values, setValues] = useState<Values>({
    angleX: 0,
    angleY: 0,
    angleZ: 0,
    scale: 1,
    nearMissDepth: 0.2,
  });

  // Listen for control changes from UI
  useEffect(() => {
    const handleControlChange = (event: CustomEvent) => {
      const { id, value } = event.detail;
      console.log("Control change in wrapper:", id, value);
      setValues((prev) => ({ ...prev, [id]: Number(value) }));
    };

    window.addEventListener(
      "sketch-control-change",
      handleControlChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "sketch-control-change",
        handleControlChange as EventListener
      );
    };
  }, []);

  // Emit value updates back to controls
  const handleSceneChange = (newValues: Partial<Values>) => {
    console.log("Scene change:", newValues);
    Object.entries(newValues).forEach(([id, value]) => {
      console.log("Dispatching value update:", id, value);
      window.dispatchEvent(
        new CustomEvent("sketch-value-update", {
          detail: { id, value },
        })
      );
    });
    setValues((prev) => ({ ...prev, ...newValues }));
  };

  return <GestaltDetector values={values} onValuesChange={handleSceneChange} />;
}
