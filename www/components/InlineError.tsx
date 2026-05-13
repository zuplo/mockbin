type InlineErrorProps = {
  message: string | null;
  onDismiss?: () => void;
};

const WarningIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
    className="flex-shrink-0"
  >
    <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
  >
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
  </svg>
);

const InlineError = ({ message, onDismiss }: InlineErrorProps) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-danger/30 bg-danger-bg text-danger"
    >
      <div className="pt-px">
        <WarningIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-tight">
          Something went wrong
        </p>
        <p className="text-[12px] leading-snug mt-1 whitespace-pre-wrap break-words text-danger/90">
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-danger hover:bg-danger/10 transition-colors"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default InlineError;
