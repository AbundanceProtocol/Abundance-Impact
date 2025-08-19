import qs from "querystring";
import Head from "next/head";

export async function getServerSideProps(context) {
  const { id } = context.query || {};
  const frameContent = {
    version: "next",
    imageUrl: `https://impact.abundance.id/api/frames/tip/onchain-tip-v1?${qs.stringify({ id })}`,
    button: {
      title: "Impact Multi-Tip",
      action: {
        type: "launch_frame",
        name: "Impact 2.0",
        url: "https://impact.abundance.id/~/tip",
        splashImageUrl: "https://impact.abundance.id/images/icon.png",
        splashBackgroundColor: "#011222",
      },
    },
  };

  return {
    props: { frameContent, id: id || null },
  };
}

export default function MultiTip({ frameContent, id }) {
  return (
    <>
      <Head>
        <meta name="fc:frame" content={JSON.stringify(frameContent)} />
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content="https://impact.abundance.id/~/tip" />
      </Head>

      <div>
        <h1>Impact 2.0 Miniapp</h1>
        <p>id param: {id}</p>
      </div>
    </>
  );
}
