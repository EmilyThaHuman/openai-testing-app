import React from 'react';
import { Card } from '@/components/ui/card';
import MetricsDashboard from '@/services/MetricsDashboard';

export const ApiDashboard = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">API Dashboard</h1>
        <MetricsDashboard />
      </Card>
    </div>
  );
};

export default ApiDashboard;
