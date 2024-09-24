import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        {/* twitter og image */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@zuplo" />
        <meta name="twitter:creator" content="@zuplo" />
        <meta name="twitter:title" content="Mockbin by Zuplo" />
        <meta
          name="twitter:description"
          content="Mockbin is a free tool that helps you mock an API endpoint and track requests to it."
        />
        <meta
          name="twitter:image"
          content="https://cdn.zuplo.com/assets/8e93df64-1a75-4cfe-afb7-10a99def9e0c.png"
        />

        {/* open graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mockbin.io" />
        <meta property="og:title" content="Mockbin by Zuplo" />
        <meta
          property="og:description"
          content="Mockbin is a free tool that helps you mock an API endpoint and track requests to it."
        />
        <meta
          property="og:image"
          content="https://cdn.zuplo.com/assets/8e93df64-1a75-4cfe-afb7-10a99def9e0c.png"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Fira+Code"
          rel="stylesheet"
          type="text/css"
        />
        {process.env.NEXT_PUBLIC_ANALYTICS_URL ? (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script src={process.env.NEXT_PUBLIC_ANALYTICS_URL}></script>
        ) : null}
        {process.env.NEXT_PUBLIC_ANALYTICS_URL ? (
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=AW-11213523037"
          />
        ) : null}
        {process.env.NEXT_PUBLIC_ANALYTICS_URL ? (
          <Script
            id="google-analytics"
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-11213523037');
            `,
            }}
          />
        ) : null}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
