'use client';

import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface StatBoxProps {
  label: string;
  value: number;
  color: string;
  index: number;
}

export function StatBox({ label, value, color, index }: StatBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
        <dd className={`mt-1 text-3xl font-semibold ${color}`}>
          <AnimatedCounter value={value} />
        </dd>
      </div>
    </motion.div>
  );
}
