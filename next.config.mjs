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
      const stubPath = path.resolve(process.cwd(), "utils/miniapp-sdk-server-stub.js");
      config.resolve.alias["@farcaster/miniapp-sdk"] = stubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/index.js"] = stubPath;
      config.resolve.alias["@farcaster/miniapp-sdk/dist/sdk.js"] = stubPath;
    }
    return config;
  },
};