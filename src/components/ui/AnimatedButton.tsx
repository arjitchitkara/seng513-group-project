
import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
  hoverLift?: boolean;
  ripple?: boolean;
  glowing?: boolean;
  gradient?: boolean;
  outlined?: boolean;
  iconButton?: boolean;
}

export const AnimatedButton = ({
  children,
  className,
  hoverScale = false,
  hoverLift = true,
  ripple = false,
  glowing = false,
  gradient = false,
  outlined = false,
  iconButton = false,
  ...props
}: AnimatedButtonProps) => {
  const [isRippling, setIsRippling] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: -1, y: -1 });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsRippling(true);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  React.useEffect(() => {
    if (isRippling) {
      const timer = setTimeout(() => setIsRippling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isRippling]);

  return (
    <motion.div
      whileHover={hoverScale ? { scale: 1.05 } : hoverLift ? { y: -4 } : {}}
      className={cn(
        "relative",
        glowing && "animate-pulse",
        iconButton && "rounded-full overflow-hidden"
      )}
    >
      <Button
        {...props}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          gradient && 'bg-gradient-to-r from-primary to-primary/70 hover:from-primary hover:to-primary/90',
          outlined && 'border-2 border-primary bg-transparent text-primary hover:bg-primary/10',
          glowing && 'shadow-[0_0_15px] shadow-primary/50',
          iconButton && 'rounded-full aspect-square flex items-center justify-center p-0',
          className
        )}
        onClick={handleClick}
      >
        {ripple && isRippling && (
          <span
            className="absolute rounded-full bg-white/30 animate-[ripple_0.5s_ease-out]"
            style={{
              left: coords.x,
              top: coords.y,
              width: '150px',
              height: '150px',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}
        {children}
      </Button>
    </motion.div>
  );
};

// Add keyframes for ripple animation in index.css
