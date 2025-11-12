import { motion } from 'motion/react';

interface LogoProps {
  size?: number;
  animate?: boolean;
}

export function Logo({ size = 100, animate = false }: LogoProps) {
  // Animation variants for the two women
  const leftWomanVariants = {
    initial: { x: -40, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const rightWomanVariants = {
    initial: { x: 40, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const padVariants = {
    initial: { x: -20, opacity: 0, scale: 0 },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const padTransferVariants = {
    initial: { x: -10 },
    animate: {
      x: 10,
      transition: {
        delay: 1.4,
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 0.7, 0.4],
      transition: {
        delay: 1.8,
        duration: 1.2,
        times: [0, 0.5, 1],
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 182, 193, 0.7) 0%, rgba(230, 217, 245, 0.4) 50%, transparent 70%)'
          }}
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
      )}
      
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left woman - giving */}
        <motion.g
          variants={animate ? leftWomanVariants : {}}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
        >
          {/* Head */}
          <circle cx="28" cy="25" r="10" fill="url(#gradient-pink)" />
          
          {/* Hair/head detail */}
          <path
            d="M 23 20 Q 28 15, 33 20"
            stroke="url(#gradient-pink-dark)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body - dress/figure shape */}
          <path
            d="M 28 35 L 28 58 Q 28 60, 26 60 L 22 60 M 28 35 Q 28 60, 30 60 L 34 60"
            stroke="url(#gradient-pink)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Shoulders/torso */}
          <ellipse
            cx="28"
            cy="40"
            rx="8"
            ry="12"
            fill="url(#gradient-pink)"
            opacity="0.6"
          />
          
          {/* Left arm - extended */}
          <motion.path
            d="M 28 40 Q 35 40, 40 45"
            stroke="url(#gradient-pink)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={animate ? { pathLength: 0 } : undefined}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={animate ? { delay: 0.4, duration: 0.6 } : undefined}
          />
          
          {/* Hand */}
          <motion.circle
            cx="40"
            cy="45"
            r="3"
            fill="url(#gradient-pink-dark)"
            initial={animate ? { scale: 0 } : undefined}
            animate={animate ? { scale: 1 } : undefined}
            transition={animate ? { delay: 0.8, duration: 0.3 } : undefined}
          />
        </motion.g>

        {/* Right woman - receiving */}
        <motion.g
          variants={animate ? rightWomanVariants : {}}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
        >
          {/* Head */}
          <circle cx="72" cy="25" r="10" fill="url(#gradient-coral)" />
          
          {/* Hair/head detail */}
          <path
            d="M 67 20 Q 72 15, 77 20"
            stroke="url(#gradient-coral-dark)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body - dress/figure shape */}
          <path
            d="M 72 35 L 72 58 Q 72 60, 70 60 L 66 60 M 72 35 Q 72 60, 74 60 L 78 60"
            stroke="url(#gradient-coral)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Shoulders/torso */}
          <ellipse
            cx="72"
            cy="40"
            rx="8"
            ry="12"
            fill="url(#gradient-coral)"
            opacity="0.6"
          />
          
          {/* Right arm - extended to receive */}
          <motion.path
            d="M 72 40 Q 65 40, 60 45"
            stroke="url(#gradient-coral)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            initial={animate ? { pathLength: 0 } : undefined}
            animate={animate ? { pathLength: 1 } : undefined}
            transition={animate ? { delay: 0.4, duration: 0.6 } : undefined}
          />
          
          {/* Hand */}
          <motion.circle
            cx="60"
            cy="45"
            r="3"
            fill="url(#gradient-coral-dark)"
            initial={animate ? { scale: 0 } : undefined}
            animate={animate ? { scale: 1 } : undefined}
            transition={animate ? { delay: 0.8, duration: 0.3 } : undefined}
          />
        </motion.g>

        {/* Sanitary pad being shared */}
        <motion.g
          variants={animate ? padVariants : {}}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
        >
          <motion.g
            variants={animate ? padTransferVariants : {}}
            initial={animate ? "initial" : undefined}
            animate={animate ? "animate" : undefined}
          >
            {/* Pad shape - more recognizable */}
            <rect
              x="44"
              y="40"
              width="12"
              height="18"
              rx="6"
              fill="url(#gradient-lavender)"
              stroke="#E6D9F5"
              strokeWidth="1.5"
            />
            
            {/* Pad detail - center line */}
            <rect
              x="48"
              y="43"
              width="4"
              height="12"
              rx="2"
              fill="url(#gradient-cream)"
              opacity="0.8"
            />
            
            {/* Pad wings - subtle */}
            <ellipse
              cx="44"
              cy="49"
              rx="2"
              ry="4"
              fill="url(#gradient-lavender)"
              opacity="0.7"
            />
            <ellipse
              cx="56"
              cy="49"
              rx="2"
              ry="4"
              fill="url(#gradient-lavender)"
              opacity="0.7"
            />
          </motion.g>
        </motion.g>

        {/* Heart/care symbol above */}
        <motion.g
          initial={animate ? { scale: 0, y: 10, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, y: 0, opacity: 1 } : undefined}
          transition={animate ? { delay: 2.2, duration: 0.5, ease: "backOut" } : undefined}
        >
          <path
            d="M 50 68 C 50 68, 45 63, 45 60 C 45 57, 47 55, 50 55 C 53 55, 55 57, 55 60 C 55 63, 50 68, 50 68 Z"
            fill="url(#gradient-heart)"
            opacity="0.8"
          />
        </motion.g>

        {/* Connecting arc between hands */}
        <motion.path
          d="M 40 45 Q 50 42, 60 45"
          stroke="url(#gradient-connect)"
          strokeWidth="1.5"
          strokeDasharray="2,2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
          initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animate ? { pathLength: 1, opacity: 0.4 } : undefined}
          transition={animate ? { delay: 1.0, duration: 0.5 } : undefined}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="100%" stopColor="#FFC0CB" />
          </linearGradient>
          <linearGradient id="gradient-pink-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9EAE" />
            <stop offset="100%" stopColor="#FFB6C1" />
          </linearGradient>
          <linearGradient id="gradient-coral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7F7F" />
            <stop offset="100%" stopColor="#FFAA99" />
          </linearGradient>
          <linearGradient id="gradient-coral-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FF7F7F" />
          </linearGradient>
          <linearGradient id="gradient-lavender" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6D9F5" />
            <stop offset="100%" stopColor="#D8C7F0" />
          </linearGradient>
          <linearGradient id="gradient-cream" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFAF0" />
            <stop offset="100%" stopColor="#FFF8E7" />
          </linearGradient>
          <linearGradient id="gradient-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#E6D9F5" />
            <stop offset="100%" stopColor="#FFAA99" />
          </linearGradient>
          <linearGradient id="gradient-connect" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#E6D9F5" />
            <stop offset="100%" stopColor="#FFAA99" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
