import CopyButton from "@/components/CopyButton";
import Frame from "@/components/Frame";
import FullScreenLoading from "@/components/FullScreenLoading";
import Header from "@/components/Header";
import { timeAgo } from "@/utils/helpers";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BinRequest from "../../components/BinRequest";

type BinRequest = {
  requestId: string;
  timestamp: string;
  size: number;
};

export type BinRequestData = {
  timestamp: string;
  method: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  url: {
    pathname: string;
    search: string;
  };
};

const Bin = () => {
  const [requests, setRequests] = useState<BinRequest[] | null>(null);
  const [binId, setBinId] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<BinRequestData | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!router) return;

    setBinId(router.query.binId as string);
  }, [router]);

  useEffect(() => {
    if (!binId) return;

    getBinData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binId]);

  const getBinData = async () => {
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
    setRequests(data.data);
    setIsRefreshing(false);
  };

  const getRequestData = async (requestId: string) => {
    setLoading(true);
    setCurrentRequestId(requestId);
    setCurrentRequest(null);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests/${requestId}`,
    );
    const data = await response.json();
    setCurrentRequest(data);
    setLoading(false);
  };

  if (easterEggActive) {
    return (
      <Frame>
        <h1>🐒 Could not find bin</h1>
        <Image
          src="https://cdn.zuplo.com/assets/c7513238-58bd-4b72-ac4d-3d67d0636b3b.png"
          alt="monkey"
          width={500}
          height={500}
        />
      </Frame>
    );
  }

  if (!requests) return <FullScreenLoading />;

  const binUrl = `${process.env.NEXT_PUBLIC_API_URL}/${binId}`;
  const activeRequest = requests.find(
    (request) => currentRequestId === request.requestId,
  );
  return (
    <Frame>
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
            getBinData();
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
                stroke-linecap="round"
                stroke-linejoin="round"
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
          <ul>
            {requests.map((request, i) => {
              const isActive = currentRequestId === request.requestId;
              return (
                <li
                  key={request.requestId}
                  onClick={() => {
                    getRequestData(request.requestId);
                  }}
                  className={`flex w-full justify-between hover:cursor-pointer px-2 py-1 border border-white ${
                    isActive ? "bg-[#FF00BD]" : "hover:text-[#FF00BD]"
                  } ${i === 0 ? "rounded-t-md" : ""} ${
                    i === requests.length - 1 ? "rounded-b-md" : ""
                  }`}
                >
                  <div>{timeAgo(Number(new Date(request.timestamp)))}</div>
                </li>
              );
            })}
            {requests.length === 0 ? "No requests yet" : null}
          </ul>
        </div>
        <div className="col-span-4">
          <BinRequest
            isLoading={loading}
            requestData={
              currentRequest && activeRequest
                ? {
                    ...currentRequest,
                    size: activeRequest.size,
                    timestamp: activeRequest.timestamp,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </Frame>
  );
};

export default Bin;
