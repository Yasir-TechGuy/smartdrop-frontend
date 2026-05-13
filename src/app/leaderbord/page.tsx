"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Old URL; static hosts keep this route as a client redirect. */
export default function LeaderbordRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/leaderboard");
  }, [router]);
  return null;
}
