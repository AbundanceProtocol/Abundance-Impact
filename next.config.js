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
};