import CopyButton from "@/components/CopyButton";
import Frame from "@/components/Frame";
import FullScreenLoading from "@/components/FullScreenLoading";
import { timeAgo } from "@/utils/helpers";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import BinRequest from "../../components/BinRequest";
import { RequestDetails, RequestListResponse } from "../../utils/interfaces";

const Bin = () => {
  const router = useRouter();
  const { binId, requestId } = router.query;

  const [requests, setRequests] = useState<RequestListResponse | undefined>(
    undefined,
  );
  const [currentRequest, setCurrentRequest] = useState<
    RequestDetails | undefined
  >();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);

  useEffect(() => {
    if (!binId) return;

    getRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binId]);

  const getRequests = async () => {
    setIsRefreshing(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests`,
    );

    if (!response.ok) {
      setEasterEggActive(true);
      setIsRefreshing(false);
      return;
    }

    const data = await response.json();
    setRequests(data);
    setIsRefreshing(false);
  };

  const getRequestData = async (requestId: string) => {
    setIsLoading(true);
    setCurrentRequest(undefined);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests/${requestId}`,
    );
    posthog.capture("bin_request_viewed", {
      binId,
      requestId,
    });
    const data = await response.json();
    setCurrentRequest(data);
    setIsLoading(false);
  };

  if (easterEggActive) {
    return (
      <Frame>
        <div className="flex w-full h-full flex-col items-center justify-center">
          <h1 className="text-3xl mb-2 text-center">
            No bin with ID &lsquo;{binId}&rsquo; was found
          </h1>
          <h2 className="text-3xl mb-8 text-center">
            But you can{" "}
            <Link className="text-[#FF00BD] hover:text-[#C0008F]" href="/">
              create a new bin
            </Link>{" "}
            in seconds
          </h2>
          <Image src="/ape.png" alt="ape" width={500} height={500} />
        </div>
      </Frame>
    );
  }

  if (!requests) return <FullScreenLoading />;

  // Get the real bin url from the API, the one with NEXT_PUBLIC_API_URL is legacy
  const binUrl = requests.url ?? `${process.env.NEXT_PUBLIC_API_URL}/${binId}`;
  return (
    <Frame>
      <div className="text-xs mb-8 mt-2">
        <Link className="text-[#FF00BD] hover:text-[#C0008F]" href="/">
          Home
        </Link>{" "}
        &rsaquo; {binId}
      </div>
      <div className="text-xl font-bold">
        Your bin is live at{" "}
        <a
          className="text-[#FF00BD] hover:text-[#C0008F] break-all"
          target="_blank"
          href={binUrl}
        >
          {binUrl}
        </a>
        <span className="align-middle">
          <CopyButton textToCopy={binUrl} />
        </span>
      </div>
      <div className="flex justify-between my-4">
        <h1 className="text-xl font-bold">Requests</h1>
        <button
          className="flex items-center justify-center border border-white rounded-md hover:border-[#FF00BD] hover:text-[#FF00BD] px-2 py-1"
          onClick={() => {
            getRequests();
          }}
        >
          <div className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}>
            <svg
              className="h-4 w-4 scale-x-[-1]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-6">
        <div className="flex flex-col col-span-2 mr-4">
          <ul className="border border-white rounded-md">
            {requests.data
              .sort((a, b) => {
                return (
                  Number(new Date(b.timestamp)) - Number(new Date(a.timestamp))
                );
              })
              .map((request, i) => {
                const isActive = requestId === request.id;
                return (
                  <li
                    key={request.id}
                    onClick={() => {
                      getRequestData(request.id);
                    }}
                    className={`flex w-full justify-between hover:cursor-pointer px-2 py-1 border-white ${
                      isActive ? "bg-[#FF00BD]" : "hover:text-[#FF00BD]"
                    } ${i === requests.data.length - 1 ? "" : "border-b"}`}
                  >
                    <div>
                      {request.method.toUpperCase()} &middot;{" "}
                      {timeAgo(Number(new Date(request.timestamp)))}
                    </div>
                  </li>
                );
              })}
            {requests.data.length === 0 ? "No requests yet" : null}
          </ul>
        </div>
        <div className="col-span-4">
          <BinRequest
            isLoading={isLoading || isRefreshing}
            hasRequests={requests.data.length > 0}
            requestDetails={currentRequest}
          />
        </div>
      </div>
    </Frame>
  );
};

export default Bin;
