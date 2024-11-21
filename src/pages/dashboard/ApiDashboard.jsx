import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  RefreshCw,
  Calendar,
  BarChart2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { cardVariants, listItemVariants, containerVariants } from '@/config/animations';
import { cn } from '@/lib/utils';

// Enhanced loading state component
const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <p className="text-muted-foreground animate-pulse">
        Loading dashboard data...
      </p>
    </motion.div>
  </div>
)

// Enhanced error state component
const ErrorState = ({ error, onRetry }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex-1 flex items-center justify-center"
  >
    <div className="flex flex-col items-center gap-4 text-center max-w-md">
      <div className="p-3 rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">Failed to load dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button 
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  </motion.div>
)

// Enhanced metric card component
const MetricCard = ({ metric, index }) => {
  const Icon = metric.icon

  return (
    <motion.div
      variants={listItemVariants}
      custom={index}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className="p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className={cn("h-5 w-5 transition-colors", metric.color)} />
            </div>
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-sm font-medium px-2 py-1 rounded-full",
                metric.change.startsWith('+') 
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {metric.change}
            </motion.span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </h3>
            <motion.p 
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {metric.value.toLocaleString()}
            </motion.p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Enhanced chart card component
const ChartCard = ({ title, children, className }) => (
  <motion.div variants={listItemVariants}>
    <Card className={cn("p-6 hover:shadow-lg transition-all duration-300", className)}>
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </Card>
  </motion.div>
)

export function ApiDashboard() {
  const { theme } = useTheme();
  const {
    usage,
    currentPlan,
    timeRange,
    isLoadingBilling,
    billingError,
    fetchBillingDetails,
    setTimeRange,
  } = useStoreSelector(state => ({
    usage: state.usage,
    currentPlan: state.currentPlan,
    timeRange: state.timeRange,
    isLoadingBilling: state.isLoadingBilling,
    billingError: state.billingError,
    fetchBillingDetails: state.fetchBillingDetails,
    setTimeRange: state.setTimeRange,
  }));

  // Memoize metrics
  const metrics = useMemo(
    () => [
      {
        title: 'Total API Calls',
        value: usage?.total || 0,
        change: '+12.5%',
        icon: Activity,
        color: 'text-blue-500',
      },
      {
        title: 'Chat Completions',
        value: usage?.chat || 0,
        change: '+8.2%',
        icon: MessageSquare,
        color: 'text-green-500',
      },
      {
        title: 'Images Generated',
        value: usage?.images || 0,
        change: '+15.3%',
        icon: ImageIcon,
        color: 'text-purple-500',
      },
      {
        title: 'Audio Processed',
        value: usage?.audio || 0,
        change: '+5.7%',
        icon: Mic,
        color: 'text-orange-500',
      },
    ],
    [usage]
  );

  const handleTimeRangeChange = useCallback(
    range => {
      setTimeRange(range);
    },
    [setTimeRange]
  );

  const handleRetry = useCallback(() => {
    fetchBillingDetails();
  }, [fetchBillingDetails]);

  useEffect(() => {
    fetchBillingDetails();
  }, [timeRange, fetchBillingDetails]);

  if (isLoadingBilling) {
    return <LoadingState />;
  }

  if (billingError) {
    return <ErrorState error={billingError} onRetry={handleRetry} />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container max-w-7xl py-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={listItemVariants} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">API Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your API usage and performance metrics
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} metric={metric} index={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="API Usage Over Time">
          <div className="flex items-center gap-2 mb-6">
            {['24h', '7d', '30d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange(range)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {range}
              </Button>
            ))}
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usage?.history}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
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
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="images"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="audio"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="API Response Times">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usage?.responseTimes}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
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
                <Bar 
                  dataKey="time" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Recent Activity">
        <motion.div variants={listItemVariants} className="space-y-4">
          {usage?.recentActivity?.map((activity, index) => (
            <motion.div
              key={activity.id}
              variants={listItemVariants}
              custom={index}
              className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  activity.type === 'success' 
                    ? "bg-green-100 text-green-600" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  {activity.type === 'success' ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
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
        </motion.div>
      </ChartCard>
    </motion.div>
  );
}

export default ApiDashboard;
