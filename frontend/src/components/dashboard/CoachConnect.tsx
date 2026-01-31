/**
 * CoachConnect Dashboard Component
 * Coach booking (Calendly), messaging, and session notes.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { Calendar, MessageCircle, FileText, ExternalLink, Send, Clock, User } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface CoachConnectProps {
  coachName?: string;
  calendlyUrl?: string;
}

const MOCK_SESSIONS = [
  { id: '1', date: '2024-09-15', topic: 'College List Strategy', notes: 'Discussed reach/match/safety distribution. Focus on LACs that value narrative.' },
  { id: '2', date: '2024-08-28', topic: 'Activity Positioning', notes: 'Identified leadership angle in debate club. Action: propose new initiative by next week.' },
  { id: '3', date: '2024-08-10', topic: 'Initial Assessment Review', notes: 'Reviewed CRI score and narrative DNA. Strong foundation, focus on execution.' },
];

export function CoachConnect({
  coachName = 'Jenny Duan',
  calendlyUrl = 'https://calendly.com/ivylevel/strategy'
}: CoachConnectProps) {
  const [activeTab, setActiveTab] = useState<'book' | 'message' | 'notes'>('book');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'coach'; content: string; time: string }>>([]);

  const handleBookCall = () => {
    window.open(calendlyUrl, '_blank');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
    // TODO: Send to API
  };

  return (
    <div className="space-y-4">
      {/* Coach Avatar */}
      <div 
        className="flex items-center gap-3 p-3 rounded-xl border"
        style={{ backgroundColor: BRAND_COLORS.primaryBg, borderColor: '#E5D0C9' }}
      >
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: BRAND_COLORS.primary }}
        >
          <User size={24} className="text-white" />
        </div>
        <div>
          <p className="font-medium" style={{ color: BRAND_COLORS.primary }}>{coachName}</p>
          <p className="text-xs" style={{ color: '#9E6B5C' }}>Your Success Coach</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-green-600">Available</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <TabButton active={activeTab === 'book'} onClick={() => setActiveTab('book')} icon={Calendar}>
          Book
        </TabButton>
        <TabButton active={activeTab === 'message'} onClick={() => setActiveTab('message')} icon={MessageCircle}>
          Message
        </TabButton>
        <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={FileText}>
          Notes
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="min-h-[180px]">
        {activeTab === 'book' && (
          <div className="text-center py-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: BRAND_COLORS.primaryBg }}
            >
              <Calendar size={28} style={{ color: BRAND_COLORS.primary }} />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Schedule a 15-minute strategy session
            </p>
            <button
              onClick={handleBookCall}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
              style={{ backgroundColor: BRAND_COLORS.primary }}
            >
              <Calendar size={18} />
              Book a Call
              <ExternalLink size={14} />
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Next available: Tomorrow at 3:00 PM
            </p>
          </div>
        )}

        {activeTab === 'message' && (
          <div className="space-y-3">
            <div className="h-36 bg-gray-50 rounded-lg p-3 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  Start a conversation with your coach
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          msg.role === 'user'
                            ? 'bg-maroon-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                        style={msg.role === 'user' ? { backgroundColor: BRAND_COLORS.primary } : {}}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-3 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {MOCK_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {session.topic}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{session.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon: Icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
        active
          ? 'bg-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      style={active ? { color: BRAND_COLORS.primary } : {}}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

export default CoachConnect;
