"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SlotsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sp = searchParams.toString();
    router.replace(`/desk/interview${sp ? `?${sp}` : ""}`);
  }, [router, searchParams]);

  return null;
}

export default function SlotsPage() {
  return (
    <Suspense fallback={null}>
      <SlotsRedirect />
    </Suspense>
  );
}
