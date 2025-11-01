"use client";

import { useEffect } from "react";
import { setupErrorFiltering } from "@/utils/errorFilter";

/**
 * Client component to setup error filtering
 * This runs on the client side to filter out non-critical errors
 */
export function ErrorFilterScript() {
  useEffect(() => {
    setupErrorFiltering();
  }, []);

  return null;
}

