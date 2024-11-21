import { useState, useMemo } from "react";
import { useStoreSelector } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { shallow } from "zustand/shallow";

export const PerformanceMonitor = () => {
  const [view, setView] = useState("overview");
  
  // Use shallow comparison to prevent unnecessary rerenders
  const { 
    apiLatency, 
    endpointStats, 
    apiErrors 
  } = useStoreSelector(
    (state) => ({
      apiLatency: state.metrics.apiLatency,
      endpointStats: state.metrics.endpointStats,
      apiErrors: state.metrics.apiErrors,
    }),
    shallow
  );

  // Memoize data transformations
  const formattedLatencyData = useMemo(() => 
    apiLatency.map((m) => ({
      timestamp: new Date(m.timestamp).toLocaleTimeString(),
      value: m.duration,
      name: m.endpoint,
    })).slice(-20),
    [apiLatency]
  );

  const totalRequests = useMemo(() => 
    Object.values(endpointStats).reduce(
      (acc, stat) => acc + stat.totalCalls,
      0
    ),
    [endpointStats]
  );

  const errorRate = useMemo(() => 
    apiLatency.length ? 
      ((apiErrors.length / apiLatency.length) * 100).toFixed(1) : 
      "0.0",
    [apiErrors.length, apiLatency.length]
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <h4 className="font-semibold">API Overview</h4>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3">
          <div className="text-sm font-medium">Total Requests</div>
          <div className="text-2xl">{totalRequests}</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm font-medium">Error Rate</div>
          <div className="text-2xl">{errorRate}%</div>
        </Card>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedLatencyData}>
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderEndpoints = () => (
    <div className="space-y-4">
      <h4 className="font-semibold">Endpoint Performance</h4>
      <div className="space-y-2">
        {Object.entries(endpointStats).map(([endpoint, stats]) => (
          <Card key={endpoint} className="p-3">
            <div className="text-sm font-medium">{endpoint}</div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div>Calls: {stats.totalCalls}</div>
              <div>Avg: {stats.avgLatency.toFixed(0)}ms</div>
              <div>Errors: {stats.errors}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderErrors = () => (
    <div className="space-y-4">
      <h4 className="font-semibold">Recent Errors</h4>
      <div className="space-y-2">
        {apiErrors.slice(-10).map((error, index) => (
          <Card key={index} className="p-3 bg-red-50">
            <div className="text-sm font-medium">{error.endpoint}</div>
            <div className="text-sm text-red-600">{error.error}</div>
            <div className="text-xs text-gray-500">
              {new Date(error.timestamp).toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="fixed bottom-4 right-4 p-4 w-96">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Performance Monitor</h3>
        <div className="flex gap-2">
          <Button
            variant={view === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("overview")}
          >
            Overview
          </Button>
          <Button
            variant={view === "endpoints" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("endpoints")}
          >
            Endpoints
          </Button>
          <Button
            variant={view === "errors" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("errors")}
          >
            Errors
          </Button>
        </div>
      </div>

      {view === "overview" && renderOverview()}
      {view === "endpoints" && renderEndpoints()}
      {view === "errors" && renderErrors()}
    </Card>
  );
};
