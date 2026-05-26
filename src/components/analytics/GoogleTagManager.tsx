import Script from "next/script";

import { getGtmId } from "@/lib/analytics/gtm";

/** Mounts the GTM container script in the document head when configured.
 *  Renders nothing when NEXT_PUBLIC_GTM_ID is missing or malformed. */
export function GoogleTagManagerScript() {
  const gtmId = getGtmId();
  if (!gtmId) return null;

  return (
    <Script id="gtm-base" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
    </Script>
  );
}

/** Injected at the top of <body> so script-blocking visitors still register
 *  pageviews via the iframe pixel. Renders nothing when GTM isn't configured. */
export function GoogleTagManagerNoscript() {
  const gtmId = getGtmId();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
