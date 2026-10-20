"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function hasAuthCookie() {
  if (typeof document === "undefined") return false;

  // Supabase SSR cookies are readable and named sb-<project-ref>-auth-token
  // (possibly chunked as .0, .1, ...).
  return document.cookie.split(";").some((cookie) => {
    const name = cookie.trim().split("=")[0];
    return name.startsWith("sb-") && name.includes("-auth-token");
  });
}

/**
 * Returns the signed-in Supabase user for client-side chrome (navbar/drawer).
 * Anonymous visitors are detected with the cookie so they never trigger a
 * network request, and the user is re-checked after navigation so the navbar
 * updates immediately after a server-side sign-in.
 */
export default function useAuthUser() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasAuthCookie()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let active = true;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [pathname]);

  return { user, isLoading };
}
