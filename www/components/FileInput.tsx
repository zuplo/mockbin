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

interface FileInputProps {
  onChange: (file: File | null) => void;
  accept?: string;
}

export default function FileInput({
  onChange,
  accept = ".json,.yaml,.yml",
}: FileInputProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
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
    setFileName(files[0].name);
    onChange(files[0]);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed p-6 text-center transition-colors ${
        dragActive
          ? "border-accent bg-accent-light"
          : "border-line bg-bg-subtle hover:border-line-strong"
      }`}
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
      <UploadIcon className="h-7 w-7 text-fg-muted" />
      {fileName ? (
        <p className="text-sm font-mono text-fg">{fileName}</p>
      ) : (
        <p className="text-[13px] text-fg-muted max-w-xs">
          Drop your OpenAPI 3.x file here, or click below to browse
          <span className="block mt-1 text-[11px] uppercase tracking-wider text-fg-faint font-semibold">
            JSON · YAML
          </span>
        </p>
      )}
      <button
        onClick={onButtonClick}
        type="button"
        className="inline-flex items-center h-8 px-3 rounded-lg bg-white border border-line text-[13px] font-semibold text-fg-secondary hover:bg-bg-muted transition-colors"
      >
        {fileName ? "Choose different file" : "Browse files"}
      </button>
    </div>
  );
}
