import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function AppIcon({ size = 'md', className, animate = true }) {
  const MotionWrapper = motion.div;

  return (
    <MotionWrapper
      className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/10',
        sizeClasses[size],
        className
      )}
      animate={animate ? {
        scale: 1,
        transition: { duration: 0.2 }
      } : undefined}
      whileHover={animate ? {
        scale: 1.05,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={animate ? {
        scale: 0.95,
        transition: { duration: 0.1 }
      } : undefined}
    >
      <svg 
        viewBox="0 0 2048 2048" 
        className="w-full h-full p-1"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        <path 
          fill="currentColor" 
          className="text-primary"
          d="M 56.5158 5.13688 L 1992.01 5.13688 L 1992 1961.69 C 1992 1976.58 1999.34 2031.24 1985.25 2030.38 L 56.5158 2030.38 L 56.5158 5.13688 z M 997.23 598.997 L 996.457 600.914 C 1002.53 612.989 1011.18 624.196 1018.98 635.225 L 1382.14 1135.81 C 1402.27 1163.86 1421.2 1192.8 1441.93 1220.42 C 1399.25 1240.2 1327.96 1233.31 1281.85 1233.3 L 552.129 1233.28 L 552.129 1440 L 894.5 1440 L 1321.8 1440.02 C 1346.52 1440.04 1371.86 1441.14 1396.46 1438.96 C 1606.3 1420.38 1784.71 1239.23 1784.98 1026.53 C 1785.26 801.733 1609.93 616.996 1387.42 599.766 C 1368.38 598.292 1349.02 598.953 1329.93 598.966 L 1000.24 598.929 C 999.236 598.932 998.233 598.96 997.23 598.997 z"
        />
      </svg>
    </MotionWrapper>
  );
}

AppIcon.displayName = 'AppIcon';
