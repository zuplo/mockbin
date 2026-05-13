import React from "react";

const FullScreenLoading = () => {
  return (
    <div
      className="loading-background"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="loading-bar">
        <div className="loading-circle-1" />
        <div className="loading-circle-2" />
      </div>
    </div>
  );
};

export default FullScreenLoading;
