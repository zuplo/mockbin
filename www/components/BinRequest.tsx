import CopyButton from "@/components/CopyButton";
import Tabs, { Tab } from "@/components/Tabs";
import { useEffect, useState } from "react";
import { BinRequestData } from "../utils/interfaces";

type TestOperationResponseProps = {
  isLoading: boolean;
  hasRequests: boolean;
  requestData: BinRequestData | undefined;
  body: string | undefined;
};

const FloatingCopyButton = ({ textToCopy }: { textToCopy: string }) => (
  <div className="hidden sm:block absolute right-12 pt-2 z-50">
    <CopyButton textToCopy={textToCopy} />
  </div>
);

const getRequestIsJson = (
  body: string | undefined,
  requestData: BinRequestData | undefined,
) => {
  if (!requestData) {
    // We don't know yet so lets assume its JSON
    return true;
  }

  const requestContentType = requestData.headers["Content-Type"];
  if (requestContentType) {
    return requestContentType.includes("json");
  }

  // If no content type, look at the body
  if (!body) {
    return false;
  }

  try {
    JSON.parse(body);
    return true;
  } catch (e) {
    return false;
  }
};

const BinRequest = ({
  isLoading,
  requestData,
  hasRequests,
  body,
}: TestOperationResponseProps) => {
  const tabs: Tab[] = [
    {
      name: "JSON",
    },
    {
      name: "RAW",
    },
    {
      name: "HEADERS",
      count: requestData?.headers
        ? Object.keys(requestData.headers).length
        : undefined,
    },
  ];

  const requestIsJson = getRequestIsJson(body, requestData);
  useEffect(() => {
    // Reset the tab when the request type changes
    setSelectedTab(requestIsJson ? "JSON" : "RAW");
  }, [requestIsJson]);

  const [selectedTab, setSelectedTab] = useState(
    requestIsJson ? "JSON" : "RAW",
  );

  const noResponseDataPlaceholder = isLoading ? (
    <div className="px-4 w-full h-full flex items-center justify-center text-xs">
      Loading...
    </div>
  ) : (
    <div className="px-4 py-4 sm:py-0 w-full h-full flex items-center justify-center">
      <span>
        {hasRequests
          ? "Click on a request to see its details here"
          : "No requests made to your bin. Click Refresh once you've made some."}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full border border-input-border rounded-md pt-4 mb-4">
      <div className="flex flex-col sm:flex-row text-xs px-4 pb-3 gap-x-4">
        <div className="flex gap-x-1">
          <span>METHOD: </span>
          <span>{requestData?.method}</span>
        </div>
        <div className="flex gap-x-1">
          <span>TIME: </span>
          <span className="">
            {requestData?.timestamp ? `${requestData.timestamp}` : null}
          </span>
        </div>
        <div className="flex gap-x-1">
          <span>SIZE: </span>
          <span>{requestData?.size ? `${requestData.size} B` : null}</span>
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
        {selectedTab === "JSON" ? (
          requestData ? (
            <div className="flex w-full h-full">
              <code className="flex items-center h-full w-fit overflow-x-auto break-words px-2 whitespace-pre text-xs">
                {body
                  ? body && requestIsJson
                    ? // Formats JSON response with 2 spaces
                      JSON.stringify(JSON.parse(body), null, 2)
                    : "Request body is not JSON. Click 'RAW' to see request body"
                  : "Click 'Test' to see response"}
              </code>
              {requestIsJson && body ? (
                <FloatingCopyButton
                  textToCopy={JSON.stringify(JSON.parse(body), null, 2)}
                />
              ) : null}
            </div>
          ) : (
            noResponseDataPlaceholder
          )
        ) : null}
        {selectedTab === "RAW" ? (
          requestData ? (
            <div className="flex w-full h-full">
              <code className="flex items-center h-full w-full overflow-x-auto break-words px-2 whitespace-pre text-xs">
                {requestData && body
                  ? body === "" ?? "No body was sent in the request"
                  : "Click 'Test' to see response"}
              </code>
              {body ? <FloatingCopyButton textToCopy={body ?? ""} /> : null}
            </div>
          ) : (
            noResponseDataPlaceholder
          )
        ) : null}
        {selectedTab === "HEADERS" ? (
          requestData ? (
            <table className="text-sm mx-4 border-collapse  h-full table-auto">
              <tr>
                <th className="text-left border border-input-border px-2">
                  HEADER
                </th>
                <th className="text-left border border-input-border px-2">
                  VALUE
                </th>
              </tr>
              {requestData.headers
                ? Object.entries(requestData.headers).map(([key, value]) => {
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
          ) : (
            noResponseDataPlaceholder
          )
        ) : null}
      </div>
    </div>
  );
};

export default BinRequest;
