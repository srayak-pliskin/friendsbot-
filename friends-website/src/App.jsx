import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Loader2, Info, Volume2, VolumeX, Sparkles } from 'lucide-react';

// Character backgrounds
const characterBackgrounds = {
  Rachel: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&q=80',
  Ross: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1200&q=80',
  Monica: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80',
  Chandler: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  Joey: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80',
  Phoebe: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80'
};

// Character themes
const characterThemes = {
  Rachel: {
    primary: '#C084FC',
    secondary: '#E9D5FF',
    accent: '#A855F7',
    gradient: 'from-purple-500/20 via-pink-500/10 to-purple-500/20'
  },
  Ross: {
    primary: '#3B82F6',
    secondary: '#BFDBFE',
    accent: '#2563EB',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-blue-500/20'
  },
  Monica: {
    primary: '#EF4444',
    secondary: '#FECACA',
    accent: '#DC2626',
    gradient: 'from-red-500/20 via-orange-500/10 to-red-500/20'
  },
  Chandler: {
    primary: '#F59E0B',
    secondary: '#FDE68A',
    accent: '#D97706',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-500/20'
  },
  Joey: {
    primary: '#10B981',
    secondary: '#A7F3D0',
    accent: '#059669',
    gradient: 'from-green-500/20 via-emerald-500/10 to-green-500/20'
  },
  Phoebe: {
    primary: '#EC4899',
    secondary: '#FBCFE8',
    accent: '#DB2777',
    gradient: 'from-pink-500/20 via-rose-500/10 to-pink-500/20'
  }
};

// Character info
const characterInfo = {
  Rachel: {
    fullName: 'Rachel Karen Green',
    occupation: 'Fashion Executive',
    knownFor: 'The Rachel haircut, "It\'s not that common, it doesn\'t happen to every guy, and it IS a big deal!"',
    personality: 'Spoiled waitress turned fashion icon',
    fun_fact: 'She left Barry at the altar and started her journey at Central Perk'
  },
  Ross: {
    fullName: 'Ross Eustace Geller',
    occupation: 'Paleontologist',
    knownFor: '"We were on a break!", divorces (3 times)',
    personality: 'Nerdy, jealous, passionate about dinosaurs',
    fun_fact: 'He once got a spray tan that went horribly wrong'
  },
  Monica: {
    fullName: 'Monica E. Geller',
    occupation: 'Chef',
    knownFor: 'Extreme cleanliness, competitive nature',
    personality: 'Obsessive, organized, loving',
    fun_fact: 'She has 11 categories of towels'
  },
  Chandler: {
    fullName: 'Chandler Muriel Bing',
    occupation: 'Statistical Analysis and Data Reconfiguration',
    knownFor: 'Sarcasm, "Could I BE any more...?"',
    personality: 'Funny, insecure, loyal',
    fun_fact: 'Nobody actually knows what his job is'
  },
  Joey: {
    fullName: 'Joseph Francis Tribbiani Jr.',
    occupation: 'Actor',
    knownFor: '"How you doin\'?", "Joey doesn\'t share food!"',
    personality: 'Lovable, simple, loyal friend',
    fun_fact: 'He once ate an entire turkey in one sitting'
  },
  Phoebe: {
    fullName: 'Phoebe Buffay',
    occupation: 'Masseuse / Musician',
    knownFor: '"Smelly Cat", eccentric beliefs',
    personality: 'Quirky, free-spirited, mysterious past',
    fun_fact: 'She has an evil twin named Ursula'
  }
};

