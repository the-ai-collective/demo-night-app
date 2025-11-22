"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <div className="max-w-lg rounded-lg bg-red-50 p-4 text-sm">
        <p className="font-medium text-red-800">Error: {error.message}</p>
        {error.digest && (
          <p className="mt-2 text-red-600">Digest: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/api/auth/signin"}>
          Sign in
        </Button>
      </div>
    </div>
  );
}
