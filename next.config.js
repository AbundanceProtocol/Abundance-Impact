/** @type {import('next').NextConfig} */

const Dotenv = require('dotenv-webpack');
require('dotenv').config();

module.exports = {
  reactStrictMode: true,
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
  experimental: {
    serverActions: true,
  },
  compiler: {
    emotion: true,
  },
  webpack: (config) => {
    // Add dotenv-webpack plugin to the webpack configuration
    config.plugins.push(new Dotenv({ silent: true }));
    return config;
  },
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/0197c42b-f503-1bbe-3a20-9f89b3e0bf09',
        permanent: false, // false = 307 Temporary Redirect
      },
    ];
  },
};