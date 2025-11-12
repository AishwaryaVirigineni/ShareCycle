import { ArrowLeft, Send, MapPin, Heart, Shield } from 'lucide-react';
import { useState } from 'react';

interface ChatScreenProps {
  onBack: () => void;
}

const messages = [
  {
    id: 1,
    text: 'Hi! Thank you so much for accepting my request 💕',
    sender: 'them',
    time: '2:34 PM',
    gradient: 'from-[#FFB6C1] to-[#FFC0CB]'
  },
  {
    id: 2,
    text: "Of course! I'm happy to help. Where would you like to meet?",
    sender: 'me',
    time: '2:35 PM',
    gradient: 'from-[#E6D9F5] to-[#F3EDFC]'
  },
  {
    id: 3,
    text: 'Is the coffee shop on Main Street okay? It\'s really close to both of us.',
    sender: 'them',
    time: '2:36 PM',
    gradient: 'from-[#FFB6C1] to-[#FFC0CB]'
  },
  {
    id: 4,
    text: "Perfect! I can be there in about 5 minutes. I'll be wearing a blue jacket 🌸",
    sender: 'me',
    time: '2:37 PM',
    gradient: 'from-[#E6D9F5] to-[#F3EDFC]'
  },
  {
    id: 5,
    text: 'Amazing! I really appreciate this. See you soon!',
    sender: 'them',
    time: '2:38 PM',
    gradient: 'from-[#FFB6C1] to-[#FFC0CB]'
  }
];

export function ChatScreen({ onBack }: ChatScreenProps) {
  const [messageText, setMessageText] = useState('');

  return (
    <div className="min-h-screen bg-[#FFFAF0] flex flex-col">
      {/* Header */}
      <div 
        className="px-6 pt-12 pb-4 rounded-b-[28px] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFB6C1 0%, #E6D9F5 100%)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#D97BA6]" />
          </button>
          
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7F7F] to-[#FFAA99] flex items-center justify-center shadow-md text-white">
              E
            </div>
            <div>
              <h3 className="text-[#8B4367]">Emma</h3>
              <p className="text-[#B88FB8] text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                0.3 km away
              </p>
            </div>
          </div>
          
          <div className="w-10" />
        </div>

        {/* Safety Notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-[#FF7F7F]" />
          <p className="text-[#8B4367] text-sm flex-1">Private & secure conversation</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-6 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-4 rounded-3xl shadow-md bg-gradient-to-br ${message.gradient} ${
                  message.sender === 'me' ? 'rounded-tr-md' : 'rounded-tl-md'
                }`}
              >
                <p className="text-white leading-relaxed">{message.text}</p>
              </div>
              <p className={`text-[#B88FB8] text-xs mt-1 px-2 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Suggestion Card */}
      <div className="px-6 pb-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFE4E1] border-2 border-[#FFB6C1]/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7F7F] to-[#FFAA99] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-[#8B4367] mb-1">Meeting Location</h4>
              <p className="text-[#B88FB8] text-sm mb-3">Coffee Shop, Main Street</p>
              <button className="px-4 py-2 rounded-xl bg-white text-[#D97BA6] text-sm shadow-sm hover:shadow-md transition-all">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Support Message */}
      <div className="px-6 pb-2">
        <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r from-[#FFB6C1]/20 to-[#E6D9F5]/20 w-fit mx-auto">
          <Heart className="w-4 h-4 text-[#FF7F7F]" />
          <p className="text-[#B88FB8] text-sm">Helping with dignity & care</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 pb-8 pt-2">
        <div className="flex items-center gap-3 p-2 rounded-3xl bg-white shadow-lg">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 px-4 py-3 bg-transparent outline-none text-[#8B4367] placeholder:text-[#D8C7F0]"
          />
          <button 
            className="w-12 h-12 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FFB6C1 0%, #E6D9F5 100%)'
            }}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
