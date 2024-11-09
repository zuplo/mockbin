"use client";

import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";

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
      className={`relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
        dragActive ? "border-primary bg-primary/10" : "border-gray-300"
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
        aria-label="File input"
      />
      {fileName ? (
        <p className="text-center text-sm">{fileName}</p>
      ) : (
        <>
          <Upload className="mb-2 h-6 w-6 text-gray-400" />
          <p className="mb-2 text-center text-sm text-gray-500">
            Choose or drop an OpenAPI 3.x file here (json or yaml)
          </p>
        </>
      )}
      <button
        onClick={onButtonClick}
        type="button"
        className="bg-pink-500 py-1 px-2 rounded hover:bg-pink-700 hover:shadow-white"
      >
        Browse Files
      </button>
    </div>
  );
}
