import { useState } from "react";
import type { SketchPreset } from "../../../types/sketch";

interface PresetSelectorProps {
  presets: SketchPreset[];
  onPresetChange: (values: Record<string, any>) => void;
  onSavePreset: (preset: SketchPreset) => void;
}

export function PresetSelector({
  presets,
  onPresetChange,
  onSavePreset,
}: PresetSelectorProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  const handleExport = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(presets)
    )}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "presets.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-2">
      {/* Preset Selection */}
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        onChange={(e) => {
          const preset = presets.find((p) => p.name === e.target.value);
          if (preset) onPresetChange(preset.values);
        }}
      >
        <option value="">Select preset...</option>
        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          onClick={() => setShowSaveDialog(true)}
        >
          Save
        </button>
        <button
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          onClick={handleExport}
        >
          Export
        </button>
        <label className="cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-center">
          Import
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const imported = JSON.parse(e.target?.result as string);
                    if (Array.isArray(imported)) {
                      imported.forEach((preset) => onSavePreset(preset));
                    }
                  } catch (err) {
                    console.error("Failed to import presets:", err);
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
        </label>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Preset name"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && presetName) {
                onSavePreset({ name: presetName, values: {} });
                setPresetName("");
                setShowSaveDialog(false);
              }
              if (e.key === "Escape") setShowSaveDialog(false);
            }}
            autoFocus
          />
          <button
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            onClick={() => {
              if (presetName) {
                onSavePreset({ name: presetName, values: {} });
                setPresetName("");
                setShowSaveDialog(false);
              }
            }}
          >
            OK
          </button>
          <button
            className="rounded-md border border-input px-3 py-2 text-sm"
            onClick={() => setShowSaveDialog(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
