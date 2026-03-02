import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { createCatController } from './cat.js';
// Friends logo image
const FRIENDS_LOGO = '/images/friends-logo.jpg';

// Central Perk background
const BG_IMAGE = '/images/bg.jpg';

// Character database with Pinecone knowledge
const CHARACTERS = {
  rachel: {
    name: 'Rachel Green',
    color: '#E8B4BC',
    avatar: '👗',
    photo: '/images/rachel.jpg',
    characterKey: 'rachel',
    tagline: '"It\'s like all my life everyone\'s told me, you\'re a shoe!"',
  },
  ross: {
    name: 'Ross Geller',
    color: '#B4D4E8',
    avatar: '🦕',
    photo: '/images/ross.png',
    characterKey: 'ross',
    tagline: '"PIVOT! PIVOT! PIVOT!"',
  },
  monica: {
    name: 'Monica Geller',
    color: '#C8B4E8',
    avatar: '👩‍🍳',
    photo: '/images/monica.png',
    characterKey: 'monica',
    tagline: '"I KNOW!"',
  },
  chandler: {
    name: 'Chandler Bing',
    color: '#E8D4B4',
    avatar: '😏',
    photo: '/images/chandler.png',
    characterKey: 'chandler',
    tagline: '"Could I BE any more sarcastic?"',
  },
  joey: {
    name: 'Joey Tribbiani',
    color: '#B4E8D4',
    avatar: '🍕',
    photo: '/images/joey.png',
    characterKey: 'joey',
    tagline: '"Joey doesn\'t share food!"',
  },
  phoebe: {
    name: 'Phoebe Buffay',
    color: '#E8E4B4',
    avatar: '🎸',
    photo: '/images/phoebe.png',
    characterKey: 'phoebe',
    tagline: '"Smelly cat, smelly cat, what are they feeding you?"',
  }
};

// Iconic Friends quotes for the marquee
const FRIENDS_QUOTES = [
  '🛋️ "Pivot! PIVOT! PIVOOOT!" — Ross',
  '🐱 "Smelly Cat, Smelly Cat, what are they feeding you?" — Phoebe',
  '🍕 "Joey doesn\'t share food!" — Joey',
  '☕ "Gunther, coffee!" — Everyone',
  '💪 "I KNOW!" — Monica',
  '😏 "Could I BE wearing any more clothes?" — Chandler',
  '👠 "It\'s like all my life everyone told me you\'re a shoe!" — Rachel',
  '🦃 "That\'s not even a word!" — Monica about Rachel\'s trifle',
  '🧪 "We were on a break!" — Ross',
  '🎸 "My mother was killed by a drug dealer" — Phoebe\'s holiday song',
  '🦞 "He\'s her lobster!" — Phoebe about Ross & Rachel',
  '💍 "I got off the plane." — Rachel',
];

