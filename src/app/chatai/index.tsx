'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '../(routes)/auth/AuthContext';
import { ContextData } from '../../components/providers/DataProvider';
import { useSession } from 'next-auth/react';
import {
  webSocketService,
  getAuthToken,
  getUserSession,
  type WebSocketResponse,
  type WebSocketError,
} from './websocket';
import ForecastChart from './ForecastChart';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  data?: any;
  source?: 'potta' | 'fpa' | null;
  messageType?: 'actual' | 'forecast' | null;
  timestamp: Date;
}

interface ChatAIProps {
  onClose?: () => void;
}

const ChatAI = ({ onClose }: ChatAIProps) => {
  const { data: session } = useSession();
  const { user } = useAuth();
  const context = useContext(ContextData);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>('Disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get real auth token and user ID from the session
  const userAuthToken = (session as any)?.accessToken || 'G6h4Vt7h1O5oMD1gXhOrrQwK0J31iaa0';
  const realUserSession = (session as any)?.user?.id || 'unknown_user';
  const realUserData = session?.user;

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('wss://tribu.dev.instanvi.com/livra/');
    
    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const response: WebSocketResponse | WebSocketError = JSON.parse(event.data);
        if ('error_type' in response && response.error_type !== null) {
          const errorResponse = response as WebSocketError;
          addMessage('bot', `Error: ${errorResponse.message}`, { error_type: errorResponse.error_type });
        } else {
          const successResponse = response as WebSocketResponse;
          addMessage(
            'bot',
            successResponse.message,
            successResponse.data,
            successResponse.source,
            successResponse.type
          );
        }
      } catch (error) {
        addMessage('bot', 'Sorry, I encountered an error processing your request.');
      }
      setIsLoading(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
      setConnectionStatus('Connection Error');
      setIsLoading(false);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setConnectionStatus(`Disconnected (Code: ${event.code})`);
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const addMessage = (
    type: 'user' | 'bot',
    content: string,
    data?: any,
    source?: 'potta' | 'fpa' | null,
    messageType?: 'actual' | 'forecast' | null
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      data,
      source,
      messageType,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isConnected) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    addMessage('user', userMessage);

    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = {
        user_session: realUserSession,
        user_auth_token: userAuthToken,
        user_prompt: userMessage,
      };

      try {
        socket.send(JSON.stringify(payload));
      } catch (error) {
        setIsLoading(false);
        addMessage('bot', 'Failed to send message. Please try again.');
      }
    } else {
      setTimeout(() => {
        addMessage('bot', "I'm sorry, but I'm currently offline. Please try again later.");
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderDataTable = (data: any) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return null;
    }

    return (
      <div className="mt-3 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Data Response:</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                {Object.keys(data).map((key) => <th key={key} className="text-left py-2 px-3 font-medium text-gray-600">{key}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(data).map((value, index) => (
                  <td key={index} className="py-2 px-3 text-gray-800">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSourceBadge = (source: 'potta' | 'fpa' | null) => {
    if (!source) return null;
    const baseClasses = 'px-2 py-1 text-[10px] font-bold rounded-full uppercase';
    return source === 'potta' 
      ? <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Potta</span>
      : <span className={`${baseClasses} bg-purple-100 text-purple-800`}>FPA</span>;
  };

  const renderTypeBadge = (messageType: 'actual' | 'forecast' | null) => {
    if (!messageType) return null;
    const baseClasses = 'px-2 py-1 text-[10px] font-bold rounded-full uppercase';
    return messageType === 'actual'
      ? <span className={`${baseClasses} bg-green-100 text-green-800`}>Actual</span>
      : <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Forecast</span>;
  };

  return (
    <div className="h-full w-[600px] flex flex-col bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Livra AI</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{connectionStatus}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${message.type === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'}`}>
              <div className="flex items-start space-x-3">
                {message.type === 'bot' && <Bot className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />}
                <div className="flex-1 space-y-3">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {(message.source || message.messageType) && (
                    <div className="flex gap-2">
                      {message.source && renderSourceBadge(message.source)}
                      {message.messageType && renderTypeBadge(message.messageType)}
                    </div>
                  )}
                  {message.data && (
                    <div className="mt-4">
                      {message.data.forecast && Array.isArray(message.data.forecast) ? (
                        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner">
                          <ForecastChart data={message.data} />
                        </div>
                      ) : renderDataTable(message.data)}
                    </div>
                  )}
                  <p className={`text-[10px] font-medium mt-2 ${message.type === 'user' ? 'text-green-100' : 'text-slate-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none animate-in fade-in slide-in-from-left-2 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Livra is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading || !isConnected}
            className="w-full pl-4 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 text-sm placeholder:text-slate-400 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !isConnected}
            className="absolute right-2 p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-200 transition-all shadow-lg shadow-green-100 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
