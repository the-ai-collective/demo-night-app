"use client";

import dynamicImport from "next/dynamic";
import { useState, useEffect } from "react";
import "swagger-ui-react/swagger-ui.css";

export const dynamic = 'force-dynamic';

const SwaggerUI = dynamicImport(() => import("swagger-ui-react"), { ssr: false });

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR/prerendering flash
  if (!mounted) {
    return null;
  }

  // Serve Swagger UI with our OpenAPI schema
  return <SwaggerUI url="/api/openapi.json" />;
};

export default Home;
