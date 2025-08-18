/** @type {import('next').NextConfig} */

import Dotenv from 'dotenv-webpack';
import dotenv from 'dotenv';
import path from 'path';
import webpack from 'webpack';
dotenv.config();

export default {
  reactStrictMode: true,
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
  experimental: {
    serverActions: true,
    esmExternals: "loose",
  },
  compiler: {
    emotion: true,
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
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@farcaster\/miniapp-sdk(\/.*)?$/ }));
    }
    return config;
  },
};