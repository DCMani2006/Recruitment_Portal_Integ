"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DeskLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sp = searchParams.toString();
    const dest = `/login${sp ? `?${sp}` : ""}`;
    router.replace(dest);
  }, [router, searchParams]);

  return null;
}

export default function DeskLoginPage() {
  return (
    <Suspense fallback={null}>
      <DeskLoginRedirect />
    </Suspense>
  );
}
