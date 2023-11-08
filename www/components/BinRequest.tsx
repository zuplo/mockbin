import CopyButton from "@/components/CopyButton";
import Tabs, { Tab } from "@/components/Tabs";
import { useEffect, useState } from "react";
import { RequestDetails } from "../utils/interfaces";

type TestOperationResponseProps = {
  isLoading: boolean;
  requestDetails: RequestDetails | undefined;
};

const FloatingCopyButton = ({ textToCopy }: { textToCopy: string }) => (
  <div className="hidden sm:block absolute right-4 pt-2 z-50">
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
}: TestOperationResponseProps) => {
  const tabs: Tab[] = [
    {
      name: "RAW",
    },
    {
      name: "JSON",
    },
    {
      name: "HEADERS",
      count: requestDetails?.headers
        ? Object.keys(requestDetails.headers).length
        : undefined,
    },
  ];

  const requestIsJson =
    !isLoading && requestDetails ? getRequestIsJson(requestDetails) : false;
  const [selectedTab, setSelectedTab] = useState("RAW");

  useEffect(() => {
    setSelectedTab(requestIsJson ? "JSON" : "RAW");
  }, [requestDetails]);

  let requestUrl = null;
  if (requestDetails?.url) {
    requestUrl = `${requestDetails.url.pathname}${requestDetails.url.search}`;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!requestDetails) {
    return <p>Click on a request to see its details here</p>;
  }

  return (
    <div className="sticky top-4 flex flex-col h-fit w-full border border-input-border rounded-md pt-4 mb-4">
      <div className="flex flex-col sm:flex-row px-4 pb-3 gap-x-4 text-lg">
        <div className="flex gap-x-1">
          <span>METHOD: </span>
          <span className="font-mono px-1">{requestDetails?.method}</span>
        </div>
        <div className="flex gap-x-1">
          <span>TIME: </span>
          <span className="font-mono">
            {requestDetails?.timestamp ? `${requestDetails.timestamp}` : null}
          </span>
        </div>
        <div className="flex gap-x-1">
          <span>SIZE: </span>
          <span className="font-mono">
            {requestDetails?.size != null ? `${requestDetails.size} B` : null}
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row px-4 pb-3 gap-x-4 text-lg">
        <div className="flex gap-x-1">
          <span>PATH: </span>
          <span className="break-all">{requestUrl}</span>
        </div>
      </div>
      <div>
        <div className="border-b border-input-border">
          <div className="px-3 sm:px-4">
            <Tabs
              selectedTab={selectedTab}
              tabs={tabs}
              onChange={setSelectedTab}
            />
          </div>
        </div>
      </div>
      <div className="flex my-4 h-full">
        {selectedTab === "RAW" ? (
          <div className="flex relative w-full h-full">
            <code className="flex items-center h-full w-full overflow-x-auto break-words px-2 whitespace-pre text-lg pl-5">
              {requestDetails.body ?? "No body was sent in the request"}
            </code>
            {requestDetails.body ? (
              <FloatingCopyButton textToCopy={requestDetails.body} />
            ) : null}
          </div>
        ) : null}
        {selectedTab === "JSON" ? (
          <div className="flex relative w-full h-full">
            {requestDetails.body === null ? (
              <code className="flex items-center h-full w-full overflow-x-auto break-words px-2 whitespace-pre text-lg pl-5">
                No body was sent in the request
              </code>
            ) : (
              <code className="flex items-center h-full w-fit overflow-x-auto break-words px-2 whitespace-pre text-xs">
                {requestIsJson
                  ? // Formats JSON response with 2 spaces
                    JSON.stringify(JSON.parse(requestDetails.body), null, 2)
                  : "Request body is not JSON. Click 'RAW' to see request body"}
              </code>
            )}
            {requestIsJson && requestDetails.body ? (
              <FloatingCopyButton
                textToCopy={JSON.stringify(
                  JSON.parse(requestDetails.body),
                  null,
                  2,
                )}
              />
            ) : null}
          </div>
        ) : null}
        {selectedTab === "HEADERS" ? (
          <table className="text-sm mx-4 border-collapse h-full table-auto">
            <tr>
              <th className="text-left border border-input-border px-2">
                HEADER
              </th>
              <th className="text-left border border-input-border px-2">
                VALUE
              </th>
            </tr>
            {requestDetails.headers
              ? Object.entries(requestDetails.headers).map(([key, value]) => {
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
                })
              : null}
          </table>
        ) : null}
      </div>
    </div>
  );
};

export default BinRequest;
