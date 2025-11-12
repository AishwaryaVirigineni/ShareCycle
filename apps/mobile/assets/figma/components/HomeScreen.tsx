import { MapPin, Heart, MessageCircle, User, Search } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';

interface HomeScreenProps {
  onNavigateToChat: () => void;
  onRequestPad: () => void;
}

const nearbyRequests = [
  {
    id: 1,
    name: 'Emma',
    distance: '0.3 km away',
    time: '2 min ago',
    urgent: true
  },
  {
    id: 2,
    name: 'Sofia',
    distance: '0.5 km away',
    time: '8 min ago',
    urgent: false
  },
  {
    id: 3,
    name: 'Maya',
    distance: '0.8 km away',
    time: '15 min ago',
    urgent: false
  }
];

const nearbyHelpers = [
  { id: 1, name: 'Aria', distance: '0.2 km' },
  { id: 2, name: 'Luna', distance: '0.4 km' },
  { id: 3, name: 'Zara', distance: '0.6 km' }
];

export function HomeScreen({ onNavigateToChat, onRequestPad }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'request' | 'help'>('request');

  return (
    <div className="min-h-screen bg-[#FFFAF0]">
      {/* Header */}
      <div 
        className="px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFB6C1 0%, #E6D9F5 100%)'
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size={45} />
            <div>
              <h1 className="text-[#8B4367]">PadShare</h1>
              <p className="text-[#B88FB8] text-sm">Your location is active</p>
            </div>
          </div>
          <button className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
            <User className="w-5 h-5 text-[#D97BA6]" />
          </button>
        </div>

        {/* Location indicator */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm">
          <MapPin className="w-5 h-5 text-[#FF7F7F]" />
          <div className="flex-1">
            <p className="text-[#8B4367]">Downtown, City Center</p>
            <p className="text-[#B88FB8] text-sm">3 helpers nearby</p>
          </div>
          <button className="text-[#D97BA6]">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-6">
        <div className="flex gap-3 p-1 rounded-2xl bg-white shadow-md">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'request'
                ? 'bg-gradient-to-r from-[#FFB6C1] to-[#FFC0CB] text-white shadow-md'
                : 'text-[#B88FB8]'
            }`}
          >
            Need Help
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'help'
                ? 'bg-gradient-to-r from-[#E6D9F5] to-[#D8C7F0] text-white shadow-md'
                : 'text-[#B88FB8]'
            }`}
          >
            Can Help
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-24">
        {activeTab === 'request' ? (
          <div className="space-y-6">
            {/* Main Request Button */}
            <button
              onClick={onRequestPad}
              className="w-full p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FF7F7F 0%, #FFAA99 100%)'
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-white">Request Pad</h2>
                <p className="text-white/90">Send request to nearby helpers</p>
              </div>
            </button>

            {/* Map Placeholder */}
            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-[#E6D9F5] to-[#FFC0CB] p-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-white/70 mx-auto mb-2" />
                  <p className="text-white/80">Location-based matching</p>
                  <p className="text-white/60 text-sm mt-1">Find helpers nearby</p>
                </div>
              </div>
              
              {/* Nearby indicators */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white animate-pulse" />
              <div className="absolute bottom-8 right-8 w-3 h-3 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-white animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Active Requests Info */}
            <div className="p-5 rounded-2xl bg-white shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFB6C1] to-[#E6D9F5] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[#8B4367]">Active Requests Nearby</h4>
                  <p className="text-[#B88FB8] text-sm">{nearbyRequests.length} people need help</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {nearbyRequests.slice(0, 2).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FFFAF0] border border-[#FFE4E1]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFC0CB] to-[#FFAA99] flex items-center justify-center text-white text-sm">
                        {request.name[0]}
                      </div>
                      <div>
                        <p className="text-[#8B4367]">{request.name}</p>
                        <p className="text-[#B88FB8] text-xs">{request.distance}</p>
                      </div>
                    </div>
                    {request.urgent && (
                      <span className="px-2 py-1 rounded-full bg-[#FF7F7F]/20 text-[#FF7F7F] text-xs">
                        Urgent
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Help Instructions */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#E6D9F5] to-[#F3EDFC] shadow-md">
              <h3 className="text-[#8B4367] mb-2">Share with Care</h3>
              <p className="text-[#B88FB8] leading-relaxed">
                Accept a request below to connect and help someone nearby. All conversations are private and secure.
              </p>
            </div>

            {/* Nearby Requests to Accept */}
            <div>
              <h4 className="text-[#8B4367] mb-3 px-1">Requests Near You</h4>
              <div className="space-y-3">
                {nearbyRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB6C1] to-[#E6D9F5] flex items-center justify-center text-white">
                          {request.name[0]}
                        </div>
                        <div>
                          <p className="text-[#8B4367]">{request.name}</p>
                          <p className="text-[#B88FB8] text-sm">{request.distance}</p>
                        </div>
                      </div>
                      {request.urgent && (
                        <span className="px-3 py-1 rounded-full bg-[#FF7F7F]/20 text-[#FF7F7F] text-sm">
                          Urgent
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#B88FB8] text-sm mb-4">Requested {request.time}</p>
                    
                    <button
                      onClick={onNavigateToChat}
                      className="w-full py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #E6D9F5 0%, #D8C7F0 100%)'
                      }}
                    >
                      <span className="text-white">Accept & Connect</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safe Space Indicator */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FFFAF0] to-transparent pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg pointer-events-auto">
          <Heart className="w-4 h-4 text-[#FF7F7F]" />
          <p className="text-[#B88FB8] text-sm">Safe, private, & supportive</p>
        </div>
      </div>
    </div>
  );
}
