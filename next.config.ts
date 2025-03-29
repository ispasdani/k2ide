/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config: {
      module: {
        rules: {
          test: RegExp;
          include: RegExp;
          use: {
            loader: string;
            options: {
              inline: string; // Inline workers without fallback
              publicPath: string;
              filename: string;
            };
          };
        }[];
      };
    },
    { isServer }: any
  ) => {
    if (!isServer) {
      // Configure Monaco Editor workers
      config.module.rules.push({
        test: /\.js$/,
        include: /node_modules\/monaco-editor/,
        use: {
          loader: "worker-loader",
          options: {
            inline: "no-fallback", // Inline workers without fallback
            publicPath: "/_next/static/workers/",
            filename: "[name].worker.js",
          },
        },
      });
    }
    return config;
  },
};

module.exports = nextConfig;
