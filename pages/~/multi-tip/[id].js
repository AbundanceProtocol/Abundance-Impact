import Head from "next/head";

export async function getServerSideProps({ params }) {
  const { id } = params;
  const frameContent = {
    version: "next",
    imageUrl: `https://impact.abundance.id/api/frames/tip/onchain-tip-v1?id=${encodeURIComponent(id)}`,
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
  return { props: { id, frameContent } };
}

function MultiTip({ id, frameContent }) {
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
        <h1>Impact 2.0 Multi-Tip</h1>
        <p>id: {id}</p>
      </div>
    </>
  );
}

// Opt-out of global providers to avoid importing client-only SDKs during SSR
MultiTip.disableProviders = true;

export default MultiTip;

