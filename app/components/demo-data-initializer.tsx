"use client";

import { useEffect } from "react";
import { seedDermisDemoData } from "../lib/demo-data";

export default function DemoDataInitializer() {
  useEffect(() => {
    seedDermisDemoData();
  }, []);

  return null;
}