// Smelly Cat — CSS black cat with green eyes, physics by Matter.js + GSAP
const SmellyCat = ({ containerRef }) => {
  const catRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    const catEl = catRef.current;
    if (!container || !catEl) return;

    // Small delay to ensure furniture cards are rendered
    const timer = setTimeout(() => {
      const furnitureEls = container.querySelectorAll('.furniture');
      const ctrl = createCatController(container, catEl, furnitureEls);
      catRef.current._catCtrl = ctrl;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (catRef.current?._catCtrl) catRef.current._catCtrl.destroy();
    };
  }, [containerRef]);

  /* CSS black cat silhouette — 56×44 viewport */
  return (
    <div className="smelly-cat-prowler" ref={catRef}>
      {/* Stink wisps */}
      <div className="stink-wisp" />
      <div className="stink-wisp" />
      <div className="stink-wisp" />
      {/* Cat body group — animated by GSAP */}
      <div className="cat-body-group" style={{ position: 'relative', width: 56, height: 44 }}>
        {/* Tail */}
        <div className="cat-tail" style={{
          position: 'absolute', right: -6, top: 2, width: 22, height: 6,
          background: '#1a1a1a', borderRadius: '0 12px 12px 0',
          transformOrigin: 'left center',
        }} />
        {/* Body */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8, width: 34, height: 20,
          background: '#1a1a1a', borderRadius: '50% 50% 40% 40%',
        }} />
        {/* Head */}
        <div className="cat-head" style={{
          position: 'absolute', top: 0, left: 0, width: 24, height: 20,
          background: '#1a1a1a', borderRadius: '50% 50% 45% 45%',
          transformOrigin: 'center bottom',
        }}>
          {/* Ears */}
          <div style={{
            position: 'absolute', top: -7, left: 2, width: 0, height: 0,
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderBottom: '9px solid #1a1a1a',
          }} />
          <div style={{
            position: 'absolute', top: -7, right: 2, width: 0, height: 0,
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderBottom: '9px solid #1a1a1a',
          }} />
          {/* Inner ears */}
          <div style={{
            position: 'absolute', top: -4, left: 4, width: 0, height: 0,
            borderLeft: '2px solid transparent', borderRight: '2px solid transparent',
            borderBottom: '5px solid #2a2a2a',
          }} />
          <div style={{
            position: 'absolute', top: -4, right: 4, width: 0, height: 0,
            borderLeft: '2px solid transparent', borderRight: '2px solid transparent',
            borderBottom: '5px solid #2a2a2a',
          }} />
          {/* Eyes — large green */}
          <div style={{
            position: 'absolute', top: 6, left: 3, width: 7, height: 7,
            background: '#00e676', borderRadius: '50%',
            boxShadow: '0 0 6px 1px rgba(0,230,118,0.6)',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: 2.5, width: 3, height: 4,
              background: '#111', borderRadius: '50%',
            }} />
          </div>
          <div style={{
            position: 'absolute', top: 6, right: 3, width: 7, height: 7,
            background: '#00e676', borderRadius: '50%',
            boxShadow: '0 0 6px 1px rgba(0,230,118,0.6)',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: 1.5, width: 3, height: 4,
              background: '#111', borderRadius: '50%',
            }} />
          </div>
          {/* Nose */}
          <div style={{
            position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)',
            width: 3, height: 2, background: '#e91e63', borderRadius: '50%',
          }} />
        </div>
        {/* Legs */}
        <div className="cat-leg-fl" style={{
          position: 'absolute', bottom: 0, left: 10, width: 5, height: 12,
          background: '#1a1a1a', borderRadius: '2px 2px 3px 3px',
          transformOrigin: 'top center',
        }} />
        <div className="cat-leg-fr" style={{
          position: 'absolute', bottom: 0, left: 18, width: 5, height: 12,
          background: '#1a1a1a', borderRadius: '2px 2px 3px 3px',
          transformOrigin: 'top center',
        }} />
        <div className="cat-leg-bl" style={{
          position: 'absolute', bottom: 0, left: 30, width: 5, height: 12,
          background: '#1a1a1a', borderRadius: '2px 2px 3px 3px',
          transformOrigin: 'top center',
        }} />
        <div className="cat-leg-br" style={{
          position: 'absolute', bottom: 0, left: 38, width: 5, height: 12,
          background: '#1a1a1a', borderRadius: '2px 2px 3px 3px',
          transformOrigin: 'top center',
        }} />
      </div>
    </div>
  );
};

