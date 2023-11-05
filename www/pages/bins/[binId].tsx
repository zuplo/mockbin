import FullScreenLoading from "@/components/FullScreenLoading";
import Header from "@/components/Header";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type BinRequest = {
  requestId: string;
};

type BinRequestData = {
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: string;
};

const Bin = () => {
  const [data, setData] = useState<BinRequest[] | null>(null);
  const [binId, setBinId] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<BinRequestData | null>(
    null
  );
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests`
    );

    if (!response.ok) {
      setEasterEggActive(true);
      return;
    }

    const data = await response.json();
    setData(data.data);
  };

  const getRequestData = async (requestId: string) => {
    setLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/bins/${binId}/requests/${requestId}`
    );
    const data = await response.json();
    setCurrentRequest(data);
    setLoading(false);
  };

  if (easterEggActive) {
    return (
      <div className="flex flex-col w-full h-full">
        <Header />
        <h1>🐒 Could not find bin</h1>
        <Image
          src="https://cdn.zuplo.com/assets/c7513238-58bd-4b72-ac4d-3d67d0636b3b.png"
          alt="monkey"
          width={500}
          height={500}
        />
      </div>
    );
  }

  if (!data) return <FullScreenLoading />;

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col items-center max-w-[800px]">
        <Header />
        <div className="grid grid-cols-5">
          <h1 className="col-span-2">Requests</h1>
          <div className="col-span-3 pb-4">
            <button
              className="border-2 border-pink-500"
              onClick={() => {
                setData(null); // so we trigger loading state :)
                getBinData();
              }}
            >
              Refresh
            </button>
          </div>
          <div className="flex flex-col col-span-2">
            <ul>
              {data.map((request) => (
                <li key={request.requestId} className="flex space-x-5">
                  <div>{request.requestId}</div>
                  <button
                    className="border-2 border-pink-500"
                    onClick={() => {
                      getRequestData(request.requestId);
                    }}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-3">
            {currentRequest &&
              (loading ? (
                <span>Loading...</span>
              ) : (
                <div className="flex flex-col">
                  <span>
                    <b>Time</b> {currentRequest.timestamp}
                  </span>
                  <span>
                    <b>Method:</b> {currentRequest.method}
                  </span>
                  <span>
                    <b>Headers:</b>
                    {Object.entries(currentRequest.headers).map(
                      ([key, value]) => (
                        <div key={key}>
                          - <span>{key}</span> <span>{value}</span>
                        </div>
                      )
                    )}
                  </span>
                  <span>
                    <b>Body:</b> {currentRequest.body}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bin;
