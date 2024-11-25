import { motion } from "framer-motion";
import React from "react";

type Props = {
  isOpen: boolean;
  toggleMenu: () => void;
};

function HamburgerButton({ isOpen, toggleMenu }: Props) {
  return (
    <button
      onClick={toggleMenu}
      className="w-10 h-10 focus:outline-none flex items-center justify-center mt-2 md:hidden"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <svg width="23" height="23" viewBox="0 0 23 23">
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="black"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 2.5 L 20 2.5" },
            open: { d: "M 3 16.5 L 17 2.5" },
          }}
          animate={isOpen ? "open" : "closed"}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="black"
          strokeLinecap="round"
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          animate={isOpen ? "open" : "closed"}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="black"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 16.346 L 20 16.346" },
            open: { d: "M 3 2.5 L 17 16.346" },
          }}
          animate={isOpen ? "open" : "closed"}
        />
      </svg>
    </button>
  );
}

export default HamburgerButton;
