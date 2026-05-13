import React from "react";

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight = ({
  highlight,
  text,
}: {
  highlight: string;
  text: string;
}) => {
  if (!highlight.trim()) {
    return text;
  }

  const highlightChars = highlight.split("").map(escapeRegExp).join("|");
  const regex = new RegExp(`(${highlightChars})`, "gi");

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark
        className="font-semibold bg-accent/20 text-accent rounded-sm px-0.5"
        key={index}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

export default Highlight;
