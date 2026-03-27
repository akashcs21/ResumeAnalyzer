import path from "node:path";

const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  output: "standalone",
};


export default nextConfig;
