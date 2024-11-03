import React from "react";
import BookIcon from "./BookIcon";

const DocsButton = ({ docsUrl }: { docsUrl: string }) => {
  return (
    <a
      className="flex items-center px-2 bg-pink-500 py-1 hover:bg-pink-700 rounded"
      href={docsUrl}
      target="_blank"
      rel="noopener noreferrer" // Best practice for security
    >
      <div className="mr-1">
        <BookIcon className="" />
      </div>
      <span className="text-white">See your Docs by Zudoku</span>
    </a>
  );
};

export default DocsButton;
