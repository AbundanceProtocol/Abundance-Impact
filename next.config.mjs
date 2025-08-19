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
  // Disable Emotion compiler on server; we stub Emotion during SSR
  compiler: {
    emotion: false,
  },
  webpack: (config, { isServer }) => {
    // Add dotenv-webpack plugin to the webpack configuration
    config.plugins.push(new Dotenv({ silent: true }));

    // Prevent SSR from trying to load the browser-only Mini App SDK
    if (isServer) {
      const stubPath = path.resolve(process.cwd(), "utils/miniapp-sdk-server-stub.js");
      config.resolve.alias["@farcaster/miniapp-sdk"] = stubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/index.js"] = stubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/sdk.js"] = stubPath;

      // Stub Emotion on server to avoid react_shared_subset hooks
      const emotionStub = path.resolve(process.cwd(), "utils/emotion-server-stub.js");
      config.resolve.alias["@emotion/react"] = emotionStub;
      config.resolve.alias["@emotion/react/jsx-runtime"] = emotionStub;
      config.resolve.alias["@emotion/use-insertion-effect-with-fallbacks"] = emotionStub;
    }
    return config;
  },
};