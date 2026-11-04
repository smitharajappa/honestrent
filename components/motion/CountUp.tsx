"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";
import { formatUsd } from "@/lib/format";

/** A dollar amount that counts up once told to go. Shows the final number when motion is reduced. */
export function CountUp({
  from,
  to,
  go = true,
  prefix = "",
}: {
  from: number;
  to: number;
  go?: boolean;
  prefix?: string;
}) {
  const reduce = useReducedMotion();
  const value = useMotionValue(reduce ? to : from);
  const text = useTransform(value, (v) => `${prefix}${formatUsd(Math.round(v))}`);
  useEffect(() => {
    if (reduce) {
      value.set(to);
      return;
    }
    if (!go) return;
    const controls = animate(value, to, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] });
    return () => controls.stop();
  }, [go, reduce, to, value]);
  return <motion.span>{text}</motion.span>;
}
