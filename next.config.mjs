/** @type {import('next').NextConfig} */

import Dotenv from 'dotenv-webpack';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export default {
  reactStrictMode: true,
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
  // Ensure ESM deps in node_modules can be consumed by the server
  experimental: {
    esmExternals: 'loose',
  },
  // Force bundling of the ESM SDK so Node doesn't try to require it as CJS
  transpilePackages: [
    '@farcaster/miniapp-sdk',
    '@farcaster/miniapp-wagmi-connector',
  ],
  // experimental features disabled to avoid Netlify build issues
  compiler: {
    emotion: false,
  },
  async headers() {
    return [
      {
        source: '/~/multi-tip',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Add dotenv-webpack plugin to the webpack configuration
    config.plugins.push(new Dotenv({ silent: true }));

    // Prevent SSR from trying to load the browser-only Mini App SDK
    if (isServer) {
      const sdkStubPath = path.resolve(process.cwd(), "utils/miniapp-sdk-server-stub.js");
      config.resolve.alias["@farcaster/miniapp-sdk"] = sdkStubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/index.js"] = sdkStubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/sdk.js"] = sdkStubPath;

      const wagmiConnectorStubPath = path.resolve(process.cwd(), "utils/miniapp-wagmi-connector-server-stub.js");
      config.resolve.alias["@farcaster/miniapp-wagmi-connector"] = wagmiConnectorStubPath;
    }
    return config;
  },
};