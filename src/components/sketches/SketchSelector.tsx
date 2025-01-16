import { useState, useEffect } from "react";
import { exportAllPresets, importAllPresets } from "../../lib/utils";

interface Sketch {
  url: string;
  title: string;
}

interface SketchSelectorProps {
  sketches: Sketch[];
  currentTitle: string;
}

export function SketchSelector({
  sketches,
  currentTitle,
}: SketchSelectorProps) {
  const handleSketchChange = (url: string) => {
    window.location.href = url;
  };

  const handleExportPresets = () => {
    exportAllPresets();
  };

  const handleImportPresets = async (file: File) => {
    await importAllPresets(file);
    window.location.reload();
  };

  return (
    <div className="sketch-selector">
      <select
        onChange={(e) => handleSketchChange(e.target.value)}
        value={
          sketches.find((s) =>
            s.url.includes(currentTitle.toLowerCase().replace(" ", "-"))
          )?.url
        }
      >
        {sketches.map((sketch) => (
          <option key={sketch.url} value={sketch.url}>
            {sketch.title}
          </option>
        ))}
      </select>
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleExportPresets}
          className="flex-1 text-sm p-2 border rounded bg-white hover:bg-gray-50"
        >
          Export All Presets
        </button>
        <button
          onClick={() => document.getElementById("import-all")?.click()}
          className="flex-1 text-sm p-2 border rounded bg-white hover:bg-gray-50"
        >
          Import All Presets
        </button>
        <input
          type="file"
          id="import-all"
          accept=".json"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleImportPresets(e.target.files[0])
          }
        />
      </div>
    </div>
  );
}
