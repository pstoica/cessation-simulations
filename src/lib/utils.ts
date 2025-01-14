import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportAllPresets() {
  const allPresets: Record<string, any> = {};

  // Get all presets from localStorage
  for (const key of Object.keys(localStorage)) {
    if (key.endsWith("-presets")) {
      const sketchId = key.replace("-presets", "");
      const presets = JSON.parse(localStorage.getItem(key) || "[]");
      allPresets[sketchId] = presets;
    }
  }

  // Create and trigger download
  const blob = new Blob([JSON.stringify(allPresets, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "all-presets.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importAllPresets(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const allPresets = JSON.parse(e.target?.result as string);

        // Store each sketch's presets
        Object.entries(allPresets).forEach(([sketchId, presets]) => {
          localStorage.setItem(`${sketchId}-presets`, JSON.stringify(presets));
        });

        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}
