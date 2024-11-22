// import { web-vitals } from 'web-vitals'
// import { Logger } from '@/lib/logger'

// export const reportWebVitals = () => {
//   web-vitals.getCLS((metric) => sendToAnalytics(metric))
//   web-vitals.getFID((metric) => sendToAnalytics(metric))
//   web-vitals.getLCP((metric) => sendToAnalytics(metric))
//   web-vitals.getFCP((metric) => sendToAnalytics(metric))
//   web-vitals.getTTFB((metric) => sendToAnalytics(metric))
// }

// const sendToAnalytics = (metric) => {
//   const { name, value, id } = metric

//   Logger.performance(name, {
//     value: Math.round(value),
//     id,
//     timestamp: new Date().toISOString(),
//   })
// } 