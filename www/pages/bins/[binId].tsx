import CopyButton from "@/components/CopyButton";
import Frame from "@/components/Frame";
import FullScreenLoading from "@/components/FullScreenLoading";
import { timeAgo } from "@/utils/helpers";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import { useEffect, useState, type HTMLProps } from "react";
import BinRequest from "@/components/BinRequest";
import { RequestDetails, RequestListResponse } from "@/utils/interfaces";
import useInterval from "@/hooks/useInterval";
import MethodIndicator from "@/components/MethodIndicator";
import BinHeader from "@/components/BinHeader";
import ArrowIcon from "@/components/ArrowIcon";
import { useBinColumnsResize } from "@/utils/useBinColumnsResize";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import DocsButton from "@/components/DocsButton";

const POLL_INTERVAL = 5000;

const Row = ({ className, ...props }: HTMLProps<HTMLDivElement>) => (
  <div
    className={cn(
      "grid grid-cols-subgrid group col-span-full border-b border-slate-800 hover:bg-slate-800/50 hover:cursor-pointer",
      className,
    )}
    {...props}
  />
);

const Column = ({ className, ...props }: HTMLProps<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center border-r last:border-r-0 border-slate-800 py-2 px-4",
      className,
    )}
    {...props}
  />
);

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
    const controller = new AbortController();

    const promises = [
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests`, {
        signal: controller.signal,
      }),
      new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL)),
    ];

    // To prevent requests from stacking up if the request takes longer than the interval to complete,
    // the request is cancelled if it's still running
    const result = await Promise.race(promises).catch(() => {
      // Fail silently in case of a network error
    });

    if (result instanceof Response && result.ok) {
      const data = (await result.json()) as RequestListResponse;
      setRequests(data);
    } else {
      controller.abort();
    }

    return () => controller.abort();
  }, POLL_INTERVAL);

  const getRequestData = async (requestId: string) => {
    setIsLoading(true);
    setCurrentRequestId(requestId);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests/${requestId}`,
    );
    const data = await response.json();
    setCurrentRequest(data);
    setIsLoading(false);
  };

  const { handleDividerMouseDown, leftColumnPercentage } = useBinColumnsResize(
    Boolean(currentRequestId),
  );
  const [hasCopied, copy] = useCopyToClipboard();

  if (easterEggActive) {
    return (
      <Frame>
        <div className="flex w-full h-full flex-col items-center justify-center">
          <h1 className="text-3xl mb-2 text-center">
            No bin with ID &lsquo;{binId}&rsquo; was found
          </h1>
          <h2 className="text-3xl mb-8 text-center">
            But you can{" "}
            <Link className="text-zuplo-primary hover:text-[#C0008F]" href="/">
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

  const docsUrl = `https://zudoku.dev/demo?api-url=${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}`;
  const binUrl = requests.url ?? `${process.env.NEXT_PUBLIC_API_URL}/${binId}`;
  const isOas = (binId ?? "").indexOf("_oas") > 0;

  return (
    <main>
      <BinHeader
        docsUrl={docsUrl}
        binUrl={binUrl}
        onRefresh={() => getRequests()}
        isNewBin={requests.data.length === 0}
      />
      {requests.data.length === 0 ? (
        <div className="flex items-center translate-y-[35vh] text-lg flex-col gap-6">
          No requests made to your Bin yet. Send a request to see it here.
          <div className="flex flex-col gap-2">
            <code className="text-md bg-slate-800 rounded border border-slate-700 p-4 py-2 flex items-center gap-2">
              <span className="text-zuplo-primary">{binUrl}</span>
              <div className="translate-x-1 translate-y-0.5">
                <CopyButton textToCopy={binUrl} />
              </div>
            </code>
            <button
              className="self-end bg-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-800 relative"
              onClick={() =>
                copy(
                  `curl -X POST -H "Content-Type: application/json" -d '{"message": "Hello World"}' ${binUrl}`,
                )
              }
            >
              <span className={cn(hasCopied && "invisible")}>Copy cURL</span>
              <span
                className={cn(
                  "absolute inset-0 grid place-items-center",
                  !hasCopied && "invisible",
                )}
              >
                Copied!
              </span>
            </button>
            {isOas && <DocsButton docsUrl={docsUrl} />}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col md:grid border-t border-slate-800 text-sm h-[calc(100vh-60px)]"
          style={{
            gridTemplateColumns: currentRequestId
              ? `minmax(600px, ${leftColumnPercentage}%) 8px minmax(350px, 1fr)`
              : "1fr",
          }}
        >
          <div className="h-full overflow-auto">
            <div className="grid grid-cols-[repeat(4,max-content)_1fr] grid-flow-col auto-cols-min bg-slate-900">
              <Row className="hover:!cursor-auto">
                <Column className="bg-slate-950/50 font-bold">Time</Column>
                <Column className="bg-slate-950/50 font-bold">Method</Column>
                <Column className="bg-slate-950/50 font-bold justify-end">
                  Size
                </Column>
                <Column className="bg-slate-950/50 font-bold justify-end">
                  Ago
                </Column>
                <Column className="bg-slate-950/50">
                  <span className="sr-only">Actions</span>
                </Column>
              </Row>
              {requests.data
                .sort((a, b) => {
                  return (
                    Number(new Date(b.timestamp)) -
                    Number(new Date(a.timestamp))
                  );
                })
                .map((request) => (
                  <Row
                    key={request.id}
                    onClick={() => {
                      getRequestData(request.id);
                    }}
                    className={cn(
                      "relative",
                      currentRequestId === request.id &&
                        "after:rounded after:shadow-[inset_0_0_0_2px_theme(colors.zuplo.primary)] after:opacity-70 after:content-[''] after:absolute after:inset-0",
                    )}
                  >
                    <Column>
                      {new Date(request.timestamp).toLocaleString()}
                    </Column>
                    <Column>
                      <MethodIndicator method={request.method} />
                    </Column>
                    <Column className="justify-end">
                      {request.size} bytes
                    </Column>
                    <Column className="justify-end">
                      {timeAgo(Number(new Date(request.timestamp)))}
                    </Column>
                    <Column className="flex justify-end items-center text-white">
                      <button className="group-hover:bg-slate-700 p-1 rounded">
                        <ArrowIcon />
                      </button>
                    </Column>
                  </Row>
                ))}
            </div>
          </div>
          {currentRequestId && (
            <>
              <div
                className="border-l border-slate-800 cursor-col-resize"
                onMouseDown={handleDividerMouseDown}
              />
              <aside className="h-full overflow-auto">
                <BinRequest
                  isLoading={isLoading || isRefreshing}
                  requestDetails={currentRequest}
                  onClose={() => {
                    setCurrentRequest(undefined);
                    setCurrentRequestId(undefined);
                  }}
                />
              </aside>
            </>
          )}
        </div>
      )}
    </main>
  );
};

export default Bin;
