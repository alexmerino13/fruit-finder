/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'fruitfinder.s3.us-east-2.amazonaws.com',
            port: '',
            pathname: '/**',
          },
        ],
      }
};

export default nextConfig;
