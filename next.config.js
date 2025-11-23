/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  // Disable React Strict Mode to reduce duplicate renders in development
  reactStrictMode: false,
  // Skip prerendering errors - allow build to succeed with runtime rendering
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Skip failing prerender during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  redirects: async () => {
    const cities = ["sf", "nyc", "boston"];
    return cities.map((city) => ({
      source: `/${city}`,
      destination: "/",
      permanent: true,
    }));
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude email templates from being processed during SSR/prerendering
      config.externals = config.externals || [];
      config.externals.push({
        '@react-email/components': '@react-email/components',
        '@react-email/render': '@react-email/render',
      });
    }
    return config;
  },
};

export default config;
