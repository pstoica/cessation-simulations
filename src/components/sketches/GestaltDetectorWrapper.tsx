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

  useEffect(() => {
    const handleControlChange = (event: CustomEvent) => {
      const { id, value } = event.detail;
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

  return <GestaltDetector values={values} />;
}
