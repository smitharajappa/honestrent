"use client";

import { motion, MotionConfig } from "motion/react";

/**
 * Motion presets for Honest Rent. Short and gentle (see DESIGN.md).
 * People who turn on "reduce motion" in their device settings get no movement.
 */
export const MOTION = {
  /** Fade up and in, a little later for each item in a list. */
  reveal: (index = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.35,
      delay: Math.min(index, 8) * 0.04,
      ease: [0.2, 0.8, 0.2, 1] as const,
    },
  }),
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type RevealProps = React.ComponentProps<typeof motion.li> & { index?: number };

/** A list item that fades up when it appears. */
export function RevealItem({ index = 0, ...rest }: RevealProps) {
  return <motion.li {...MOTION.reveal(index)} {...rest} />;
}

/** A block that fades up when it appears. */
export function RevealBlock({
  index = 0,
  ...rest
}: React.ComponentProps<typeof motion.div> & { index?: number }) {
  return <motion.div {...MOTION.reveal(index)} {...rest} />;
}

/** A block that fades up the first time it scrolls into view. */
export function RevealOnScroll({
  index = 0,
  ...rest
}: React.ComponentProps<typeof motion.div> & { index?: number }) {
  const { initial, transition } = MOTION.reveal(index);
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={transition}
      {...rest}
    />
  );
}

/** A list item that fades up the first time it scrolls into view. */
export function RevealItemOnScroll({
  index = 0,
  ...rest
}: React.ComponentProps<typeof motion.li> & { index?: number }) {
  const { initial, transition } = MOTION.reveal(index);
  return (
    <motion.li
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={transition}
      {...rest}
    />
  );
}
