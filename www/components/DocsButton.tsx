import React from "react";

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
  >
    <path d="M224,40H160a40,40,0,0,0-32,16,40,40,0,0,0-32-16H32A16,16,0,0,0,16,56V200a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V56A16,16,0,0,0,224,40ZM96,200H32V56H96a24,24,0,0,1,24,24V208A39.81,39.81,0,0,0,96,200Zm128,0H160a39.81,39.81,0,0,0-24,8V80a24,24,0,0,1,24-24h64Z" />
  </svg>
);

const DocsButton = ({ docsUrl }: { docsUrl: string }) => {
  return (
    <a
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-line text-[13px] font-semibold text-fg-secondary hover:bg-bg-muted transition-colors"
      href={docsUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <BookIcon />
      <span>API Docs</span>
    </a>
  );
};

export default DocsButton;
