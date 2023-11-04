import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useState } from "react";

const Index = () => {
  const [status, setStatus] = useState("200");
  const [headerTitle, setHeaderTitle] = useState("Content-Type");
  const [headerValue, setHeaderValue] = useState("application/json");
  const [responseBody, setResponseBody] = useState("{}");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requestBody = {
      response: {
        status: status,
        headers: {
          [headerTitle]: headerValue,
        },
        body: responseBody,
      },
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/bins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const result = await response.json();
      router.push(`/bins/${result.binId}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <Header />
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: "1rem",
        }}
      >
        <h1>Create a new mockbin</h1>
        <p>Define the response you want to send</p>
        <div className="max-w-[800px] grid grid-cols-5 grid-flow-row gap-y-4">
          <label>Status</label>
          <div className="col-span-4">
            <input
              type="text"
              placeholder="200"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className=" border-2 border-gray-300 flex-grow"
            />
          </div>
          <label>Headers</label>
          <input
            type="text"
            placeholder="Content-Type"
            className="border-2 border-gray-300 mr-4 col-span-2"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="application/json"
            value={headerValue}
            onChange={(e) => setHeaderValue(e.target.value)}
            className="border-2 border-gray-300 col-span-2"
          />
          <label>Body</label>
          <textarea
            placeholder="{}"
            className="border-2 border-gray-300 h-32 w-full col-span-4"
            value={responseBody}
            onChange={(e) => setResponseBody(e.target.value)}
          />
        </div>
        <button className="self-end" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

export default Index;
