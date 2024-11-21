import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStoreSelector } from '@/store/useStore';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function BillingPage() {
  const { theme } = useTheme();
  const { usage, currentPlan, fetchBillingDetails } = useStoreSelector(state => ({
    usage: state.usage,
    currentPlan: state.currentPlan,
    fetchBillingDetails: state.fetchBillingDetails
  }));
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize default usage data
  const defaultUsage = {
    total: 0,
    chat: 0,
    images: 0,
    audio: 0,
    history: [],
    responseTimes: [],
    recentActivity: [],
  };

  // Combine default with actual usage
  const currentUsage = { ...defaultUsage, ...usage };

  // Metrics for quick stats
  const metrics = [
    {
      title: 'Total API Calls',
      value: currentUsage.total || 0,
      change: '+12.5%',
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      title: 'Chat Completions',
      value: currentUsage.chat || 0,
      change: '+8.2%',
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      title: 'Images Generated',
      value: currentUsage.images || 0,
      change: '+15.3%',
      icon: ImageIcon,
      color: 'text-purple-500',
    },
    {
      title: 'Audio Processed',
      value: currentUsage.audio || 0,
      change: '+5.7%',
      icon: Mic,
      color: 'text-orange-500',
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchBillingDetails();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchBillingDetails]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading billing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium">Error loading billing details</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => fetchBillingDetails()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container max-w-7xl py-8 space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">API Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your API usage and performance metrics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Card className="p-6 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <pattern
                  id={`pattern-${index}`}
                  patternUnits="userSpaceOnUse"
                  width="20"
                  height="20"
                  className="text-gray-900"
                >
                  <rect width="4" height="4" fill="currentColor" />
                </pattern>
                <rect
                  width="100%"
                  height="100%"
                  fill={`url(#pattern-${index})`}
                />
              </div>

              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <span
                    className={`text-sm font-medium ${
                      metric.change.startsWith('+')
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </h3>
                  <p className="text-2xl font-bold">
                    {metric.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Usage Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold">API Usage Over Time</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={timeRange === '24h' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('24h')}
                >
                  24h
                </Button>
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('7d')}
                >
                  7d
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('30d')}
                >
                  30d
                </Button>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentUsage.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="chat"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="images"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="audio"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold">API Response Times</h2>
              <p className="text-sm text-muted-foreground">
                Average response time by endpoint
              </p>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentUsage.responseTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {currentUsage.recentActivity?.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {activity.type === 'success' ? (
                      <Zap className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{activity.endpoint}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.duration}ms
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default BillingPage;
