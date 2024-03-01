/** @type {import('next').NextConfig} */

const Dotenv = require('dotenv-webpack');

module.exports = {
  reactStrictMode: true,
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
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

// const nextConfig = {
//   reactStrictMode: true,  
//   env: {
//     ENVIRONMENT: process.env.ENVIRONMENT
//   },
//   compiler: {
//     // see https://styled-components.com/docs/tooling#babel-plugin for more info on the options.
//     emotion: true
//   }
// }

// module.exports = nextConfig
