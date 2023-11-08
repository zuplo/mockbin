import Frame from "@/components/Frame";
import { getURL, timeAgo } from "@/utils/helpers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import HeadersList, { Header } from "../components/HeadersList";

const RECENT_BIN_KEY = "LAST_BINS";
type RecentBin = {
  id: string;
  createdTime: string;
  url: string;
};

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
  const [responseBody, setResponseBody] = useState("{}");
  const [recentBins, setRecentBins] = useState<RecentBin[]>([]);
  const [isCreating, setIsCreating] = useState(false);
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
      const createdTime = new Date().toISOString();
      const recentBinEntry: RecentBin = {
        id: result.id,
        createdTime,
        url: result.url,
      };
      const newRecentBins = [recentBinEntry, ...recentBins];
      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_BIN_KEY, JSON.stringify(newRecentBins));
      }
    } catch (err: any) {
      alert(`Error - ${err.message}`);
      setIsCreating(false);
      return;
    }
  };

  return (
    <Frame>
      <div className="mt-4 sm:mt-10 mb-8 sm:mb-20 w-full  sm:w-2/3">
        <h1 className="mb-4 text-3xl">
          Welcome to <span className="font-bold">Mockbin by Zuplo</span>
        </h1>
        <p className="text-gray-300 ">
          This is an open-source and fully-free tool that allows you to quickly
          mock an API endpoint, configure a fixed response and track requests to
          your endpoint.
        </p>
      </div>
      <div className="my-8 sm:my-10">
        {recentBins.length > 0 ? (
          <ul className="flex flex-col mb-4 list-disc list-inside">
            <h2 className="text-3xl font-bold">Your recent bins</h2>
            <div className="flex flex-col gap-y-2 mt-3">
              {recentBins.slice(0, 5).map((bin) => {
                return (
                  <li key={bin.id}>
                    <Link
                      href={`/bins/${bin.id}`}
                      className="text-[#FF00BD] hover:text-[#FF90E3] text-sm md:text-xl font-mono mr-4 break-all transition-all"
                    >{`${bin.id}`}</Link>
                    <span className="font-mono opacity-70">
                      {timeAgo(Number(new Date(bin.createdTime)))}
                    </span>
                  </li>
                );
              })}
            </div>
            <p className="mt-4 text-sm w-fit border border-gray-700 p-2 rounded-md opacity-70">
              Mockbin is free of sign-ups. These bin IDs are stored in your
              browser storage.{" "}
            </p>
          </ul>
        ) : null}
      </div>
      <form
        className="gap-y-2 px-4 py-4 border border-dashed border-gray-700 shadow-xl shadow-[#FF00BD]/10 rounded-md"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
      >
        <h2 className="text-3xl font-bold">Create a new bin</h2>
        <p>
          Just specify the details of the response below and we’ll create you a
          new API endpoint in a jiffy.
        </p>
        <div className="mt-8 w-full flex flex-col gap-y-2 sm:grid sm:grid-cols-5 sm:gap-y-4">
          <label className="mt-1 font-bold">Status</label>
          <input
            type="text"
            placeholder="Status Code"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-white bg-[#000019] border col-span-2 font-mono p-1 px-2 sm:mr-4 border-gray-300 flex-grow rounded-md"
          />
          <div className="col-span-2"></div>
          <label className="mt-1 font-bold">Status Text</label>
          <input
            type="text"
            placeholder="Status Text"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            className="text-white bg-[#000019] border-2 col-span-2 font-mono p-1 px-2 sm:mr-4 border-gray-300 flex-grow rounded-md"
          />
          <div className="col-span-2"></div>
          <label className="mt-1 font-bold">Headers</label>
          <div className="col-span-4">
            <HeadersList headers={headers} onChange={setHeaders} />
          </div>
          <label className="mt-1 font-bold">Body</label>
          <textarea
            placeholder="{}"
            className="text-white bg-[#000019] border-2 font-mono p-1 px-2 mt-1 border-gray-300 h-32 w-full col-span-4 rounded-md"
            value={responseBody}
            onChange={(e) => setResponseBody(e.target.value)}
          />
        </div>
        <button
          className="self-end bg-[#FF00BD] rounded-md p-2 mt-3 px-4 font-bold enabled:hover:bg-[#C0008F] disabled:opacity-50"
          disabled={isCreating}
          type="submit"
        >
          {isCreating ? "Creating" : "Create Bin"}
        </button>
      </form>
    </Frame>
  );
};

export default Index;
