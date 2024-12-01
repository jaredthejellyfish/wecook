import { Link } from '@tanstack/react-router';
import { motion } from "motion/react";
import { ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  isOwned: boolean;
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      delay: 0.15,
    },
  },
};

export default function RecipeNavigation({ title, isOwned }: Props) {
  return (
    <motion.div
      className="flex items-center gap-2 text-md"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <Link
        to={isOwned ? '/recipes' : '/recipes/public'}
        className="text-primary hover:text-primary/80 transition-colors"
      >
        {isOwned ? 'All Recipes' : 'Public Recipes'}
      </Link>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground font-medium">{title}</span>
    </motion.div>
  );
}
