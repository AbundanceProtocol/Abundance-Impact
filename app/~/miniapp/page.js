import qs from "querystring";
import ClientPage from "./ClientPage";

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function generateMetadata({ searchParams }) {
  const id = searchParams.id || null;

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
    other: [
      { name: "fc:frame", content: JSON.stringify(frameContent) },
      { name: "fc:miniapp", content: "true" },
      { name: "fc:miniapp:name", content: "Impact 2.0" },
      {
        name: "fc:miniapp:description",
        content: "Get boosted and rewarded for your impact on Farcaster",
      },
      {
        name: "fc:miniapp:icon",
        content: "https://impact.abundance.id/images/icon-02.png",
      },
      { name: "fc:miniapp:url", content: "https://impact.abundance.id/~/tip" },
    ],
  };
}

export default function MiniappPage({ searchParams }) {
  return <ClientPage searchParams={searchParams} />;
}
