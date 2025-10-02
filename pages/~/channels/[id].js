import Head from "next/head";

export async function getServerSideProps({ params, query }) {
  const { hash } = params;
  const { id } = query;
  const frameContent = {
    version: "next",
    imageUrl: `https://impact.abundance.id/api/frames/tip/circle-v7?channel=${id}`,
    button: {
      title: "Curated Channel",
      action: {
        type: "launch_frame",
        name: "Impact 2.0",
        url: `https://impact.abundance.id/~/channel/${id}`,
        splashImageUrl: "https://impact.abundance.id/images/icon.png",
        splashBackgroundColor: "#011222",
      },
    },
  };
  return { props: { hash, frameContent, fid } };
}

function Rewards({ hash, frameContent, fid }) {
  return (
    <>
      <Head>
        <meta name="fc:frame" content={JSON.stringify(frameContent)} />
        <meta name="fc:miniapp" content="true" />
        <meta name="fc:miniapp:name" content="Impact 2.0" />
        <meta name="fc:miniapp:description" content="Get boosted and rewarded for your impact on Farcaster" />
        <meta name="fc:miniapp:icon" content="https://impact.abundance.id/images/icon-02.png" />
        <meta name="fc:miniapp:url" content={`https://impact.abundance.id/~/channel/${id}`} />
      </Head>

      <div>
        <h1>Impact 2.0 Curation</h1>
        <p>hash: {hash}</p>
      </div>
    </>
  );
}

// Opt-out of global providers to avoid importing client-only SDKs during SSR
Rewards.disableProviders = true;

export default Rewards;

