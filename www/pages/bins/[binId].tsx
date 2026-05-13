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

const POLL_INTERVAL = 5000;

const BookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 256 256"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
  >
    <path d="M224,40H160a40,40,0,0,0-32,16,40,40,0,0,0-32-16H32A16,16,0,0,0,16,56V200a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V56A16,16,0,0,0,224,40ZM96,200H32V56H96a24,24,0,0,1,24,24V208A39.81,39.81,0,0,0,96,200Zm128,0H160a39.81,39.81,0,0,0-24,8V80a24,24,0,0,1,24-24h64Z" />
  </svg>
);

const Row = ({ className, ...props }: HTMLProps<HTMLDivElement>) => (
  <div
    className={cn(
      "grid grid-cols-subgrid group col-span-full border-b border-bg-muted hover:bg-bg-subtle hover:cursor-pointer transition-colors",
      className,
    )}
    {...props}
  />
);

const Column = ({ className, ...props }: HTMLProps<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center py-2.5 px-4 text-[13px] text-fg-secondary",
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

    const result = await Promise.race(promises).catch(() => {
      // silent
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
        <div className="flex w-full flex-col items-center justify-center text-center py-16 gap-6">
          <h1 className="font-display text-[28px] font-semibold">
            No bin with ID &lsquo;{binId}&rsquo; was found
          </h1>
          <p className="text-fg-secondary text-[15px]">
            But you can{" "}
            <Link
              className="text-accent font-semibold hover:underline"
              href="/"
            >
              create a new bin
            </Link>{" "}
            in seconds.
          </p>
          <Image src="/ape.png" alt="" width={420} height={420} />
        </div>
      </Frame>
    );
  }

  if (!requests) return <FullScreenLoading />;

  const docsUrl = `https://zudoku.dev/demo?api-url=${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}`;
  const binUrl = requests.url ?? `${process.env.NEXT_PUBLIC_API_URL}/${binId}`;
  const isOas = (binId ?? "").indexOf("_oas") > 0;

  return (
    <main className="bg-bg-subtle min-h-screen">
      <BinHeader
        isOas={isOas}
        docsUrl={docsUrl}
        binUrl={binUrl}
        onRefresh={() => getRequests()}
        isNewBin={requests.data.length === 0}
      />
      {requests.data.length === 0 ? (
        <div className="flex items-center pt-20 pb-16 text-base flex-col gap-6 px-6">
          <div className="text-center max-w-xl flex flex-col gap-2">
            <h1 className="font-display text-[28px] font-semibold tracking-tight">
              Your bin is live
            </h1>
            <p className="text-fg-secondary text-[15px] leading-relaxed">
              Send a request to the URL below — we&apos;ll track every request
              and show them here.
            </p>
          </div>

          <div className="bg-white border border-line rounded-xl p-4 flex items-center gap-2 max-w-2xl w-full">
            <code className="flex-1 font-mono text-[13px] text-fg truncate">
              {binUrl}
            </code>
            <CopyButton textToCopy={binUrl} />
          </div>

          <button
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white border border-line text-[13px] font-semibold text-fg-secondary hover:bg-bg-muted transition-colors relative"
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

          {isOas && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-fg text-white text-[13px] font-semibold hover:bg-fg-secondary transition-colors"
            >
              <BookIcon />
              Open API docs by Zudoku
            </a>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col md:grid border-t border-line text-sm h-[calc(100vh-52px)] bg-white"
          style={{
            gridTemplateColumns: currentRequestId
              ? `minmax(600px, ${leftColumnPercentage}%) 8px minmax(350px, 1fr)`
              : "1fr",
          }}
        >
          <div className="h-full overflow-auto">
            <div className="grid grid-cols-[repeat(4,max-content)_1fr] grid-flow-col auto-cols-min">
              <Row className="hover:!cursor-auto hover:!bg-bg-subtle bg-bg-subtle border-b !border-line">
                <Column className="!text-[11px] uppercase tracking-wide text-fg-faint font-semibold">
                  Time
                </Column>
                <Column className="!text-[11px] uppercase tracking-wide text-fg-faint font-semibold">
                  Method
                </Column>
                <Column className="!text-[11px] uppercase tracking-wide text-fg-faint font-semibold justify-end">
                  Size
                </Column>
                <Column className="!text-[11px] uppercase tracking-wide text-fg-faint font-semibold justify-end">
                  Ago
                </Column>
                <Column>
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
                        "!bg-accent-light hover:!bg-accent-light",
                    )}
                  >
                    <Column className="font-mono text-[12px] text-fg-muted">
                      {new Date(request.timestamp).toLocaleString()}
                    </Column>
                    <Column>
                      <MethodIndicator method={request.method} />
                    </Column>
                    <Column className="justify-end font-mono text-[12px] text-fg-muted tabular-nums">
                      {request.size} B
                    </Column>
                    <Column className="justify-end text-fg-muted tabular-nums">
                      {timeAgo(Number(new Date(request.timestamp)))}
                    </Column>
                    <Column className="flex justify-end items-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-fg-faint group-hover:text-accent transition-colors">
                        <ArrowIcon />
                      </span>
                    </Column>
                  </Row>
                ))}
            </div>
          </div>
          {currentRequestId && (
            <>
              <div
                className="border-l border-line cursor-col-resize hover:bg-accent/20 transition-colors"
                onMouseDown={handleDividerMouseDown}
              />
              <aside className="h-full overflow-auto bg-white">
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