const CHARACTERS = {
  Rachel: {
    name: 'Rachel Green',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjQzA4NEZDIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlI8L3RleHQ+PC9zdmc+',
    systemPrompt: `You are Rachel Green from the TV show Friends. You should embody Rachel's personality, speaking style, and mannerisms. Be fashionable, sometimes dramatic, caring about your friends, and passionate about your career in fashion. Reference your relationships with Ross, your friendship with Monica, and your journey from a spoiled daddy's girl to an independent career woman. Use expressions like "Oh my God!" and show Rachel's characteristic emotional responses.`,
    rentryPages: {
      'Background': 'https://rentry.org/Rachel--background/raw',
      'Seasons 1-5': 'https://rentry.org/Rachel-S1-S5/raw',
      'Seasons 5-10': 'https://rentry.org/Rachel-S5-S10/raw',
      'Appearance & Personality': 'https://rentry.org/rachel-appearance-personality/raw',
      'Friendships': 'https://rentry.org/rachel-friends/raw',
      'Family': 'https://rentry.org/rachel-family/raw',
      'Career': 'https://rentry.org/Rachel-carrer/raw'
    }
  },
  Ross: {
    name: 'Ross Geller',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjM0I4MkY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlI8L3RleHQ+PC9zdmc+',
    systemPrompt: `You are Ross Geller from Friends. Be nerdy, passionate about dinosaurs and paleontology, somewhat insecure, and occasionally defensive. Reference your three divorces, your feelings for Rachel, your son Ben, and your competitive nature with Monica. Use phrases like "We were on a break!" and show enthusiasm about dinosaurs and science.`,
    rentryPages: {}
  },
  Monica: {
    name: 'Monica Geller',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjRUY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk08L3RleHQ+PC9zdmc+',
    systemPrompt: `You are Monica Geller from Friends. Be extremely organized, competitive, clean-freak, and passionate about cooking. Reference your restaurant jobs, your relationship with Chandler, your competitive childhood with Ross, and your need for everything to be perfect. Show your caring, motherly nature and your obsessive tendencies.`,
    rentryPages: {}
  },
  Chandler: {
    name: 'Chandler Bing',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjRjU5RTBCIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkM8L3RleHQ+PC9zdmc+',
    systemPrompt: `You are Chandler Bing from Friends. Be sarcastic, use humor as a defense mechanism, and make frequent jokes. Use the phrase "Could I BE any more...?" Reference your relationship with Monica, your childhood issues, your mysterious job in statistical analysis, and your friendship with Joey. Make awkward jokes and be self-deprecating.`,
    rentryPages: {}
  },
  Joey: {
    name: 'Joey Tribbiani',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjMTBCOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPko8L3RleHQ+PC9zdmc+',
    systemPrompt: `You are Joey Tribbiani from Friends. Be simple, lovable, food-obsessed, and loyal. Use phrases like "How you doin'?" and "Joey doesn't share food!" Reference your acting career (including Days of Our Lives), your love of food, your friendship with Chandler, and your simple but endearing personality. Be charming and a bit dim but very loyal to friends.`,
    rentryPages: {}
  },
  Phoebe: {
    name: 'Phoebe Buffay',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjkwIiBmaWxsPSIjRUM0ODk5Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlA8L3RleHQ+PC9zdmc+',
    systemPrompt: `You are Phoebe Buffay from Friends. Be quirky, eccentric, spiritual, and unpredictable. Reference your songs (especially "Smelly Cat"), your massage therapy work, your twin sister Ursula, your difficult childhood, and your unique beliefs. Be sweet but weird, caring but unconventional.`,
    rentryPages: {}
  }
};

