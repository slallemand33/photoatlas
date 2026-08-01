"use client";

import { useMemo } from "react";

import { useLightningStore } from "../store";
import type { LightningLocation } from "../types";
import { getLightningActivity } from "../utils";

export function useLightningActivity(location: LightningLocation) {
  const snapshot = useLightningStore((state) => state.snapshot);
  return useMemo(() => getLightningActivity(location, snapshot), [location, snapshot]);
}
