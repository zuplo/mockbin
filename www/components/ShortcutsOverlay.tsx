import { useEffect } from "react";

type Shortcut = {
  keys: string[];
  label: string;
};

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md border border-line bg-bg-subtle text-fg-secondary font-system text-[12px] font-semibold">
    {children}
  </kbd>
);

const ShortcutsOverlay = ({
  open,
  onClose,
  shortcuts,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 256 256"
              fill="currentColor"
              fillRule="evenodd"
              aria-hidden="true"
            >
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
            </svg>
          </button>
        </header>
        <ul className="flex flex-col divide-y divide-bg-muted">
          {shortcuts.map(({ keys, label }) => (
            <li
              key={label}
              className="flex items-center justify-between py-2.5"
            >
              <span className="text-[13px] text-fg-secondary">{label}</span>
              <span className="flex items-center gap-1">
                {keys.map((k) => (
                  <Key key={k}>{k}</Key>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-fg-faint text-center">
          Press <Key>?</Key> any time to toggle this panel.
        </p>
      </div>
    </div>
  );
};

export default ShortcutsOverlay;
