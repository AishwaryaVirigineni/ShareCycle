import { motion } from 'motion/react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #FFFAF0 0%, #FFE4E1 30%, #E6D9F5 70%, #FFC0CB 100%)'
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        onAnimationComplete={() => {
          setTimeout(onComplete, 3500);
        }}
      >
        <Logo size={140} animate={true} />
      </motion.div>
      
      <motion.h1
        className="mt-12 text-[#D97BA6]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        PadShare
      </motion.h1>
      
      <motion.p
        className="mt-3 text-[#B88FB8] text-center px-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.3 }}
      >
        Support nearby, share with care
      </motion.p>

      <motion.div
        className="absolute bottom-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.8 }}
      >
        <p className="text-[#B88FB8] text-sm">A community of dignity & empathy</p>
      </motion.div>
    </motion.div>
  );
}
