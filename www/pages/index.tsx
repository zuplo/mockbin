import Frame from "@/components/Frame";
import Header from "@/components/Header";
import { getURL } from "@/utils/helpers";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const RECENT_BIN_KEY = "RECENT_BINS";
type RecentBin = {
  binId: string;
  createdTime: string;
};

const timeAgo = (prevDate: number) => {
  const diff = Number(new Date()) - prevDate;
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  switch (true) {
    case diff < minute:
      const seconds = Math.round(diff / 1000);
      return `${seconds} ${seconds > 1 ? "seconds" : "second"} ago`;
    case diff < hour:
      return Math.round(diff / minute) + " minutes ago";
    case diff < day:
      return Math.round(diff / hour) + " hours ago";
    case diff < month:
      return Math.round(diff / day) + " days ago";
    case diff < year:
      return Math.round(diff / month) + " months ago";
    case diff > year:
      return Math.round(diff / year) + " years ago";
    default:
      return "";
  }
};

const Index = () => {
  const [status, setStatus] = useState("200");
  const [statusText, setStatusText] = useState("OK");
  const [headerTitle, setHeaderTitle] = useState("Content-Type");
  const [headerValue, setHeaderValue] = useState("application/json");
  const [responseBody, setResponseBody] = useState("{}");
  const [recentBins, setRecentBins] = useState<RecentBin[]>([]);

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
    const requestBody = {
      response: {
        status: parseInt(status),
        statusText,
        headers: {
          [headerTitle]: headerValue,
        },
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
        return;
      }
      const result = await response.json();
      router.push(`/bins/${result.binId}`);
      const createdTime = new Date().toISOString();
      const recentBinEntry: RecentBin = {
        binId: result.binId,
        createdTime,
      };
      const newRecentBins = [recentBinEntry, ...recentBins];
      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_BIN_KEY, JSON.stringify(newRecentBins));
      }
    } catch (err: any) {
      alert(`Error - ${err.message}`);
      return;
    }
  };

  return (
    <Frame>
      <p className="mb-4 text-sm">
        Welcome to mockbin2 (the revival). This is an open-source and fully-free
        tool that allows you to quickly mock an API endpoint, configure a fixed
        response and track requests to your endpoint.{" "}
      </p>
      {recentBins.length > 0 ? (
        <div className="flex flex-col mb-4">
          <h1 className="text-3xl">Your recent bins</h1>
          <div className="flex flex-col gap-y-2 mt-3">
            {recentBins.slice(0, 5).map((bin) => {
              return (
                <div>
                  <a
                    href={`${getURL()}bins/${bin.binId}`}
                    className="text-[#FF00BD] hover:text-[#C0008F] mr-4"
                  >{`${getURL()}bins/${bin.binId}`}</a>
                  {timeAgo(Number(new Date(bin.createdTime)))}
                </div>
              );
            })}
          </div>
          <p className="mt-4">
            Mockbin is free of sign-ups, so there is no account. The IDs of
            these bins are stored in browser storage.{" "}
          </p>
        </div>
      ) : null}
      <form
        className="gap-y-2"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
      >
        <h1 className="text-3xl">Create a new bin</h1>
        <p className="text-xs">
          Just specify the details of the response below and we’ll create you a
          new API endpoint in a jiffy.
        </p>
        <div className="mt-8 w-full grid grid-cols-5 gap-y-4">
          <label className="mt-1">Status</label>
          <input
            type="text"
            placeholder="Status Code"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-black border-2 col-span-2 font-mono p-1 px-2 mr-4 border-gray-300 flex-grow rounded-md"
          />
          <div className="col-span-2"></div>
          <label className="mt-1">Status Text</label>
          <input
            type="text"
            placeholder="Status Text"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            className="text-black border-2 col-span-2 font-mono p-1 px-2 mr-4 border-gray-300 flex-grow rounded-md"
          />
          <div className="col-span-2"></div>
          <label className="mt-4">Headers</label>
          <input
            type="text"
            placeholder="Key"
            className="text-black border-2 font-mono p-1 px-2 mt-3 border-gray-300 mr-4 col-span-2 rounded-md"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Value"
            value={headerValue}
            onChange={(e) => setHeaderValue(e.target.value)}
            className="text-black border-2 font-mono p-1 px-2 mt-3 border-gray-300 col-span-2 rounded-md"
          />
          <label className="mt-4">Body</label>
          <textarea
            placeholder="{}"
            className="text-black border-2 font-mono p-1 px-2 mt-3 border-gray-300 h-32 w-full col-span-4 rounded-md"
            value={responseBody}
            onChange={(e) => setResponseBody(e.target.value)}
          />
        </div>
        <button
          className="self-end bg-[#FF00BD] rounded-md p-2 mt-3 px-4 font-extrabold hover:bg-[#C0008F]"
          type="submit"
        >
          Create Bin
        </button>
      </form>
    </Frame>
  );
};

export default Index;
