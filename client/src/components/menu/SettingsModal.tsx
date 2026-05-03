import { useState } from "react";
import { FPS_OPTIONS, loadSettings, saveSettings, type GameSettings } from "../../lib/settings";
import { WardrobeModal } from "./WardrobeModal";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<GameSettings>(() => loadSettings());

  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(draft);
    onClose();
  };

  const handleCancel = () => {
    setDraft(loadSettings());
    onClose();
  };

  return (
    <WardrobeModal
      open={open}
      onClose={handleCancel}
      preview={
        <div className="wg-settings-hero">
          <div className="wg-settings-hero-eyebrow">· · · CONFIGURATION · · ·</div>
          <div className="wg-settings-hero-title">Tune the <span className="accent">Arena</span></div>
          <div className="wg-settings-hero-meta">Calibrate the experience. Saved locally.</div>
          <div className="wg-settings-hero-decor" aria-hidden="true">
            <i></i><i></i><i></i><i></i><i></i><i></i>
          </div>
        </div>
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">SETTINGS · LOCAL</div>
          <div>
            <div className="wg-modal-title">Preferences</div>
            <div className="wg-modal-subtitle">Quiet adjustments. They follow your browser.</div>
          </div>

          <div className="wg-settings-list">
            <Slider
              label="Master Volume"
              value={draft.masterVolume}
              min={0} max={100} step={1}
              suffix="%"
              onChange={(v) => update("masterVolume", v)}
            />

            <SegmentedControl
              label="Frame Rate Cap"
              value={String(draft.fpsCap)}
              options={FPS_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
              onChange={(v) => update("fpsCap", Number(v) as GameSettings["fpsCap"])}
            />

            <Slider
              label="Mouse Sensitivity"
              value={draft.mouseSensitivity}
              min={0.5} max={2.0} step={0.05}
              suffix="×"
              onChange={(v) => update("mouseSensitivity", Number(v.toFixed(2)))}
            />

            <Toggle
              label="Low-FX Mode"
              hint="Reduce visual flourishes for performance."
              checked={draft.lowFxMode}
              onChange={(v) => update("lowFxMode", v)}
            />

            <Toggle
              label="Hide UI While Playing"
              hint="Cleaner view; press tab to peek."
              checked={draft.hideUiWhilePlaying}
              onChange={(v) => update("hideUiWhilePlaying", v)}
            />
          </div>

          <div className="wg-equip-row">
            <button className="wg-cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
            <button className="wg-equip-btn" type="button" onClick={handleSave}>
              Save &nbsp;<span style={{ fontStyle: "normal" }}>✓</span>
            </button>
          </div>
        </div>
      }
    />
  );
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, suffix, onChange }: SliderProps) {
  return (
    <label className="wg-settings-slider">
      <div className="wg-settings-row-head">
        <span className="wg-settings-label">{label}</span>
        <span className="wg-settings-value">{value.toFixed(suffix === "×" ? 2 : 0)}{suffix ?? ""}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
    </label>
  );
}

type SegmentedControlProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function SegmentedControl({ label, value, options, onChange }: SegmentedControlProps) {
  return (
    <div className="wg-settings-segmented">
      <div className="wg-settings-row-head">
        <span className="wg-settings-label">{label}</span>
      </div>
      <div className="wg-settings-segments" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={opt.value === value}
            className={opt.value === value ? "wg-settings-segment active" : "wg-settings-segment"}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type ToggleProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <label className="wg-settings-toggle">
      <div>
        <span className="wg-settings-label">{label}</span>
        {hint ? <span className="wg-settings-hint">{hint}</span> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={checked ? "wg-toggle on" : "wg-toggle"}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </label>
  );
}
