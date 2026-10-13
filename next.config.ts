import type { NextConfig } from "next";

// Old per-module URLs now live under the schema-driven CMS screens.
const CONTENT = ["services", "solutions", "technologies", "industries", "portfolio", "locations", "careers", "team", "blog", "testimonials", "faqs"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.thewebhero.in" },
    ],
  },
  async redirects() {
    return [
      ...CONTENT.map((r) => ({ source: `/dashboard/${r}`, destination: `/dashboard/content/${r}`, permanent: false })),
      { source: "/dashboard/home-page", destination: "/dashboard/site/home-page", permanent: false },
      { source: "/dashboard/settings", destination: "/dashboard/site/settings", permanent: false },
      { source: "/dashboard/pages", destination: "/dashboard/content/seo-pages", permanent: false },
      { source: "/dashboard/leads", destination: "/dashboard/quote-requests", permanent: false },
    ];
  },
};

export default nextConfig;
