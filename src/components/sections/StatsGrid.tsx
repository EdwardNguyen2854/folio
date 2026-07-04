import { staggerItemVariants } from '../motion/StaggerReveal';
import { motion } from 'framer-motion';

type StatsGridProps = {
  total: number;
  favorites: number;
  production: number;
  averageRating: number;
};

export function StatsGrid({ total, favorites, production, averageRating }: StatsGridProps) {
  const stats = [
    { label: 'Total', value: total },
    { label: 'Favorites', value: favorites },
    { label: 'Ready', value: production },
    { label: 'Avg rating', value: averageRating ? averageRating.toFixed(1) : '\u2014' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={staggerItemVariants()}
          className="border border-border rounded-[14px] bg-surface p-4 shadow-sm"
        >
          <span className="block text-xs text-muted mb-1.5">{stat.label}</span>
          <strong className="text-2xl font-[700] tracking-tight text-text">{stat.value}</strong>
        </motion.div>
      ))}
    </div>
  );
}
