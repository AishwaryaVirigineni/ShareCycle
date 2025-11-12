import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { RequestScreen } from './components/RequestScreen';

type Screen = 'splash' | 'home' | 'chat' | 'request';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  return (
    <div className="max-w-md mx-auto bg-[#FFFAF0] min-h-screen relative overflow-hidden shadow-2xl">
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={() => setCurrentScreen('home')} />
      )}
      
      {currentScreen === 'home' && (
        <HomeScreen 
          onNavigateToChat={() => setCurrentScreen('chat')}
          onRequestPad={() => setCurrentScreen('request')}
        />
      )}
      
      {currentScreen === 'request' && (
        <RequestScreen 
          onCancel={() => setCurrentScreen('home')}
          onBack={() => setCurrentScreen('home')}
        />
      )}
      
      {currentScreen === 'chat' && (
        <ChatScreen onBack={() => setCurrentScreen('home')} />
      )}
    </div>
  );
}
