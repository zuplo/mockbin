import CopyButton from "@/components/CopyButton";
import Frame from "@/components/Frame";
import FullScreenLoading from "@/components/FullScreenLoading";
import { timeAgo } from "@/utils/helpers";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BinRequest from "../../components/BinRequest";
import { RequestDetails, RequestListResponse } from "../../utils/interfaces";
import useInterval from "@/hooks/useInterval";

const POLL_INTERVAL = 5000;

const Bin = () => {
  const router = useRouter();
  const { binId } = router.query;
  const [requests, setRequests] = useState<RequestListResponse | undefined>(
    undefined,
  );
  const [currentRequestId, setCurrentRequestId] = useState<
    string | undefined
  >();
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

  useInterval(async () => {
    const { signal, abort } = new AbortController();

    const promises = [
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests`, {
        signal,
      }),
      new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL)),
    ];

    // To prevent requests from stacking up if the request takes longer than the interval to complete,
    // the request is cancelled if it's still running
    const result = await Promise.race(promises);

    if (result instanceof Response && result.ok) {
      const data = (await result.json()) as RequestListResponse;
      setRequests(data);
    } else {
      abort();
    }

    return () => abort();
  }, POLL_INTERVAL);

  const getRequestData = async (requestId: string) => {
    setIsLoading(true);
    setCurrentRequestId(requestId);
    setCurrentRequest(undefined);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests/${requestId}`,
    );
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

  const binUrl = requests.url ?? `${process.env.NEXT_PUBLIC_API_URL}/${binId}`;
  return (
    <Frame>
      <div className="text-md mb-8 mt-2 -ml-1">
        <Link
          className="text-[#FF00BD] hover:text-[#FF90E3] hover:bg-pink-500 hover:bg-opacity-50 rounded p-1"
          href="/"
        >
          Home
        </Link>{" "}
        &rsaquo; <span className="font-mono">{binId}</span>
      </div>
      <div>
        Your bin is live at <br />{" "}
        <a
          className="text-[#FF00BD] hover:text-[#FF90E3] break-all font-mono text-base hover:bg-pink-500 hover:bg-opacity-50 rounded p-1 -ml-1"
          target="_blank"
          href={binUrl}
        >
          {binUrl}
        </a>
        <span className="align-middle">
          <CopyButton textToCopy={binUrl} />
        </span>
      </div>
      <div className="flex justify-between items-end mt-8 sm:mt-20 mb-5">
        <h1 className="font-bold text-3xl">Requests</h1>
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
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          Refresh
        </button>
      </div>
      {requests.data.length === 0 ? (
        <div>
          No requests made to your bin. Click Refresh once you&apos;ve made
          some.
        </div>
      ) : (
        <div className="grid grid-cols-10">
          <div className="flex flex-col col-span-3 mr-4">
            <ul className="border border-gray-700 rounded-md">
              {requests.data
                .sort((a, b) => {
                  return (
                    Number(new Date(b.timestamp)) -
                    Number(new Date(a.timestamp))
                  );
                })
                .map((request, i) => {
                  const isActive = currentRequestId === request.id;
                  return (
                    <li
                      key={request.id}
                      onClick={() => {
                        getRequestData(request.id);
                      }}
                      className={`flex justify-between hover:cursor-pointer px-2 py-1 border-gray-700 transition-all ${
                        isActive
                          ? "bg-[#FF00BD] text-white"
                          : "hover:text-[#FF00BD]"
                      } ${i === requests.data.length - 1 ? "rounded-b-md" : ""}
                      ${i === 0 ? "rounded-t-md" : ""}
                      `}
                    >
                      <div className="font-mono w-full justify-between sm:flex">
                        <span className="font-bold">
                          {request.method.toUpperCase()}
                        </span>{" "}
                        <span className="opacity-80">
                          {timeAgo(Number(new Date(request.timestamp)))}
                        </span>
                      </div>
                    </li>
                  );
                })}
              {requests.data.length === 0 ? "No requests yet" : null}
            </ul>
          </div>
          <div className="col-span-7">
            <BinRequest
              isLoading={isLoading || isRefreshing}
              requestDetails={currentRequest}
            />
          </div>
        </div>
      )}
    </Frame>
  );
};

export default Bin;
