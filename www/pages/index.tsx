import Frame from "@/components/Frame";
import { timeAgo } from "@/utils/helpers";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 } from "uuid";
import HeadersList, { Header } from "../components/HeadersList";
import cn from "classnames";
import Button from "@/components/Button";
import Input from "@/components/Input";
import InfoIcon from "@/components/InfoIcon";

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
    // Perform localStorage action
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
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
        "https://mockbin-main-d0c1f43.d2.zuplo.dev/v1/openapi/bins",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.status !== 201) {
        alert(`Error ${response.status}\n\n ${await response.text()}`);
        return;
      }

      const result: { id: string; url: string } = await response.json();
      setIsCreating(false);
      router.push(`/bins/${result.id}`);
      updateRecentBins(result, recentBins);
    } catch (error) {}

    setIsCreating(false);
  };

  return (
    <Frame>
      <div className="my-8 flex flex-col gap-4">
        <h1 className="text-3xl">
          Welcome to <span className="font-bold">Mockbin by Zuplo</span>
        </h1>
        <p className="text-gray-300">
          This is an open-source and fully-free tool that allows you to quickly
          mock an API endpoint, configure a fixed response and track requests to
          your endpoint.
        </p>
      </div>
      <div
        className={cn(
          "flex border border-gray-700 rounded relative",
          "flex-col lg:flex-row",
        )}
      >
        <div>
          <form
            className={cn(
              "py-4 px-6 text-sm flex flex-col gap-6 items-start rounded-r-none",
              "lg:w-[60%]",
            )}
            onSubmit={handleSubmit}
          >
            <h2 className="text-3xl font-bold w-full">Create a new Bin</h2>
            <p>
              Just specify the details of the response below and we’ll create
              you a new API endpoint in a jiffy.
            </p>
            <div className="w-full gap-2 grid grid-cols-[repeat(5,1fr)] sm:grid-cols-[75px_repeat(3,1fr)_minmax(1fr,100px)]">
              <label className="mt-1 font-bold">Status</label>
              <Input
                type="text"
                placeholder="Status Code"
                value={status}
                className="col-span-2 sm:col-span-3"
                onChange={(e) => setStatus(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Status Text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className="col-span-2 sm:col-span-1"
              />
              <label className="mt-1 font-bold">Headers</label>
              <div className="col-span-4">
                <HeadersList headers={headers} onChange={setHeaders} />
              </div>
              <label className="mt-1 font-bold">Body</label>
              <Input
                textarea
                placeholder="{}"
                value={responseBody}
                className="w-full col-span-4 h-32"
                onChange={(e) => setResponseBody(e.target.value)}
              />
            </div>
            <div className="self-end">
              <Button disabled={isCreating} type="submit">
                {isCreating ? "Creating" : "Create Bin"}
              </Button>
            </div>
          </form>
          <form
            className={cn(
              "py-4 px-6 text-sm flex flex-col gap-6 items-start rounded-r-none",
              "lg:w-[60%]",
            )}
            onSubmit={handleOpenApiSubmit}
          >
            <div className="flex items-center relative">
              <h2 className="text-3xl font-bold w-full">
                Create an OpenAPI Bin
              </h2>
              <div className="absolute left-full ml-2">
                <div className="relative">
                  <div className="bg-pink-500 text-white text-xs font-bold uppercase px-2 py-1 transform rotate-12 -translate-y-1/2 animate-pulse">
                    NEW
                  </div>
                </div>
              </div>
            </div>
            <div>
              Upload an OpenAPI v3.1 document and we&apos;ll use the schemas and
              examples to mock it for you, in seconds!
            </div>
            <input type="file" onChange={handleFileChange} />
            <div className="self-end">
              <Button disabled={isCreating}>
                {isCreating ? "Creating" : "Create OpenAPI Bin"}
              </Button>
            </div>
          </form>
          <div className="p-6">
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <InfoIcon />
              Mockbin is free of sign-ups. The bin IDs are only stored in your
              browser storage.
            </span>
          </div>
        </div>
        <div
          className={cn(
            "bg-slate-800/80 inset-0 overflow-y-auto max-h-[300px] border-gray-700 border-t",
            "lg:absolute lg:min-h-full lg:max-h-full lg:w-[40%] lg:left-auto lg:border-t-0 lg:border-l",
          )}
        >
          <h2 className="text-xl font-bold mb-2 border-b border-slate-700 py-3 px-4">
            Your recent bins
          </h2>
          {recentBins.length > 0 ? (
            <ul className="list-none flex flex-col gap-1 text-sm p-4">
              {recentBins.map((bin) => (
                <li
                  key={bin.id}
                  className={cn(
                    "group relative inline-flex gap-6 items-center justify-between",
                    "before:content-['→'] before:text-xs before:-translate-y-[1px] before:absolute",
                  )}
                >
                  <Link
                    href={`/bins/${bin.id}`}
                    className={cn(
                      "ps-7 truncate text-zuplo-primary font-mono rounded px-2 py-1 -mx-2 -my-1 transition-all",
                      "hover:text-zuplo-primary/90 hover:bg-zuplo-primary hover:bg-opacity-50",
                    )}
                  >
                    {bin.id}
                  </Link>
                  <span
                    className="text-end flex-shrink-0"
                    title={new Date(bin.createdTime).toLocaleString()}
                  >
                    {timeAgo(Number(new Date(bin.createdTime)))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300 px-4 py-2 text-sm italic">
              No bins yet. All recent ones will show up here
            </p>
          )}
        </div>
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
