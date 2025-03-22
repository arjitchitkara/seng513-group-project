
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassMorphismProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy' | 'ultra';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect?: boolean;
  animation?: 'none' | 'fadeIn' | 'slideUp' | 'scale';
  interactive?: boolean;
}

export const GlassMorphism = ({
  children,
  className,
  intensity = 'medium',
  border = true,
  rounded = 'lg',
  shadow = 'md',
  hoverEffect = false,
  animation = 'none',
  interactive = false,
}: GlassMorphismProps) => {
  const intensityMap = {
    light: 'bg-white/30 dark:bg-black/20 backdrop-blur-sm',
    medium: 'bg-white/50 dark:bg-black/30 backdrop-blur-md',
    heavy: 'bg-white/70 dark:bg-black/40 backdrop-blur-xl',
    ultra: 'bg-gradient-to-br from-white/70 to-white/40 dark:from-black/50 dark:to-black/30 backdrop-blur-2xl'
  };

  const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const shadowMap = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const animationMap = {
    none: {},
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5 }
    }
  };

  const hoverStyles = hoverEffect
    ? 'transition-all duration-300 hover:bg-white/60 dark:hover:bg-black/40 hover:shadow-lg hover:-translate-y-1'
    : '';

  const interactiveStyles = interactive
    ? 'cursor-pointer active:scale-98 transition-transform'
    : '';

  const Component = animation !== 'none' ? motion.div : 'div';
  
  const animationProps = animation !== 'none' ? animationMap[animation] : {};

  return (
    <Component
      className={cn(
        intensityMap[intensity],
        roundedMap[rounded],
        shadowMap[shadow],
        border && 'border border-white/20 dark:border-white/10',
        hoverStyles,
        interactiveStyles,
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
};
