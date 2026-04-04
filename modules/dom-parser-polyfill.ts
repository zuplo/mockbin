import xmldom from "./third-party/xmldom/index.js";

// Temporary workaround for managed builds selecting an AWS SDK XML parser that
// expects DOMParser to exist on the global scope.
if (typeof globalThis.DOMParser === "undefined") {
  globalThis.DOMParser = xmldom.DOMParser as typeof DOMParser;
}
