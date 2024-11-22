import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import mixpanel from '@analytics/mixpanel'

const analytics = Analytics({
  app: 'openai-testing',
  plugins: [
    googleAnalytics({
      measurementId: import.meta.env.VITE_GA_ID,
    }),
    mixpanel({
      token: import.meta.env.VITE_MIXPANEL_TOKEN,
    }),
  ],
})

export const trackEvent = (eventName, properties = {}) => {
  analytics.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

export const trackPageView = (page) => {
  analytics.page({
    url: window.location.href,
    path: window.location.pathname,
    title: page,
  })
} 