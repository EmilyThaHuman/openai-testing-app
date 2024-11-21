import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { MetricCard } from './MetricCard'
import { 
  Activity,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Clock,
  TrendingUp
} from 'lucide-react'

export function MetricsDashboard() {
  const { metrics, fetchMetrics } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        await fetchMetrics()
      } catch (error) {
        console.error('Failed to load metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMetrics()
  }, [fetchMetrics])

  // Ensure metrics values are numbers
  const safeMetrics = {
    total: Number(metrics?.total) || 0,
    chat: Number(metrics?.chat) || 0,
    images: Number(metrics?.images) || 0,
    audio: Number(metrics?.audio) || 0,
    responseTime: Number(metrics?.averageResponseTime) || 0,
    successRate: Number(metrics?.successRate) || 0
  }

  const metricsData = [
    {
      title: 'Total API Calls',
      value: safeMetrics.total,
      change: 12.5,
      icon: Activity,
      color: 'text-blue-500'
    },
    {
      title: 'Chat Completions',
      value: safeMetrics.chat,
      change: 8.2,
      icon: MessageSquare,
      color: 'text-green-500'
    },
    {
      title: 'Images Generated',
      value: safeMetrics.images,
      change: 15.3,
      icon: ImageIcon,
      color: 'text-purple-500'
    },
    {
      title: 'Audio Processed',
      value: safeMetrics.audio,
      change: 5.7,
      icon: Mic,
      color: 'text-orange-500'
    },
    {
      title: 'Avg Response Time',
      value: safeMetrics.responseTime,
      change: -2.1,
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'Success Rate',
      value: safeMetrics.successRate,
      change: 1.2,
      icon: TrendingUp,
      color: 'text-emerald-500'
    }
  ]

  if (isLoading) {
    return <div>Loading metrics...</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {metricsData.map((metric) => (
        <MetricCard
          key={metric.title}
          {...metric}
        />
      ))}
    </div>
  )
} 