const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[INFO]', ...args)
    }
  },
  
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WARN]', ...args)
    }
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args)
  },
  
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args)
    }
  },

  trace: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.trace('[TRACE]', ...args)
    }
  }
}

export default logger 