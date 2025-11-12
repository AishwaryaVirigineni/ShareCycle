import { motion } from 'motion/react';
import { MapPin, Clock, X } from 'lucide-react';

interface RequestScreenProps {
  onCancel: () => void;
  onBack: () => void;
}

export function RequestScreen({ onCancel, onBack }: RequestScreenProps) {
  return (
    <div className="min-h-screen bg-[#FFFAF0]">
      {/* Header */}
      <div 
        className="px-6 pt-12 pb-8 rounded-b-[32px] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FF7F7F 0%, #FFAA99 100%)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white">Request Sent</h2>
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <X className="w-5 h-5 text-[#FF7F7F]" />
          </button>
        </div>
        
        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-[#FF7F7F]" />
            <div className="flex-1">
              <p className="text-[#8B4367]">Downtown, City Center</p>
              <p className="text-[#B88FB8] text-sm">Request sent to 3 nearby helpers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Searching Animation */}
      <div className="px-6 py-12">
        <div className="flex flex-col items-center justify-center">
          <motion.div
            className="relative w-32 h-32 mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pulsing circles */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#FFB6C1]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#E6D9F5]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5
              }}
            />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB6C1] to-[#E6D9F5] flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          <h3 className="text-[#8B4367] mb-2">Finding nearby helpers...</h3>
          <p className="text-[#B88FB8] text-center px-8 leading-relaxed">
            You'll be notified when someone accepts your request
          </p>
        </div>

        {/* Request Details */}
        <div className="mt-12 space-y-4">
          <div className="p-6 rounded-2xl bg-white shadow-md">
            <h4 className="text-[#8B4367] mb-4">Request Details</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFAF0]">
                <span className="text-[#B88FB8]">Status</span>
                <span className="text-[#FF7F7F]">Searching</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFAF0]">
                <span className="text-[#B88FB8]">Sent to</span>
                <span className="text-[#8B4367]">3 nearby helpers</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFAF0]">
                <span className="text-[#B88FB8]">Max distance</span>
                <span className="text-[#8B4367]">1 km radius</span>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E6D9F5] to-[#F3EDFC] shadow-md">
            <h4 className="text-[#8B4367] mb-3">Safety Tips</h4>
            <ul className="space-y-2 text-[#B88FB8] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#FFB6C1] mt-1">•</span>
                <span>Meet in a public, well-lit location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFB6C1] mt-1">•</span>
                <span>Let someone know where you're going</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFB6C1] mt-1">•</span>
                <span>Keep conversations on the app until you meet</span>
              </li>
            </ul>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-4 rounded-2xl bg-white text-[#B88FB8] shadow-md hover:shadow-lg transition-all active:scale-[0.98] border-2 border-[#FFE4E1]"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
}
