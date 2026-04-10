import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://google.com https://checkout.razorpay.com https://*.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://graph.facebook.com https://*.fbcdn.net https://*.google.com https://*.googleusercontent.com https://*.razorpay.com https://i.ibb.co https://*.imgbb.com https://ui-avatars.com; connect-src 'self' https://graph.facebook.com https://openrouter.ai https://api.razorpay.com https://*.razorpay.com http://localhost:4000; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://api.razorpay.com https://*.razorpay.com; frame-ancestors 'none'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
