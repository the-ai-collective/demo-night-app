"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>Something went wrong!</h2>
          <div style={{
            backgroundColor: "#fef2f2",
            padding: "1rem",
            borderRadius: "8px",
            maxWidth: "500px",
            marginBottom: "1rem"
          }}>
            <p style={{ color: "#991b1b", fontWeight: 500 }}>
              Error: {error.message}
            </p>
            {error.digest && (
              <p style={{ color: "#dc2626", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                Digest: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
