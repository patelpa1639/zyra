'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MetricCard from '@/components/ui/MetricCard';

// Icons (using simple emoji for now, replace with lucide-react if available)
const StepsIcon = () => '👟';
const SleepIcon = () => '😴';
const HeartIcon = () => '❤️';
const CaloriesIcon = () => '🔥';

interface MetricData {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color: 'purple' | 'blue' | 'green';
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Fetch user data and metrics
    const fetchDashboardData = async () => {
      try {
        // Get user profile
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.full_name || userData.email || 'User');
        }

        // Fetch health metrics
        const metricsResponse = await fetch('/api/health/metrics?limit=100', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          const latestMetrics = processMetrics(metricsData.data || []);
          setMetrics(latestMetrics);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default mock data for demo
        setMetrics(getMockMetrics());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const processMetrics = (rawMetrics: any[]): MetricData[] => {
    const grouped: Record<string, any> = {};

    // Group by metric type and get latest
    rawMetrics.forEach((metric) => {
      if (!grouped[metric.metric_type]) {
        grouped[metric.metric_type] = metric;
      }
    });

    // Map to display metrics
    const metricColors: Record<string, 'purple' | 'blue' | 'green'> = {
      steps: 'purple',
      heart_rate: 'blue',
      sleep: 'green',
      calories: 'blue',
    };

    return Object.entries(grouped)
      .map(([type, data]) => {
        const valueNum = parseFloat(data.value);
        const trendValue = Math.floor(Math.random() * 15); // Mock trend

        return {
          title: type.replace('_', ' ').toUpperCase(),
          value: type === 'sleep' ? valueNum.toFixed(1) : Math.round(valueNum),
          unit: data.unit,
          icon:
            type === 'steps'
              ? StepsIcon()
              : type === 'sleep'
                ? SleepIcon()
                : type === 'heart_rate'
                  ? HeartIcon()
                  : CaloriesIcon(),
          trend: Math.random() > 0.5 ? 'up' : 'down',
          trendValue,
          color: metricColors[type] || 'purple',
        };
      })
      .slice(0, 4);
  };

  const getMockMetrics = (): MetricData[] => [
    {
      title: 'Steps',
      value: '8,437',
      unit: 'steps',
      icon: StepsIcon(),
      trend: 'up',
      trendValue: 12,
      color: 'purple',
    },
    {
      title: 'Sleep',
      value: '7.5',
      unit: 'hours',
      icon: SleepIcon(),
      trend: 'down',
      trendValue: 8,
      color: 'green',
    },
    {
      title: 'Heart Rate',
      value: '68',
      unit: 'bpm',
      icon: HeartIcon(),
      trend: 'stable',
      trendValue: 2,
      color: 'blue',
    },
    {
      title: 'Calories',
      value: '567',
      unit: 'kcal',
      icon: CaloriesIcon(),
      trend: 'up',
      trendValue: 5,
      color: 'blue',
    },
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const displayMetrics = metrics.length > 0 ? metrics : getMockMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userName || 'Athlete'}
            </h1>
            <p className="text-gray-400">
              Here's your health & fitness overview for today
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-pulse text-gray-400">Loading metrics...</div>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {displayMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <MetricCard
                    title={metric.title}
                    value={metric.value}
                    unit={metric.unit}
                    icon={metric.icon}
                    trend={metric.trend}
                    trendValue={metric.trendValue}
                    color={metric.color}
                    onClick={() => {
                      // Navigate to metric detail page
                      console.log(`Clicked on ${metric.title}`);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Insights Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-12"
            >
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  AI Insights
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-500/30">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-purple-300">
                        💡 Insight:
                      </span>{' '}
                      Your step count is trending up! Keep up the momentum — you're
                      on track for your daily goal.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-green-300">
                        😴 Sleep:
                      </span>{' '}
                      You're getting solid recovery. Consider maintaining this
                      routine.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Connect Health Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="mt-8"
            >
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Connect Health Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Strava', 'Garmin', 'Apple Health'].map((service) => (
                    <button
                      key={service}
                      className="p-4 rounded-lg border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 text-white font-medium group"
                    >
                      <span className="group-hover:translate-x-1 inline-block transition-transform">
                        {service}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
