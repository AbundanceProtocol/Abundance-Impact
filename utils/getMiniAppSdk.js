export async function getMiniAppSdk() {
  if (typeof window === 'undefined') {
    const { sdk } = await import('./miniapp-sdk-server-stub.js');
    return sdk;
  }
  try {
    const { sdk } = await import('@farcaster/miniapp-sdk');
    return sdk;
  } catch (_) {
    const { sdk } = await import('./miniapp-sdk-server-stub.js');
    return sdk;
  }
}

export default getMiniAppSdk;


