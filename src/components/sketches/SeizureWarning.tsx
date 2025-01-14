import { useState, useEffect } from "react";

interface Props {
  sketchId: string;
}

export function SeizureWarning({ sketchId }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(
      `${sketchId}-seizure-warning-accepted`
    );
    if (hasAccepted) {
      setIsVisible(false);
    }
  }, [sketchId]);

  const handleAccept = () => {
    localStorage.setItem(`${sketchId}-seizure-warning-accepted`, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleAccept}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div className="max-w-lg">
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Seizure Warning
        </h2>
        <p style={{ marginBottom: "2rem" }}>
          This visualization contains rapidly changing patterns and colors which
          may trigger seizures in people with photosensitive epilepsy. Viewer
          discretion is advised.
        </p>
        <button
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          I understand, continue
        </button>
      </div>
    </div>
  );
}
