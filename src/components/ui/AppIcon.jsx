import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function AppIcon({ className, size = 'md', animate = true }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const MotionWrapper = animate ? motion.div : 'div'

  return (
    <MotionWrapper
      className={cn(
        "relative shrink-0",
        "rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-primary/10 to-primary/5",
        "shadow-lg shadow-primary/10",
        "border border-primary/10",
        sizes[size],
        className
      )}
      whileHover={animate ? { scale: 1.05 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      <svg 
        viewBox="0 0 2048 2048" 
        className="w-full h-full p-1"
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
      >
        <path 
          fill="currentColor" 
          className="text-primary"
          d="M 56.5158 5.13688 L 1992.01 5.13688 L 1992 1961.69 C 1992 1976.58 1999.34 2031.24 1985.25 2030.38 L 56.5158 2030.38 L 56.5158 5.13688 z M 997.23 598.997 L 996.457 600.914 C 1002.53 612.989 1011.18 624.196 1018.98 635.225 L 1382.14 1135.81 C 1402.27 1163.86 1421.2 1192.8 1441.93 1220.42 C 1399.25 1240.2 1327.96 1233.31 1281.85 1233.3 L 552.129 1233.28 L 552.129 1440 L 894.5 1440 L 1321.8 1440.02 C 1346.52 1440.04 1371.86 1441.14 1396.46 1438.96 C 1606.3 1420.38 1784.71 1239.23 1784.98 1026.53 C 1785.26 801.733 1609.93 616.996 1387.42 599.766 C 1368.38 598.292 1349.02 598.953 1329.93 598.966 L 1000.24 598.929 C 999.236 598.932 998.233 598.96 997.23 598.997 z M 266.416 598.997 C 267.781 692.144 266.403 785.536 266.403 878.704 L 266.416 1440 L 335.242 1440 C 336.65 1412.78 335.253 1384.78 335.247 1357.48 L 335.242 667.571 C 369.605 666.575 404.227 667.562 438.624 667.557 L 797.718 667.543 C 820.801 667.536 844.889 666.084 867.877 667.571 C 885.906 689.641 902.274 713.264 919.022 736.319 L 994.055 838.977 L 1131.59 1025.39 C 1147.68 1047.14 1162.13 1070.31 1178.94 1091.49 C 1151.47 1090.33 1123.83 1091.67 1096.32 1091.49 C 1081.78 1109.18 1056.57 1140.84 1044.6 1160.68 C 1134.81 1161.75 1225.1 1160.08 1315.33 1160.68 C 1296.41 1129.35 1272.05 1100.41 1250.55 1070.76 L 929.488 630.603 C 921.899 619.93 914.556 608.468 905.481 598.997 L 336.269 598.969 C 313.182 598.954 289.438 597.788 266.416 598.997 z M 454.149 739.42 C 439.269 739.417 424.368 739.242 409.49 739.42 L 409.49 1440 L 478.655 1440 C 479.533 1369.36 478.657 1298.6 478.656 1227.94 L 478.655 805.471 L 594.25 805.471 L 697.911 805.419 C 723.63 805.414 752.611 803.005 777.752 808.967 C 825.657 820.328 864.124 865.309 863.856 915.419 C 863.49 983.86 802.308 1006.83 765.615 1048.01 C 799.648 1048.02 833.867 1048.82 867.877 1048.01 C 994.709 935.047 921.314 747.634 763.373 739.636 C 728.562 737.873 692.92 739.395 658.031 739.415 L 454.149 739.42 z"
        />
        <path 
          fill="currentColor"
          className="text-primary/80"
          d="M 1232.81 808.961 C 1318.44 813.731 1398.1 792.03 1475.2 843.024 C 1576.73 910.177 1601.36 1043.5 1534.52 1144.54 C 1523.97 1158.75 1512.57 1171.99 1500.14 1184.59 C 1493.84 1177.92 1488.72 1169.21 1483.48 1161.65 L 1327.05 938.241 C 1301.22 901.808 1252.78 845.715 1232.81 808.961 z"
        />
        <path 
          fill="currentColor"
          className="text-primary/60"
          d="M 1128.4 667.571 C 1143.71 669.776 1159.87 667.624 1175.31 667.557 L 1298.63 667.533 C 1329.1 667.538 1359.96 666.604 1390.32 669.434 C 1578.79 686.999 1712.71 838.188 1712.46 1026.84 C 1712.26 1183.48 1599.14 1325.14 1447.46 1362.16 C 1394.27 1375.14 1340.28 1373.01 1286 1372.99 L 686.5 1372.97 L 620.269 1372.97 L 620.269 1300.52 C 640.817 1299.79 661.649 1300.5 682.223 1300.5 L 1309.24 1300.54 C 1348.4 1300.54 1387.76 1302.26 1426.28 1293.85 C 1550.67 1266.69 1645.03 1149.11 1645.01 1021.73 C 1644.99 883.546 1536.13 758.728 1398.59 742.183 C 1368.11 738.516 1336.96 739.383 1306.3 739.377 L 1183.08 739.42 C 1167.29 723.362 1140.41 686.831 1128.4 667.571 z"
        />
      </svg>
    </MotionWrapper>
  )
} 