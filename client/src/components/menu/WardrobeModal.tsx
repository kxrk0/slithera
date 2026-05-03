import { useEffect, type ReactNode } from "react";

type WardrobeModalProps = {
  open: boolean;
  onClose: () => void;
  preview: ReactNode;
  side: ReactNode;
};

export function WardrobeModal({ open, onClose, preview, side }: WardrobeModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="wg-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="wg-modal" onClick={(event) => event.stopPropagation()}>
        <button className="wg-modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        {preview}
        {side}
      </div>
    </div>
  );
}
