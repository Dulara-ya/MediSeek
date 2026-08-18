// ChatbotPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import PageWrapper from '../components/PageWrapper';
import Spinner from '../components/Spinner';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { APP_COLORS, PaperClipIcon, TrashIcon } from '../constants';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${isUser ? 'bg-calm-blue-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
        {message.image && <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { getChatHistory, saveChatHistory, clearChatHistory } = useUserData();

  const initialMessage: ChatMessage = {
    id: '0',
    text: "Hello! I'm MediSeek AI. How are you feeling today? You can talk to me in English, Sinhala, or Tamil.",
    sender: 'bot',
    timestamp: new Date(),
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
  });

  // Load chat history
  useEffect(() => {
    if (!user) return; // Wait for user to be available
    let alive = true;
    (async () => {
      try {
        const history = await getChatHistory();
        if (!alive) return;
        setMessages(history && history.length > 0 ? history : [initialMessage]);
      } catch (e) {
        console.error('Failed to load chat history:', e);
        if (alive) setMessages([initialMessage]);
      }
    })();
    return () => { alive = false; };
  }, [user, getChatHistory]);

  // Persist chat
  useEffect(() => {
    if (!user) {
      return; // Do not attempt to save if the user is not authenticated yet.
    }
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== '0')) {
      (async () => {
        try {
          await saveChatHistory(messages);
        } catch (e) {
          console.error('Failed to save chat history:', e);
        }
      })();
    }
  }, [messages, saveChatHistory, user]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if ((inputText.trim() === '' && !imagePreview) || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setImagePreview(null);
    setIsLoading(true);

    const botResponse = await getChatbotResponse(userMessage);
    setMessages(prev => [...prev, botResponse ?? {
      id: Date.now().toString() + '_error',
      text: "Sorry, I couldn't connect. Please check your internet or try again later.",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setIsLoading(false);
  };

  const handleClearChat = async () => {
    if (window.confirm("Delete the entire conversation? This cannot be undone.")) {
      try { await clearChatHistory(); } catch (e) { console.error('Failed to clear chat history:', e); }
      setMessages([initialMessage]);
      alert('Conversation cleared successfully.');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { alert("File is too large. Max 4MB."); return; }
      const base64Image = await toBase64(file);
      setImagePreview(base64Image);
    }
    if (event.target) event.target.value = '';
  };

  return (
    <PageWrapper
      title="MediSeek AI Chat"
      className="flex flex-col h-[calc(100vh-4rem)] !p-0"
      actionButton={
        <button onClick={handleClearChat} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200" aria-label="Clear Chat">
          <TrashIcon className="w-6 h-6" />
        </button>
      }
    >
      <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-calm-blue-secondary">
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow bg-white text-gray-800 rounded-bl-none">
              <Spinner size="sm" color="text-calm-blue-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        {imagePreview && (
          <div className="relative mb-2 w-28">
            <img src={imagePreview} alt="Preview" className="rounded-lg w-full h-auto" />
            <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1" aria-label="Remove image">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/png, image/jpeg, image/webp" />
          <button onClick={() => fileInputRef.current?.click()} className="p-3 border border-gray-300 rounded-full hover:bg-gray-200" aria-label="Attach image" disabled={isLoading}>
            <PaperClipIcon className="w-6 h-6 text-gray-600" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-calm-blue-primary"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (inputText.trim() === '' && !imagePreview)}
            style={{ backgroundColor: APP_COLORS.primary }}
            className="text-white p-3 rounded-full hover:opacity-90 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

// --- FIX: Add the missing export statement ---
export default ChatbotPage;