/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Keeping default strict mode enabled
  async rewrites() {
    // Check if the backend URL is set, otherwise don't proxy
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7771';
    
    if (!backendUrl) {
      console.warn('NEXT_PUBLIC_API_BASE_URL is not set. API proxy rewrite disabled.');
      return [];
    }
    
    console.log(`Setting up API proxy rewrite from /api-proxy/* to ${backendUrl}/*`);
    
    return [
      {
        // This will match any path starting with /api-proxy/
        source: '/api-proxy/:path*', 
        // This will proxy the request to your actual backend API
        destination: `${backendUrl}/:path*`, 
      },
    ]
  },
}

nextConfig.images = {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.a.transfermarkt.technology',
      port: '',
      pathname: '/portrait/**', // Allow any image path under /portrait/
    },
  ],
};

module.exports = nextConfig
