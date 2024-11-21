import { cubicBezier } from 'framer-motion'

// Custom easing functions for smoother animations
const customEase = cubicBezier(0.6, 0.01, -0.05, 0.9)
const springEase = { type: "spring", stiffness: 100, damping: 10 }
const smoothEase = { type: "tween", ease: customEase, duration: 0.4 }

// Shared transition config
const sharedTransition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 0.5
}

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...sharedTransition,
      staggerChildren: 0.1,
      delayChildren: 0.1,
      when: "beforeChildren"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

export const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
    filter: 'blur(8px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...sharedTransition,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    filter: 'blur(8px)',
    transition: { duration: 0.2 }
  },
  hover: { 
    scale: 1.02,
    transition: springEase
  }
}

export const listItemVariants = {
  initial: { 
    opacity: 0, 
    x: -20,
    scale: 0.95 
  },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      ...sharedTransition
    }
  }),
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.01,
    transition: springEase
  }
}

export const containerVariants = {
  initial: { 
    opacity: 0,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ...sharedTransition,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      when: "afterChildren"
    }
  }
}

export const itemVariants = {
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: sharedTransition
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
}

export const overlayVariants = {
  initial: { 
    opacity: 0,
    backdropFilter: 'blur(0px)'
  },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...sharedTransition,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
}

// Utility function for staggered animations
export const stagger = (staggerChildren = 0.1, delayChildren = 0) => ({
  animate: {
    transition: {
      staggerChildren,
      delayChildren
    }
  }
})

// Reusable animation presets
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: sharedTransition },
  exit: { opacity: 0, y: -20 }
}

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: sharedTransition },
  exit: { scale: 0.95, opacity: 0 }
}

export const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: sharedTransition },
  exit: { x: -100, opacity: 0 }
} 