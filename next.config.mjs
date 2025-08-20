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
  // experimental features disabled to avoid Netlify build issues
  compiler: {
    emotion: true,
  },
  // Force Next to bundle these ESM-only packages so our aliases apply on the server
  transpilePackages: ['@farcaster/miniapp-sdk', '@farcaster/miniapp-wagmi-connector'],
  webpack: (config, { isServer }) => {
    // Add dotenv-webpack plugin to the webpack configuration
    config.plugins.push(new Dotenv({ silent: true }));

    // Prevent SSR from trying to load the browser-only Mini App SDK
    if (isServer) {
      const stubPath = path.resolve(process.cwd(), "utils/miniapp-sdk-server-stub.js");
      const wagmiConnectorStubPath = path.resolve(process.cwd(), "utils/miniapp-wagmi-connector-server-stub.js");
      config.resolve.alias["@farcaster/miniapp-sdk"] = stubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/index.js"] = stubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/sdk.js"] = stubPath;
      // Also stub the Wagmi connector on the server to avoid importing ESM-only code
      config.resolve.alias["@farcaster/miniapp-wagmi-connector"] = wagmiConnectorStubPath;
    }
    return config;
  },
};