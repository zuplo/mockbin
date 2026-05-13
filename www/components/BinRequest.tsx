import CopyButton from "@/components/CopyButton";
import Tabs, { Tab } from "@/components/Tabs";
import React, { useLayoutEffect, useState } from "react";
import { RequestDetails } from "../utils/interfaces";
import MethodIndicator from "@/components/MethodIndicator";
import CloseIcon from "@/components/CloseIcon";

type TestOperationResponseProps = {
  isLoading: boolean;
  requestDetails: RequestDetails | undefined;
  onClose: () => void;
};

const FloatingCopyButton = ({ textToCopy }: { textToCopy: string }) => (
  <div className="hidden sm:block absolute right-2 top-2 z-40">
    <CopyButton textToCopy={textToCopy} />
  </div>
);

const getRequestIsJson = (requestDetails: RequestDetails | undefined) => {
  if (!requestDetails) {
    return true;
  }

  const requestContentType = requestDetails.headers?.["Content-Type"];
  if (requestContentType) {
    return requestContentType.includes("json");
  }

  if (!requestDetails.body) {
    return false;
  }

  try {
    JSON.parse(requestDetails.body);
    return true;
  } catch (e) {
    return false;
  }
};

const BinRequest = ({
  isLoading,
  requestDetails,
  onClose,
}: TestOperationResponseProps) => {
  const requestIsJson =
    !isLoading && requestDetails ? getRequestIsJson(requestDetails) : false;
  const tabs: Tab[] = [
    { name: "RAW" },
    ...(requestIsJson ? [{ name: "JSON" }] : []),
    {
      name: "HEADERS",
      count: requestDetails?.headers
        ? Object.keys(requestDetails.headers).length
        : undefined,
    },
  ];

  const [selectedTab, setSelectedTab] = useState(
    requestIsJson ? "JSON" : "RAW",
  );

  useLayoutEffect(() => {
    setSelectedTab(requestIsJson ? "JSON" : "RAW");
  }, [requestIsJson]);

  let requestUrl = null;
  if (requestDetails?.url) {
    requestUrl = `${requestDetails.url.pathname}${requestDetails.url.search}`;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center pt-32 text-fg-muted text-sm">
        Loading…
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <p className="p-6 text-fg-muted text-sm">
        Click on a request to see its details here
      </p>
    );
  }

  const requestBody = requestDetails.body
    ? requestIsJson && selectedTab === "JSON"
      ? JSON.stringify(JSON.parse(requestDetails.body), null, 2)
      : requestDetails.body
    : undefined;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 border-b border-line sticky top-0 bg-white z-10 px-4 py-3">
        <MethodIndicator method={requestDetails.method} />
        <pre className="flex-grow font-mono text-[12px] text-fg truncate">
          {requestUrl}
        </pre>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors"
          aria-label="Close request panel"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="flex px-4 py-2 gap-2 text-xs text-fg-muted border-b border-line">
        <span>{new Date(requestDetails.timestamp).toLocaleString()}</span>
        <span aria-hidden="true">•</span>
        <span>{requestDetails.size} B</span>
      </div>
      <div className="px-4">
        <Tabs
          selectedTab={selectedTab}
          tabs={tabs}
          onChange={setSelectedTab}
        />
      </div>
      <div className="p-4 overflow-auto flex-1">
        {(selectedTab === "RAW" || selectedTab === "JSON") && (
          <div className="relative">
            {requestBody ? (
              <pre className="bg-code-bg text-code-fg font-mono text-[12px] leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre">
                {requestBody}
              </pre>
            ) : (
              <span className="text-fg-muted italic text-sm">
                No request body sent.
              </span>
            )}
            {requestBody && <FloatingCopyButton textToCopy={requestBody} />}
          </div>
        )}
        {selectedTab === "HEADERS" && (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-bg-subtle">
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wide text-fg-faint font-semibold">
                    Header
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wide text-fg-faint font-semibold">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {requestDetails.headers &&
                  Object.entries(requestDetails.headers).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-t border-bg-muted font-mono"
                    >
                      <td className="px-3 py-2 text-fg font-semibold align-top">
                        {key}
                      </td>
                      <td className="px-3 py-2 text-fg-secondary whitespace-pre-line break-all align-top">
                        {value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinRequest;