const FriendsChat = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  const gridRef = useRef(null);
  const pageRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);


  // Generate character response using API
  const generateResponse = async (character, userMessage, conversationHistory) => {
    setIsLoading(true);
    try {
      const char = CHARACTERS[character];

      const systemPrompt = `You are ${char.name} from the TV show Friends.

CRITICAL INSTRUCTIONS:
- Stay completely in character at all times
- Use the provided knowledge base to answer accurately
- Reference specific events, episodes, and details from the show
- Maintain your personality, speech patterns, and catchphrases
- If asked about something not in your knowledge base, respond as your character would
- Never break character or mention that you're an AI

Respond naturally as ${char.name} would, using the knowledge provided to be accurate about events, relationships, and details from the show.`;

      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];
      // Send character + query to backend for Pinecone knowledge retrieval
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages,
          character: char.characterKey,
          userQuery: userMessage
        })
      });

      const data = await response.json();

      if (data.content) {
        return data.content;
      } else {
        throw new Error(data.error || 'Invalid response');
      }

    } catch (error) {
      console.error('Error generating response:', error);
      return "Oh my God, something went wrong! Can you try asking me again?";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    // Generate and add assistant response
    const conversationHistory = newMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setStreamingText(''); // Reset streaming text
    const response = await generateResponse(selectedCharacter, userMessage, conversationHistory.slice(0, -1));

    // Stream the response word-by-word
    const words = response.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setStreamingText(currentText);
      await new Promise(resolve => setTimeout(resolve, 40)); // 40ms delay per word
    }

    // After streaming is complete, add to messages and clear streaming text
    setMessages([...newMessages, { role: 'assistant', content: response }]);
    setStreamingText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setSelectedCharacter(null);
    setMessages([]);
    setInput('');
  };

  // Character Selection Screen
  const charEntries = Object.entries(CHARACTERS);

  const spawnConfetti = (e) => {
    const emojis = ['☕', '🦞', '❤️', '🍕', '🎸', '🛋️'];
    const x = e.clientX;
    const y = e.clientY;
    for (let i = 0; i < 30; i++) {
      const span = document.createElement('span');
      span.className = 'confetti-piece';
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = `${x + (Math.random() - 0.5) * 200}px`;
      span.style.top = `${y}px`;
      span.style.fontSize = `${14 + Math.random() * 16}px`;
      span.style.animationDelay = `${Math.random() * 0.3}s`;
      document.body.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    }
  };

  const CentralPerkScene = () => (
    <div className="cat-surface relative z-10 flex justify-center py-4" style={{ opacity: 0.7 }}>
      <svg viewBox="0 0 500 180" style={{ maxWidth: '500px', width: '90%' }} xmlns="http://www.w3.org/2000/svg">
        {/* Ceiling lamp */}
        <line x1="250" y1="0" x2="250" y2="30" stroke="#8B7355" strokeWidth="2" />
        <polygon points="235,30 265,30 270,45 230,45" fill="#D4A843" />
        <ellipse cx="250" cy="38" rx="25" ry="12" fill="#FFD700" opacity="0.3" style={{ animation: 'lampGlow 3s ease-in-out infinite' }} />

        {/* Orange couch */}
        <rect x="130" y="90" width="240" height="55" rx="18" fill="#E8762B" />
        <rect x="140" y="80" width="70" height="65" rx="14" fill="#D4691A" />
        <rect x="215" y="80" width="70" height="65" rx="14" fill="#D4691A" />
        <rect x="290" y="80" width="70" height="65" rx="14" fill="#D4691A" />
        {/* Couch arms */}
        <rect x="115" y="75" width="25" height="70" rx="10" fill="#C75E15" />
        <rect x="360" y="75" width="25" height="70" rx="10" fill="#C75E15" />
        {/* Couch legs */}
        <rect x="150" y="145" width="8" height="15" rx="2" fill="#5C3A1E" />
        <rect x="342" y="145" width="8" height="15" rx="2" fill="#5C3A1E" />

        {/* Coffee table */}
        <rect x="190" y="155" width="120" height="8" rx="3" fill="#6B4226" />
        <rect x="210" y="163" width="6" height="14" rx="2" fill="#5C3A1E" />
        <rect x="284" y="163" width="6" height="14" rx="2" fill="#5C3A1E" />

        {/* Coffee cups */}
        <rect x="225" y="147" width="14" height="10" rx="2" fill="#FFF9F0" />
        <rect x="239" y="150" width="5" height="4" rx="2" fill="none" stroke="#FFF9F0" strokeWidth="1.5" />
        <rect x="265" y="147" width="14" height="10" rx="2" fill="#FFF9F0" />
        <rect x="279" y="150" width="5" height="4" rx="2" fill="none" stroke="#FFF9F0" strokeWidth="1.5" />

        {/* Steam wisps */}
        <ellipse cx="232" cy="143" rx="2" ry="5" fill="rgba(255,255,255,0.5)" style={{ animation: 'steamFloat 2s ease-out infinite' }} />
        <ellipse cx="228" cy="140" rx="1.5" ry="4" fill="rgba(255,255,255,0.4)" style={{ animation: 'steamFloat 2.2s ease-out 0.5s infinite' }} />
        <ellipse cx="272" cy="143" rx="2" ry="5" fill="rgba(255,255,255,0.5)" style={{ animation: 'steamFloat 2s ease-out 0.3s infinite' }} />
        <ellipse cx="268" cy="140" rx="1.5" ry="4" fill="rgba(255,255,255,0.4)" style={{ animation: 'steamFloat 2.2s ease-out 0.8s infinite' }} />
      </svg>
    </div>
  );

  const CharCard = ({ charKey, char, index }) => (
    <button
      onClick={(e) => { spawnConfetti(e); setSelectedCharacter(charKey); }}
      className="furniture group relative overflow-hidden transition-all duration-300 animate-fade-in hover:scale-[1.06] cursor-pointer"
      style={{
        background: 'linear-gradient(150deg, var(--cream) 0%, var(--soft-lilac) 100%)',
        border: '2px solid var(--lavender)',
        borderRadius: '18px',
        boxShadow: '0 4px 20px rgba(107,47,160,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem 0.75rem 1rem',
        animationDelay: `${index * 120}ms`,
        opacity: 0,
        animation: `fadeIn 0.5s ease-out ${index * 120}ms forwards`,
      }}
    >
      {/* Colored top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5" style={{
        background: 'linear-gradient(90deg, var(--door-purple), var(--gold))',
        borderRadius: '18px 18px 0 0',
      }} />

      {char.photo ? (
        <div className="rounded-full overflow-hidden mb-2.5 transition-transform duration-300 group-hover:scale-105" style={{
          width: '85px', height: '85px',
          border: '3px solid var(--door-purple)',
          boxShadow: '0 0 0 3px rgba(107,47,160,0.15), 0 4px 16px rgba(107,47,160,0.2)',
          flexShrink: 0,
        }}>
          <img
            src={char.photo}
            alt={char.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--door-purple);font-size:1.8rem;font-weight:900;color:var(--cream);">${char.name[0]}</div>`;
            }}
          />
        </div>
      ) : (
        <div className="rounded-full mb-2.5 flex items-center justify-center text-3xl" style={{
          width: '85px', height: '85px',
          background: 'var(--door-purple)',
          border: '3px solid var(--gold)',
          color: 'var(--cream)',
        }}>{char.avatar}</div>
      )}

      <div style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--deep-purple)',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {char.name}
      </div>

      {/* Tagline on hover */}
      <div className="text-xs mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-1" style={{
        color: 'var(--door-purple)',
        fontFamily: 'Lora, Georgia, serif',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: '160px',
        fontSize: '0.68rem',
      }}>
        {char.tagline}
      </div>
    </button>
  );

  if (!selectedCharacter) {
    return (
      <div ref={pageRef} className="min-h-screen flex flex-col relative overflow-hidden" style={{
        background: 'var(--charcoal)',
      }}>
        {/* Background photo — no blur filter for performance */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${BG_IMAGE}')`,
          opacity: 0.15,
        }} />

        {/* Purple overlay gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(58,23,102,0.8) 0%, rgba(30,27,46,0.6) 40%, rgba(58,23,102,0.75) 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(107,47,160,0.2) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(242,201,76,0.06) 0%, transparent 40%)',
        }} />

        {/* Peephole frame decoration — top-right */}
        <div className="absolute top-6 right-8 hidden lg:block animate-float" style={{ animationDelay: '0.5s' }}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" opacity="0.15">
            <circle cx="25" cy="25" r="22" stroke="var(--frame-gold)" strokeWidth="3" />
            <circle cx="25" cy="25" r="17" stroke="var(--frame-gold)" strokeWidth="1.5" />
            <circle cx="25" cy="25" r="8" fill="var(--frame-gold)" opacity="0.3" />
          </svg>
        </div>

        {/* HEADER: Logo + subtitle */}
        <div className="cat-surface relative z-10 w-full flex flex-col items-center" style={{ paddingTop: '1.5rem', paddingBottom: '0.3rem' }}>
          <div style={{
            lineHeight: 0,
            width: '50%',
            maxWidth: '440px',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <img
              src={FRIENDS_LOGO}
              alt="Friends"
              style={{
                width: '100%',
                display: 'block',
                filter: 'invert(1) sepia(1) saturate(2) hue-rotate(230deg) brightness(1.3) drop-shadow(0 0 24px rgba(107,47,160,0.6))',
                userSelect: 'none',
              }}
            />
          </div>
          <p className="animate-shimmer" style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
            fontWeight: 700,
            marginTop: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            Welcome to Central Perk
          </p>
          <p style={{
            fontFamily: 'Lora, Georgia, serif',
            color: 'var(--lavender)',
            fontSize: 'clamp(0.72rem, 1.1vw, 0.9rem)',
            marginTop: '0.35rem',
            textAlign: 'center',
            opacity: 0.85,
            fontStyle: 'italic',
            maxWidth: '480px',
            padding: '0 1rem',
          }}>
            Pick your favourite Friend — they know everything about all 10 seasons!
          </p>
        </div>

        {/* 2x3 CHARACTER GRID with smelly cat running through */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-3">
          <div ref={gridRef} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(10px, 1.5vw, 18px)',
            width: '100%',
            maxWidth: '660px',
            position: 'relative',
          }}>
            {charEntries.map(([k, c], i) => <CharCard key={k} charKey={k} char={c} index={i} />)}
          </div>
        </div>

        {/* Central Perk couch scene */}
        <CentralPerkScene />

        {/* Scrolling quotes marquee */}
        <div className="cat-surface relative z-10 overflow-hidden" style={{
          borderTop: '1px solid rgba(107,47,160,0.25)',
          borderBottom: '1px solid rgba(107,47,160,0.25)',
          background: 'rgba(30,27,46,0.6)',
          padding: '0.6rem 0',
        }}>
          <div className="marquee-track">
            {[...FRIENDS_QUOTES, ...FRIENDS_QUOTES].map((quote, i) => (
              <span key={i} style={{
                fontFamily: 'Lora, Georgia, serif',
                fontSize: '0.78rem',
                color: 'var(--lavender)',
                opacity: 0.7,
                whiteSpace: 'nowrap',
                padding: '0 2.5rem',
                fontStyle: 'italic',
              }}>
                {quote}
              </span>
            ))}
          </div>
        </div>

        {/* Smelly cat roams the entire page */}
        <SmellyCat containerRef={pageRef} />
      </div>
    );
  }

  // Chat Interface
  const character = CHARACTERS[selectedCharacter];

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(to bottom, var(--cream) 0%, var(--soft-lilac) 100%)'
    }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, var(--deep-purple) 0%, var(--door-purple) 60%, #8B45C0 100%)',
        borderBottom: '3px solid var(--gold)',
        boxShadow: '0 4px 20px rgba(58,23,102,0.3)',
      }}>
        <div className="relative p-3 md:p-4 flex items-center gap-3">
          <button
            onClick={resetChat}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--cream)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(242,201,76,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden" style={{
              border: '2.5px solid var(--gold)',
              boxShadow: '0 0 12px rgba(242,201,76,0.3)',
            }}>
              {character.photo
                ? <img
                  src={character.photo}
                  alt={character.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = character.name[0];
                  }}
                />
                : <span style={{ fontSize: '1.3rem' }}>{character.avatar}</span>
              }
            </div>

            <div>
              <h2 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                color: 'var(--cream)',
                lineHeight: 1.2,
              }}>
                {character.name}
              </h2>
              <p style={{
                fontSize: '0.72rem',
                color: 'var(--lavender)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                opacity: 0.85,
              }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#6DBF6D',
                  display: 'inline-block',
                  boxShadow: '0 0 6px rgba(109,191,109,0.6)',
                  animation: 'gentlePulse 2s ease-in-out infinite',
                }}></span>
                Online at Central Perk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 paper-texture">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 py-8 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                {/* Character photo — side on desktop, top on mobile */}
                <div className="flex-shrink-0">
                  {character.photo ? (
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden" style={{
                      border: '4px solid var(--door-purple)',
                      boxShadow: '0 8px 32px rgba(107,47,160,0.2)',
                    }}>
                      <img
                        src={character.photo}
                        alt={character.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="text-7xl">{character.avatar}</div>
                  )}
                </div>

                {/* Welcome text */}
                <div className="text-center md:text-left flex-1">
                  <div className="inline-block p-6 rounded-2xl" style={{
                    background: 'var(--cream)',
                    boxShadow: '0 6px 24px rgba(107,47,160,0.08)',
                    border: '2px solid var(--lavender)',
                  }}>
                    <p style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: 700,
                      fontSize: '1.4rem',
                      color: 'var(--deep-purple)',
                      marginBottom: '0.4rem',
                    }}>
                      Hey! I'm {character.name}
                    </p>
                    <p style={{
                      fontFamily: 'Lora, Georgia, serif',
                      color: 'var(--door-purple)',
                      opacity: 0.8,
                      fontStyle: 'italic',
                      fontSize: '0.9rem',
                      marginBottom: '0.75rem',
                    }}>
                      {character.tagline}
                    </p>
                    <p style={{
                      fontFamily: 'Lora, Georgia, serif',
                      color: 'var(--deep-purple)',
                      fontSize: '0.85rem',
                      opacity: 0.75,
                    }}>
                      Ask me anything about my life or what happened in the show!
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                    {['My relationships', 'My career', 'About the gang', 'Memorable moments'].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'transparent',
                          border: '1.5px solid var(--door-purple)',
                          color: 'var(--door-purple)',
                          fontFamily: 'Lora, Georgia, serif',
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--door-purple)';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(107,47,160,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--door-purple)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] md:max-w-[72%] p-4 md:p-5 rounded-2xl animate-pop-in ${message.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                    }`}
                  style={message.role === 'user'
                    ? {
                      background: 'linear-gradient(135deg, var(--deep-purple) 0%, var(--door-purple) 100%)',
                      color: 'var(--cream)',
                      boxShadow: '0 3px 12px rgba(58,23,102,0.25)',
                    }
                    : {
                      background: '#FFFFFF',
                      color: 'var(--charcoal)',
                      borderLeft: '3px solid var(--door-purple)',
                      boxShadow: '0 3px 12px rgba(107,47,160,0.08)',
                    }
                  }
                >
                  <p style={{
                    fontFamily: 'Lora, Georgia, serif',
                    fontStyle: message.role === 'assistant' ? 'italic' : 'normal',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                  }}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming text display */}
            {streamingText && (
              <div className="flex justify-start">
                <div
                  className="max-w-[78%] md:max-w-[72%] p-4 md:p-5 rounded-2xl rounded-tl-sm animate-pop-in"
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--charcoal)',
                    borderLeft: '3px solid var(--door-purple)',
                    boxShadow: '0 3px 12px rgba(107,47,160,0.08)',
                  }}
                >
                  <p style={{
                    fontFamily: 'Lora, Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                  }}>
                    {streamingText}
                    <span className="inline-block w-1.5 h-5 ml-1 animate-pulse" style={{
                      backgroundColor: 'var(--door-purple)',
                      borderRadius: '1px',
                    }}></span>
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl rounded-tl-sm animate-pop-in" style={{
                  background: '#FFFFFF',
                  borderLeft: '3px solid var(--door-purple)',
                  boxShadow: '0 3px 12px rgba(107,47,160,0.08)',
                }}>
                  <div className="flex items-center gap-2.5">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span style={{
                      fontFamily: 'Lora, Georgia, serif',
                      color: 'var(--door-purple)',
                      fontStyle: 'italic',
                      fontSize: '0.82rem',
                      marginLeft: '0.2rem',
                    }}>
                      {character.name.split(' ')[0]} is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{
          background: 'linear-gradient(to top, var(--cream) 60%, transparent)',
          paddingTop: '1rem',
        }}>
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <div className="flex gap-3 items-end p-3 rounded-2xl" style={{
              background: '#FFFFFF',
              border: '2px solid var(--lavender)',
              boxShadow: '0 -2px 20px rgba(107,47,160,0.04), 0 4px 16px rgba(107,47,160,0.08)',
            }}>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${character.name.split(' ')[0]}...`}
                  disabled={isLoading}
                  rows={1}
                  className="w-full p-2.5 rounded-xl focus:outline-none disabled:opacity-50 resize-none"
                  style={{
                    background: 'var(--soft-lilac)',
                    border: 'none',
                    color: 'var(--charcoal)',
                    fontFamily: 'Lora, Georgia, serif',
                    maxHeight: '100px',
                    fontSize: '0.92rem',
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  background: input.trim() && !isLoading
                    ? 'linear-gradient(135deg, var(--door-purple) 0%, #8B45C0 100%)'
                    : 'var(--lavender)',
                  boxShadow: input.trim() && !isLoading ? '0 4px 14px rgba(107,47,160,0.35)' : 'none',
                }}
              >
                <Send className="w-5 h-5" style={{
                  color: input.trim() && !isLoading ? '#FFF' : 'var(--deep-purple)',
                }} />
              </button>
            </div>

            <p style={{
              textAlign: 'center',
              color: 'var(--door-purple)',
              fontSize: '0.65rem',
              marginTop: '0.5rem',
              opacity: 0.35,
              fontFamily: 'Lora, Georgia, serif',
            }}>
              Powered by AI &middot; All 10 seasons knowledge base
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsChat;
