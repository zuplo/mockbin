const posthogUrl = "https://app.posthog.com";
const posthogPublicKey = "phc_dCmyLs4gaS63dknkr9D9OA6bcEG5bxP3KPtPqJGDz7V";

export const logAnalytics = async (
  event: string,
  data: {
    binId: string;
    [key: string]: any;
  },
) => {
  const response = await fetch(posthogUrl + "/capture", {
    method: "POST",
    body: JSON.stringify({
      api_key: posthogPublicKey,
      event,
      properties: data,
      timestamp: new Date().toISOString(),
      distinct_id: data.binId,
    }),
  });

  if (response.status !== 200) {
    console.log(await response.text());
    throw new Error("Failed to send event to PostHog");
  }
};
