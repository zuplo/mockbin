export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const timeAgo = (prevDate: number) => {
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
      const minutes = Math.round(diff / minute);
      return minutes + ` ${minutes > 1 ? "minutes" : "minute"} ago`;
    case diff < day:
      const hours = Math.round(diff / hour);
      return hours + ` ${hours > 1 ? "hours" : "hour"} ago`;
    case diff < month:
      const days = Math.round(diff / day);
      return days + ` ${days > 1 ? "days" : "day"} ago`;
    case diff < year:
      const months = Math.round(diff / month);
      return months + ` ${months > 1 ? "months" : "month"} ago`;
    case diff > year:
      const years = Math.round(diff / year);
      return years + ` ${years > 1 ? "years" : "year"} ago`;
    default:
      return "";
  }
};
