import { Link } from '@tanstack/react-router';
import React from 'react';

interface AnimatedUnderlineLinkProps {
  href: string;
  children: React.ReactNode;
}

const AnimatedUnderlineLink: React.FC<AnimatedUnderlineLinkProps> = ({
  href,
  children,
}) => {
  return (
    <Link href={href} className="group relative inline-block">
      <span className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
        {children}
      </span>
      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-neutral-900 dark:bg-neutral-100 transition-all duration-300 ease-in-out group-hover:w-full origin-right"></span>
    </Link>
  );
};

export default AnimatedUnderlineLink;
