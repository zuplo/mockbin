import CopyButton from "@/components/CopyButton";
import Tabs, { Tab } from "@/components/Tabs";
import React, { useEffect, useState } from "react";
import { RequestDetails } from "../utils/interfaces";
import { getMethodTextColor } from "@/components/MethodIndicator";
import CloseIcon from "@/components/CloseIcon";

type TestOperationResponseProps = {
  isLoading: boolean;
  requestDetails: RequestDetails | undefined;
  onClose: () => void;
};

const FloatingCopyButton = ({ textToCopy }: { textToCopy: string }) => (
  <div className="hidden sm:block absolute right-4 z-40">
    <CopyButton textToCopy={textToCopy} />
  </div>
);

const getRequestIsJson = (requestDetails: RequestDetails | undefined) => {
  if (!requestDetails) {
    // We don't know yet so lets assume its JSON
    return true;
  }

  const requestContentType = requestDetails.headers?.["Content-Type"];
  if (requestContentType) {
    return requestContentType.includes("json");
  }

  // If no content type, look at the body
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

  useEffect(() => {
    setSelectedTab(requestIsJson ? "JSON" : "RAW");
  }, [requestIsJson]);

  let requestUrl = null;
  if (requestDetails?.url) {
    requestUrl = `${requestDetails.url.pathname}${requestDetails.url.search}`;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center translate-y-[250px]">Loading...</div>
    );
  }

  if (!requestDetails) {
    return <p>Click on a request to see its details here</p>;
  }

  const requestBody = requestDetails.body
    ? requestIsJson && selectedTab === "JSON"
      ? JSON.stringify(JSON.parse(requestDetails.body), null, 2)
      : requestDetails.body
    : undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 border-b sticky top-0 bg-slate-950 z-50 border-slate-800 p-4">
        <span
          className={`font-bold ${getMethodTextColor(requestDetails.method)}`}
        >
          {requestDetails.method}
        </span>
        <pre className="flex-grow">{requestUrl}</pre>
        <button onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="flex px-4 py-2 gap-1 text-slate-600">
        Request time: {new Date(requestDetails.timestamp).toLocaleString()},
        size: {requestDetails.size} B
      </div>
      <div>
        <div className="border-b border-slate-800">
          <div className="px-3 sm:px-4">
            <Tabs
              selectedTab={selectedTab}
              tabs={tabs}
              onChange={setSelectedTab}
            />
          </div>
        </div>
      </div>
      <div className="m-4">
        {(selectedTab === "RAW" || selectedTab === "JSON") && (
          <div className="flex overflow-x-auto overflow-y-clip">
            {requestBody ? (
              <code className="whitespace-pre">{requestBody}</code>
            ) : (
              <span className="italic">No request body sent.</span>
            )}
            {requestBody && (
              <div className="relative w-full">
                <FloatingCopyButton textToCopy={requestBody} />
              </div>
            )}
          </div>
        )}
        {selectedTab === "HEADERS" && (
          <table className="text-sm mx-4 border-collapse h-full table-auto">
            <tr>
              <th className="text-left border border-input-border px-2">
                HEADER
              </th>
              <th className="text-left border border-input-border px-2">
                VALUE
              </th>
            </tr>
            {requestDetails.headers &&
              Object.entries(requestDetails.headers).map(([key, value]) => {
                return (
                  <tr className="font-mono" key={key}>
                    <td className="text-left border border-input-border px-2">
                      {key}
                    </td>
                    <td className="text-left whitespace-pre-line break-all border border-input-border px-2">
                      {value}
                    </td>
                  </tr>
                );
              })}
          </table>
        )}
      </div>
    </div>
  );
};

export default BinRequest;
