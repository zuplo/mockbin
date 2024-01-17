import React, { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "@mockbin/left-column";

export const useBinColumnsResize = (isOpen: boolean) => {
  const [leftColumnPercentage, setLeftColumnPercentage] = useState(() =>
    typeof window === "undefined"
      ? 50
      : Number(localStorage.getItem(STORAGE_KEY) ?? 50),
  );
  // Used in mouseUp event handler to store the latest value of leftColumnPercentage in localStorage
  const leftPercentageRef = useRef(leftColumnPercentage);

  useEffect(() => {
    setLeftColumnPercentage(
      isOpen ? Number(localStorage.getItem(STORAGE_KEY) ?? 50) : 0,
    );
  }, [isOpen]);

  const handleDividerMouseDown = useCallback((event: React.MouseEvent) => {
    const { parentElement } = event.currentTarget;
    const width = parentElement?.offsetWidth ?? 0;

    // firstElementChild should be good enough to get the left column (another option would be to use a ref)
    const leftColumn = parentElement?.firstElementChild as HTMLElement;

    leftColumn.style.pointerEvents = "none";
    // Prevent selecting page content while resizing
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = (mouseMoveEvent.clientX / width) * 100;
      const clampedWidth = Math.min(Math.max(newWidth, 0), 100);

      setLeftColumnPercentage(clampedWidth);
      leftPercentageRef.current = clampedWidth;
    };

    const onMouseUp = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      leftColumn.style.pointerEvents = "";

      localStorage.setItem(STORAGE_KEY, String(leftPercentageRef.current));

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return { leftColumnPercentage, handleDividerMouseDown } as const;
};
