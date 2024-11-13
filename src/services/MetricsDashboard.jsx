// MetricsDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { apiTracker } from './ApiTracker';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Clock, TrendingUp, Layers,
  AlertTriangle, ArrowUp, ArrowDown, 
  RefreshCw, Zap
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, Number(value), {
      duration: 1,
      ease: "easeOut" 
    });
    return controls.stop;
  }, [value]);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl border bg-card shadow-lg`}
      style={{
        background: `linear-gradient(135deg, var(--${color}-50) 0%, var(--${color}-100) 100%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold">{rounded.get()}</h3>
            {change && (
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />}
                {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full bg-${color}-200/50`}>
            <Icon className={`h-6 w-6 text-${color}-700`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EndpointMetrics = ({ metrics }) => {
  const latencyData = useMemo(() => {
    return metrics.details?.map(detail => ({
      timestamp: new Date(detail.timestamp).toLocaleTimeString(),
      duration: detail.duration
    })) || [];
  }, [metrics.details]);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="latency">Latency</TabsTrigger>
        <TabsTrigger value="errors">Errors</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Calls"
            value={metrics.calls}
            icon={Activity}
            color="blue"
          />
          <MetricCard
            title="Error Rate"
            value={((metrics.errors.length / metrics.calls) * 100).toFixed(1) + '%'}
            icon={AlertTriangle}
            color="red"
          />
        </div>
        
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-2">Rate Limits</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Remaining</span>
              <span className="font-medium">
                {metrics.rateLimit?.remaining || 'N/A'}
              </span>
            </div>
            <Progress 
              value={((metrics.rateLimit?.remaining || 0) / (metrics.rateLimit?.limit || 1)) * 100} 
            />
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="latency">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={latencyData}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="duration"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#latencyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="errors">
        {metrics.errors.length > 0 ? (
          <div className="space-y-2">
            {metrics.errors.map((error, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800">{error.message}</p>
                <span className="text-xs text-red-600">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No errors recorded
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

// Add this component definition before MetricsDashboard
// Add the missing EndpointList component
const EndpointList = ({ endpoints, selectedEndpoint, onSelect }) => {
  return (
    <div className="space-y-2">
      {endpoints.map((endpoint) => (
        <motion.div
          key={endpoint.path}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect(endpoint.path)}
          className={`p-3 rounded-lg cursor-pointer ${
            selectedEndpoint === endpoint.path
              ? 'bg-primary/10 border border-primary'
              : 'bg-card hover:bg-accent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{endpoint.path}</p>
              <p className="text-sm text-muted-foreground">
                {endpoint.method} • {endpoint.metrics.calls} calls
              </p>
            </div>
            <Badge variant={endpoint.metrics.errors.length > 0 ? 'destructive' : 'secondary'}>
              {endpoint.metrics.errors.length} errors
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(apiTracker.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const endpointList = metrics.endpoints || [];
  const selectedMetrics = selectedEndpoint ? 
    apiTracker.getMetrics(selectedEndpoint) : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-6"
    >
      <Card className="p-6">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold mb-6"
        >
          API Metrics Dashboard
        </motion.h2>
        
        <div className="grid grid-cols-3 gap-6">
          <MetricCard
            title="Total API Calls"
            value={metrics.totalCalls}
            change={10} // Calculate actual change
            icon={Activity}
          />
          <MetricCard
            title="Active Endpoints"
            value={endpointList.length}
            icon={Layers}
          />
          <MetricCard
            title="Error Rate"
            value={`${((endpointList.reduce((acc, ep) => 
              acc + (ep.metrics.errors.length || 0), 0) / 
              metrics.totalCalls) * 100).toFixed(2)}%`}
            icon={AlertTriangle}
          />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Endpoints</h3>
          <EndpointList 
            endpoints={endpointList}
            selectedEndpoint={selectedEndpoint}
            onSelect={setSelectedEndpoint}
          />
        </Card>

        <Card className="col-span-2 p-6">
          <AnimatePresence mode="wait">
            {selectedMetrics ? (
              <motion.div
                key={selectedEndpoint}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-bold mb-4">{selectedEndpoint}</h3>
                <DetailedMetrics metrics={selectedMetrics} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-muted-foreground"
              >
                Select an endpoint to view detailed metrics
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </motion.div>
  );
};

export default MetricsDashboard;  