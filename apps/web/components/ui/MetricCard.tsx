'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: 'purple' | 'blue' | 'green';
  backgroundColor?: string;
  onClick?: () => void;
}

const colorSchemes = {
  purple: {
    bg: 'from-purple-900/20 to-purple-800/10',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    icon: 'text-purple-300',
  },
  blue: {
    bg: 'from-blue-900/20 to-blue-800/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    icon: 'text-blue-300',
  },
  green: {
    bg: 'from-green-900/20 to-green-800/10',
    border: 'border-green-500/30',
    accent: 'text-green-400',
    icon: 'text-green-300',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = 'purple',
  backgroundColor,
  onClick,
}) => {
  const scheme = colorSchemes[color];

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -4, scale: 1.02 },
  };

  const valueVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  const trendVariants = {
    up: { rotate: 0, color: '#10b981' },
    down: { rotate: 180, color: '#ef4444' },
    stable: { rotate: 0, color: '#6b7280' },
  };

  const getTrendLabel = () => {
    if (!trend || !trendValue) return null;

    const symbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    const colors = {
      up: 'text-green-400',
      down: 'text-red-400',
      stable: 'text-gray-400',
    };

    return (
      <span className={`text-sm font-semibold ${colors[trend]}`}>
        {symbol} {Math.abs(trendValue)}%
      </span>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
      onClick={onClick}
      className={`group cursor-pointer relative`}
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${scheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Card */}
      <div
        className={`relative p-6 rounded-xl border ${scheme.border} bg-slate-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300`}
      >
        {/* Animated background glow */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-30 blur-2xl pointer-events-none`}
          animate={{
            background: `radial-gradient(circle at 50% 50%, ${color === 'purple' ? 'rgba(147, 51, 234, 0.3)' : color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}, transparent)`,
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-300 mb-4 group-hover:text-gray-100 transition-colors duration-300">
              {title}
            </h3>

            {/* Value and Unit */}
            <motion.div
              variants={valueVariants}
              className="flex items-baseline gap-1 mb-3"
            >
              <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {value}
              </span>
              {unit && <span className="text-sm text-gray-400">{unit}</span>}
            </motion.div>

            {/* Trend indicator */}
            {trend && <div className="flex items-center gap-1">{getTrendLabel()}</div>}
          </div>

          {/* Icon */}
          <motion.div
            className={`${scheme.icon} text-3xl opacity-80 group-hover:opacity-100 transition-all duration-300`}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'loop' }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent ${
            color === 'purple'
              ? 'via-purple-500 to-transparent'
              : color === 'blue'
                ? 'via-blue-500 to-transparent'
                : 'via-green-500 to-transparent'
          }`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export default MetricCard;
