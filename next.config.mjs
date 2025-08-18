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
  experimental: {
    serverActions: true,
    esmExternals: true,
  },
  compiler: {
    emotion: true,
  },
  webpack: (config, { isServer }) => {
    // Add dotenv-webpack plugin to the webpack configuration
    config.plugins.push(new Dotenv({ silent: true }));

    // Prevent SSR from trying to load the browser-only Mini App SDK
    if (isServer) {
      config.resolve.alias["@farcaster/miniapp-sdk"] = path.resolve(process.cwd(), "utils/miniapp-sdk-server-stub.js");
    }
    return config;
  },
};