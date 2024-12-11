import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
}

interface AchievementsProps {
  achievements: Achievement[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function Achievements({ achievements }: AchievementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <motion.div key={achievement.id} variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">{achievement.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
              <Progress
                value={(achievement.progress / achievement.total) * 100}
                className="h-1"
              />
              <p className="text-xs text-muted-foreground text-right">
                {achievement.progress}/{achievement.total}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 