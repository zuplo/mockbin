import CopyButton from "@/components/CopyButton";
import Frame from "@/components/Frame";
import FullScreenLoading from "@/components/FullScreenLoading";
import { timeAgo } from "@/utils/helpers";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";
import { useEffect, useMemo, useState, type HTMLProps } from "react";
import BinRequest from "@/components/BinRequest";
import { RequestDetails, RequestListResponse } from "@/utils/interfaces";
import useInterval from "@/hooks/useInterval";
import MethodIndicator from "@/components/MethodIndicator";
import BinHeader from "@/components/BinHeader";
import ArrowIcon from "@/components/ArrowIcon";
import ShortcutsOverlay from "@/components/ShortcutsOverlay";
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
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target.isContentEditable
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (currentRequestId) {
          setCurrentRequest(undefined);
          setCurrentRequestId(undefined);
        }
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShortcutsOpen((open) => !open);
      } else if (e.key === "r") {
        e.preventDefault();
        getRequests();
      } else if (e.key === "c") {
        e.preventDefault();
        router.push("/");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRequestId, shortcutsOpen]);

  const availableMethods = useMemo(() => {
    if (!requests) return [];
    const set = new Set<string>();
    requests.data.forEach((r) => set.add(r.method.toUpperCase()));
    return Array.from(set).sort();
  }, [requests]);

  const visibleRequests = useMemo(() => {
    if (!requests) return [];
    const sorted = [...requests.data].sort(
      (a, b) =>
        Number(new Date(b.timestamp)) - Number(new Date(a.timestamp)),
    );
    if (!methodFilter) return sorted;
    return sorted.filter((r) => r.method.toUpperCase() === methodFilter);
  }, [requests, methodFilter]);

  if (easterEggActive) {
    return (
      <Frame>
        <div className="max-w-xl mx-auto py-20 px-6">
          <div className="bg-white border border-dashed border-line rounded-2xl p-10 flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-bg-muted flex items-center justify-center text-fg-muted">
              <svg
                width="28"
                height="28"
                viewBox="0 0 256 256"
                fill="currentColor"
                fillRule="evenodd"
                aria-hidden="true"
              >
                <path d="M232.4,114.49,210,143.91l-21.78,28.59a14.42,14.42,0,0,1-9.32,5.45,15.83,15.83,0,0,1-2.43.19A14.46,14.46,0,0,1,167.07,175l-14.39-14.39L113,201.27a16,16,0,0,1-22.62,0l-50.66-50.66a16,16,0,0,1,0-22.61L80.74,87.06a16,16,0,0,1,22.55-.06l11,11,15.46-15.45a16,16,0,0,1,22.6,0l13.85,13.84,29.42-22.41a16,16,0,0,1,21.16,1.43l16.07,16.06A16,16,0,0,1,232.4,114.49Zm-11.32-12.21L205,86.21a8,8,0,0,0-5.69-2.34,7.93,7.93,0,0,0-4.86,1.65L189,90.06l-32.66,32.66a8,8,0,0,1-11.32-11.32l25-25-7.69-7.69a3.86,3.86,0,0,0-3.27-1.12,4,4,0,0,0-3,1.18L98.34,148.49a4,4,0,0,0,0,5.66l50.66,50.66a4,4,0,0,0,5.66,0L196,165.43,180.55,150a8,8,0,0,1,11.32-11.32L220.92,167l1.41-1.7A4,4,0,0,0,221.08,102.28ZM134.34,196.69a8,8,0,1,0,11.32-11.31l-32-32a8,8,0,0,0-11.32,11.32Z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-[22px] font-semibold tracking-tight">
                Bin not found
              </h1>
              <p className="text-fg-muted text-[13px]">
                <code className="font-mono text-fg">{String(binId)}</code>{" "}
                doesn&apos;t match any bin. Bins are stored on your device —
                try a different browser or create a new one.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover shadow-accent transition-colors"
            >
              Create a new bin
            </Link>
          </div>
        </div>
      </Frame>
    );
  }

  if (!requests) return <FullScreenLoading />;

  const docsUrl = `https://zudoku.dev/demo?api-url=${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}`;
  const binUrl = requests.url ?? `${process.env.NEXT_PUBLIC_API_URL}/${binId}`;
  const isOas =
    (binId ?? "").endsWith("-oas") || (binId ?? "").endsWith("_oas");

  return (
    <main className="bg-bg-subtle min-h-screen">
      <BinHeader
        isOas={isOas}
        docsUrl={docsUrl}
        binUrl={binUrl}
        onRefresh={() => getRequests()}
        onShowShortcuts={() => setShortcutsOpen(true)}
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
            {availableMethods.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-line bg-bg-subtle">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-faint mr-1">
                  Filter
                </span>
                <button
                  type="button"
                  onClick={() => setMethodFilter(null)}
                  className={cn(
                    "inline-flex items-center h-7 px-2.5 rounded-lg border text-[12px] font-semibold transition-colors",
                    methodFilter === null
                      ? "bg-fg text-white border-fg"
                      : "bg-white text-fg-secondary border-line hover:bg-bg-muted",
                  )}
                >
                  All
                  <span
                    className={cn(
                      "ml-1.5 text-[11px] tabular-nums",
                      methodFilter === null
                        ? "text-white/70"
                        : "text-fg-faint",
                    )}
                  >
                    {requests.data.length}
                  </span>
                </button>
                {availableMethods.map((method) => {
                  const active = methodFilter === method;
                  const count = requests.data.filter(
                    (r) => r.method.toUpperCase() === method,
                  ).length;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() =>
                        setMethodFilter(active ? null : method)
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 h-7 pl-1.5 pr-2 rounded-lg border transition-colors",
                        active
                          ? "border-fg shadow-sm"
                          : "border-line bg-white hover:bg-bg-muted",
                      )}
                      aria-pressed={active}
                    >
                      <MethodIndicator method={method} />
                      <span className="text-[11px] tabular-nums text-fg-muted">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
              {visibleRequests.length === 0 ? (
                <div className="col-span-full px-4 py-12 text-center text-[13px] text-fg-muted">
                  No {methodFilter} requests in this bin.
                </div>
              ) : (
                visibleRequests.map((request) => (
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMethodFilter((prev) =>
                            prev === request.method.toUpperCase()
                              ? null
                              : request.method.toUpperCase(),
                          );
                        }}
                        aria-label={`Filter by ${request.method}`}
                        className="inline-flex"
                      >
                        <MethodIndicator method={request.method} />
                      </button>
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
                ))
              )}
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
      <ShortcutsOverlay
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        shortcuts={[
          { keys: ["R"], label: "Refresh request list" },
          { keys: ["C"], label: "Create a new bin" },
          { keys: ["Esc"], label: "Close request detail" },
          { keys: ["?"], label: "Show / hide shortcuts" },
        ]}
      />
    </main>
  );
};

export default Bin;
