import createNextIntlPlugin from "next-intl/plugin";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import("next").NextConfig} */
const config = {
  redirects: async () => {
    const cities = ["sf", "nyc", "boston"];
    return cities.map((city) => ({
      source: `/${city}`,
      destination: "/",
      permanent: true,
    }));
  },
};

export default withNextIntl(config);