const FriendsChat = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [ambianceOn, setAmbianceOn] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    // Use a simple coffee shop sound loop from a public CDN
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAmbiance = () => {
    if (!audioRef.current) return;
    
    if (ambianceOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
    setAmbianceOn(!ambianceOn);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    setStreamingText('');

    // Easter egg
    if (currentInput.toLowerCase().includes('smelly cat')) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 3000);
    }

    try {
      const character = CHARACTERS[selectedCharacter];
      const rentryUrls = Object.values(character.rentryPages);

      // Use regular non-streaming endpoint for simplicity
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          systemPrompt: character.systemPrompt,
          rentryUrls: rentryUrls
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Simulate streaming effect with the complete response
      const fullText = data.content;
      const words = fullText.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        setStreamingText(currentText);
        await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay per word
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      setStreamingText('');

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Oh my God, something went wrong! Can you try asking me again?' }
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentTheme = selectedCharacter ? characterThemes[selectedCharacter] : null;
  const currentBackground = selectedCharacter ? characterBackgrounds[selectedCharacter] : null;

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <h1 className="text-6xl font-bold text-white drop-shadow-lg">
                Friends Chat
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl text-white/80">Pick your favorite Friend!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(CHARACTERS).map(([key, character], index) => (
              <button
                key={key}
                onClick={() => setSelectedCharacter(key)}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideUp 0.5s ease-out forwards',
                  opacity: 0
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-24 h-24 rounded-full border-4 border-white/30 group-hover:border-white/50 transition-all"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white/30 animate-pulse" />
                  </div>
                  <span className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                    {character.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-12 text-white/60 text-sm">
            <p>✨ Powered by AI • Chat with your favorite characters from Friends</p>
          </div>
        </div>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${currentBackground})`,
          filter: 'brightness(0.3) blur(8px)',
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient}`} />
      
      {showEasterEgg && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-6xl animate-bounce">🎵 🐱 Smelly Cat! 🐱 🎵</div>
        </div>
      )}

      <div className="relative z-10 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedCharacter(null);
                setMessages([]);
                if (audioRef.current) audioRef.current.pause();
                setAmbianceOn(false);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <img
              src={CHARACTERS[selectedCharacter].image}
              alt={selectedCharacter}
              className="w-12 h-12 rounded-full border-2 border-white/30 animate-pulse-slow"
            />
            <div>
              <h2 className="text-xl font-bold text-white">
                {CHARACTERS[selectedCharacter].name}
              </h2>
              {isTyping && (
                <p className="text-sm text-white/70 animate-pulse">typing...</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
              style={{ color: currentTheme.secondary }}
            >
              <Info className="w-6 h-6" />
            </button>
            <button
              onClick={toggleAmbiance}
              className="p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
              style={{ color: ambianceOn ? currentTheme.primary : 'white' }}
            >
              {ambianceOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
             onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-scale-in"
               onClick={e => e.stopPropagation()}
               style={{ borderTop: `4px solid ${currentTheme.primary}` }}>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={CHARACTERS[selectedCharacter].image}
                alt={selectedCharacter}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                  {characterInfo[selectedCharacter].fullName}
                </h3>
                <p className="text-gray-600">{characterInfo[selectedCharacter].occupation}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700">Known for:</p>
                <p className="text-gray-600">{characterInfo[selectedCharacter].knownFor}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Personality:</p>
                <p className="text-gray-600">{characterInfo[selectedCharacter].personality}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Fun fact:</p>
                <p className="text-gray-600">{characterInfo[selectedCharacter].fun_fact}</p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: currentTheme.primary }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-2xl text-white/90 mb-2">
                Hey! Start chatting with {selectedCharacter}! 👋
              </p>
              <p className="text-white/70">
                Try asking about their life, friends, or favorite moments!
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] ${
                  message.role === 'user'
                    ? 'bg-white/90 text-gray-800'
                    : 'border border-white/20'
                }`}
                style={message.role === 'assistant' ? {
                  backgroundColor: `${currentTheme.primary}15`,
                  color: 'white'
                } : {}}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={CHARACTERS[selectedCharacter].image}
                      alt={selectedCharacter}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-semibold text-sm" style={{ color: currentTheme.primary }}>
                      {selectedCharacter}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start animate-slide-up">
              <div
                className="max-w-[80%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border border-white/20"
                style={{
                  backgroundColor: `${currentTheme.primary}15`,
                  color: 'white'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={CHARACTERS[selectedCharacter].image}
                    alt={selectedCharacter}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold text-sm" style={{ color: currentTheme.primary }}>
                    {selectedCharacter}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {streamingText}
                  <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedCharacter}...`}
              disabled={isLoading}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
              style={{ '--tw-ring-color': currentTheme.primary }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="rounded-xl px-6 py-4 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ backgroundColor: currentTheme.primary }}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FriendsChat;
