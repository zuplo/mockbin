"use client";

import React, { useRef, useState } from "react";

const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
    className={className}
  >
    <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V136a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
    className={className}
  >
    <path d="M128,24A104,104,0,1,0,232,128A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-114.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,152.69l50.34-50.35A8,8,0,0,1,173.66,101.66Z" />
  </svg>
);

interface FileInputProps {
  onChange: (file: File | null) => void;
  onError?: (message: string | null) => void;
  accept?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const parseAccept = (accept: string) =>
  accept
    .split(",")
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean);

const hasAcceptedExtension = (fileName: string, extensions: string[]) => {
  if (extensions.length === 0) return true;
  return extensions.some((extension) =>
    fileName.toLowerCase().endsWith(extension),
  );
};

export default function FileInput({
  onChange,
  onError,
  accept = ".json,.yaml,.yml",
}: FileInputProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const selected = files[0];
    // The `accept` attribute only filters the OS file picker, so drag-and-drop
    // needs the same check — otherwise an unsupported file silently fails on
    // submit instead of saying why here.
    const extensions = parseAccept(accept);
    if (!hasAcceptedExtension(selected.name, extensions)) {
      const allowed = extensions.join(", ");
      onError?.(
        `${selected.name} isn't a supported file type. Upload an OpenAPI document ending in ${allowed}.`,
      );
      return;
    }
    onError?.(null);
    setFile(selected);
    onChange(selected);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const onRemoveClick = () => {
    setFile(null);
    onChange(null);
    onError?.(null);
    // Clearing the input's value means re-picking the same file still fires a
    // change event.
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  let stateClasses = "border-line bg-bg-subtle hover:border-line-strong";
  if (dragActive) {
    stateClasses = "border-accent bg-accent-light";
  } else if (file) {
    stateClasses = "border-success/50 bg-success-bg";
  }

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed p-6 text-center transition-colors ${stateClasses}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        onChange={handleChange}
        aria-label="OpenAPI document"
      />
      <div
        className="flex w-full flex-col items-center justify-center gap-3"
        aria-live="polite"
      >
        {file ? (
          <>
            <CheckCircleIcon className="h-7 w-7 text-success" />
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-semibold text-success">
                File attached — ready to create your bin
              </p>
              <p className="text-sm font-mono text-fg break-all">
                {file.name}
                <span className="text-fg-muted">
                  {" · "}
                  {formatBytes(file.size)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onButtonClick}
                type="button"
                className="inline-flex items-center h-8 px-3 rounded-lg bg-white border border-line text-[13px] font-semibold text-fg-secondary hover:bg-bg-muted transition-colors"
              >
                Replace file
              </button>
              <button
                onClick={onRemoveClick}
                type="button"
                className="inline-flex items-center h-8 px-3 rounded-lg text-[13px] font-semibold text-fg-muted hover:text-fg hover:bg-white/70 transition-colors"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <UploadIcon className="h-7 w-7 text-fg-muted" />
            <p className="text-[13px] text-fg-muted max-w-xs">
              Drop your OpenAPI 3.x file here, or click below to browse
              <span className="block mt-1 text-[11px] uppercase tracking-wider text-fg-faint font-semibold">
                JSON · YAML
              </span>
            </p>
            <button
              onClick={onButtonClick}
              type="button"
              className="inline-flex items-center h-8 px-3 rounded-lg bg-white border border-line text-[13px] font-semibold text-fg-secondary hover:bg-bg-muted transition-colors"
            >
              Browse files
            </button>
          </>
        )}
      </div>
    </div>
  );
}
