import type { NextConfig } from "next";
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const nextConfig: NextConfig = {
    allowedDevOrigins: [process.env.DEV_FRONTEND ?? "", "localhost", process.env.RELEASE_FRONTEND ?? ""]
};

export default nextConfig;
