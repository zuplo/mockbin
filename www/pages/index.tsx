import Frame from "@/components/Frame";
import { timeAgo } from "@/utils/helpers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import HeadersList, { Header } from "../components/HeadersList";
import Button from "@/components/Button";
import Input from "@/components/Input";
import InfoIcon from "@/components/InfoIcon";
import FileInput from "@/components/FileInput";

const RECENT_BIN_KEY = "LAST_BINS";
type RecentBin = {
  id: string;
  createdTime: string;
  url: string;
};

// prettier-ignore
const STATUS_CODE_MAP = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 300: "Multiple Choices",
  301: "Moved Permanently", 302: "Found", 304: "Not Modified", 400: "Bad Request",
  401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed",
  418: "I'm a teapot", 429: "Too Many Requests", 500: "Internal Server Error",
  502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout",
} as const;

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`bg-white border border-line rounded-xl p-6 ${className ?? ""}`}
  >
    {children}
  </section>
);

const Index = () => {
  const [status, setStatus] = useState("200");
  const [statusText, setStatusText] = useState("OK");
  const [headers, setHeaders] = useState<Header[]>([
    {
      key: "Content-Type",
      value: "application/json",
      hasError: false,
      id: v4(),
    },
    {
      key: "",
      value: "",
      hasError: true,
      id: v4(),
    },
  ]);
  const [responseBody, setResponseBody] = useState(
    `{\n  "message": "Hello World"\n}`,
  );
  const [recentBins, setRecentBins] = useState<RecentBin[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const binsRaw =
      typeof window !== "undefined"
        ? localStorage.getItem(RECENT_BIN_KEY)
        : null;
    const recentBins: RecentBin[] = binsRaw ? JSON.parse(binsRaw) : [];
    setRecentBins(recentBins);
  }, []);

  useEffect(() => {
    const intStatus = Number(status);
    if (!(intStatus in STATUS_CODE_MAP)) return;

    setStatusText(STATUS_CODE_MAP[intStatus as keyof typeof STATUS_CODE_MAP]);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const responseHeaders = headers.reduce((cleanHeaders, header) => {
      if (!header.key || header.hasError) {
        return cleanHeaders;
      }
      return { ...cleanHeaders, [header.key]: header.value };
    }, {});
    const requestBody = {
      response: {
        status: parseInt(status),
        statusText,
        headers: responseHeaders,
        body: responseBody,
      },
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/bins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.status !== 201) {
        alert(`Error ${response.status}\n\n ${await response.text()}`);
        setIsCreating(false);
        return;
      }
      const result: { id: string; url: string } = await response.json();
      setIsCreating(false);
      router.push(`/bins/${result.id}`);
      updateRecentBins(result, recentBins);
    } catch (err: any) {
      alert(`Error - ${err.message}`);
      setIsCreating(false);
      return;
    }
  };

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleOpenApiSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsCreating(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/openapi/bins`,
        {
          method: "POST",
          body: formData,
        },
      );

      setIsCreating(false);

      if (response.status !== 201) {
        try {
          const problem = await response.json();
          if (!problem.detail) {
            throw new Error("Not recognized format");
          }
          alert(problem.detail);
          return;
        } catch (err) {
          // fall through
        }

        alert(`Error ${response.status}\n\n ${await response.text()}`);

        return;
      }

      const result: { id: string; url: string } = await response.json();
      router.push(`/bins/${result.id}`);
      updateRecentBins(result, recentBins);
    } catch (error: any) {
      alert(`Error - ${error.message}`);
      setIsCreating(false);
    }

    setIsCreating(false);
  };

  return (
    <Frame>
      <div className="flex flex-col gap-3 max-w-3xl pt-4 pb-8">
        <span className="inline-flex items-center w-fit gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent-light border border-accent/20 rounded-tag px-2 py-0.5">
          Mockbin
        </span>
        <h1 className="font-display text-[28px] leading-tight font-semibold tracking-tight">
          Mock an API endpoint in seconds
        </h1>
        <p className="text-fg-secondary text-[15px] leading-relaxed">
          Mockbin is an open-source, fully-free tool that lets you spin up a
          fixed-response API endpoint and inspect requests sent to it. Upload
          an OpenAPI document and we&apos;ll generate a mock from your schemas
          and examples.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <form
              className="flex flex-col gap-5 items-stretch"
              onSubmit={handleOpenApiSubmit}
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-[22px] font-semibold tracking-tight">
                  Create an OpenAPI bin
                </h2>
                <p className="text-fg-muted text-[13px]">
                  Upload an OpenAPI v3.1 document and we&apos;ll use its
                  schemas and examples to mock it.
                </p>
              </div>
              <FileInput onChange={handleFileChange} />
              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  disabled={isCreating}
                  type="submit"
                  variant="primary"
                  className="mt-4"
                >
                  {isCreating ? "Creating…" : "Create OpenAPI bin"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <form
              className="flex flex-col gap-5 items-stretch"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-[22px] font-semibold tracking-tight">
                  Create a new bin
                </h2>
                <p className="text-fg-muted text-[13px]">
                  Specify the response below and we&apos;ll create an endpoint
                  in a jiffy.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[88px_1fr] gap-x-4 gap-y-4 items-start">
                <label
                  className="text-[13px] font-semibold text-fg-secondary sm:pt-2"
                  htmlFor="status-code"
                >
                  Status
                </label>
                <div className="grid grid-cols-[1fr_140px] gap-2">
                  <Input
                    id="status-code"
                    type="text"
                    placeholder="Status code"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Status text"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                  />
                </div>

                <label className="text-[13px] font-semibold text-fg-secondary sm:pt-2">
                  Headers
                </label>
                <HeadersList headers={headers} onChange={setHeaders} />

                <label
                  className="text-[13px] font-semibold text-fg-secondary sm:pt-2"
                  htmlFor="response-body"
                >
                  Body
                </label>
                <Input
                  id="response-body"
                  textarea
                  placeholder="{}"
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  className="h-36 resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  disabled={isCreating}
                  type="submit"
                  variant="dark"
                  className="mt-4"
                >
                  {isCreating ? "Creating…" : "Create bin"}
                </Button>
              </div>
            </form>
          </Card>

          <div className="flex items-center gap-2 text-[12px] text-fg-muted">
            <InfoIcon />
            Mockbin is free of sign-ups. Bin IDs are only stored in your
            browser storage.
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 self-start">
          <Card className="!p-0 overflow-hidden">
            <header className="px-5 py-4 border-b border-line">
              <h2 className="font-display text-[16px] font-semibold">
                Recent bins
              </h2>
              <p className="text-[12px] text-fg-muted mt-0.5">
                Stored locally in your browser
              </p>
            </header>
            {recentBins.length > 0 ? (
              <ul className="divide-y divide-bg-muted">
                {recentBins.map((bin) => (
                  <li key={bin.id} className="group">
                    <Link
                      href={`/bins/${bin.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-bg-subtle transition-colors"
                    >
                      <span className="font-mono text-[13px] text-fg truncate">
                        {bin.id}
                      </span>
                      <span
                        className="text-[12px] text-fg-muted flex-shrink-0 group-hover:text-fg-secondary"
                        title={new Date(bin.createdTime).toLocaleString()}
                      >
                        {timeAgo(Number(new Date(bin.createdTime)))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-[13px] text-fg-muted italic">
                  No bins yet. Recent ones will show up here.
                </p>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </Frame>
  );
};

export default Index;

function updateRecentBins(
  result: { id: string; url: string },
  recentBins: RecentBin[],
) {
  const createdTime = new Date().toISOString();
  const recentBinEntry = {
    id: result.id,
    createdTime,
    url: result.url,
  } satisfies RecentBin;
  const newRecentBins = [recentBinEntry, ...recentBins];
  if (typeof window !== "undefined") {
    localStorage.setItem(RECENT_BIN_KEY, JSON.stringify(newRecentBins));
  }
}
