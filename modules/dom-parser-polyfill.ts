import xmldom from "./third-party/xmldom/index.js";

// Temporary workaround for managed builds selecting an AWS SDK XML parser that
// expects DOMParser to exist on the global scope.
if (typeof globalThis.DOMParser === "undefined") {
  globalThis.DOMParser = xmldom.DOMParser as typeof DOMParser;
}

if (typeof globalThis.Node === "undefined") {
  globalThis.Node = xmldom.Node as typeof Node;
}

if (typeof globalThis.Element === "undefined") {
  globalThis.Element = xmldom.Element as typeof Element;
}

if (typeof globalThis.Document === "undefined") {
  globalThis.Document = xmldom.Document as typeof Document;
}

if (typeof globalThis.DocumentFragment === "undefined") {
  globalThis.DocumentFragment =
    xmldom.DocumentFragment as typeof DocumentFragment;
}

if (typeof globalThis.NodeList === "undefined") {
  globalThis.NodeList = xmldom.NodeList as typeof NodeList;
}

if (typeof globalThis.XMLSerializer === "undefined") {
  globalThis.XMLSerializer = xmldom.XMLSerializer as typeof XMLSerializer;
}
