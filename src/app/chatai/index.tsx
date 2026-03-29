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
import {
  webSocketService,
  getAuthToken,
  getUserSession,
  type WebSocketResponse,
  type WebSocketError,
} from './websocket';
import ForecastChart from './ForecastChart';
import Cookies from 'js-cookie';

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
  const { user, token } = useAuth();
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

  // Get auth token from cookies and user session from whoami
  const userAuthToken = 'G6h4Vt7h1O5oMD1gXhOrrQwK0J31iaa0';

  // Use real user data from AuthContext (whoami API) - this contains the actual whoami response
  const realUserSession =
    user?.user?.id || user?.session?.userId || 'unknown_user';
  const realUserData = user?.user;

  // Debug authentication data
  console.log('🔑 Auth token available:', !!userAuthToken);
  console.log('🔑 Auth token length:', userAuthToken.length);
  console.log('👤 Real user session (from whoami):', realUserSession);
  console.log('👤 Real user data (from whoami):', realUserData);
  console.log('👤 Context data available:', !!context);
  console.log('👤 AuthContext user (fallback):', user);
  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('wss://tribu.dev.instanvi.com/livra/'); // Replace with your WebSocket URL

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      console.log(
        '✅ WebSocket connected to:',
        'wss://tribu.dev.instanvi.com/livra/'
      );
    };

    ws.onmessage = (event) => {
      console.log('📥 Received WebSocket message:', event.data);

      try {
        const response: WebSocketResponse | WebSocketError = JSON.parse(
          event.data
        );

        console.log('📋 Parsed response:', response);

        if ('error_type' in response && response.error_type !== null) {
          // Handle error response (only when error_type is not null)
          const errorResponse = response as WebSocketError;
          console.log('❌ Error response received:', errorResponse);
          addMessage('bot', `Error: ${errorResponse.message}`, {
            error_type: errorResponse.error_type,
          });
        } else {
          // Handle success response (when error_type is null or doesn't exist)
          const successResponse = response as WebSocketResponse;
          console.log('✅ Success response received:', successResponse);
          console.log('📊 Response data:', successResponse.data);
          console.log('🏷️ Source:', successResponse.source);
          console.log('📈 Type:', successResponse.type);
          addMessage(
            'bot',
            successResponse.message,
            successResponse.data,
            successResponse.source,
            successResponse.type
          );
        }
      } catch (error) {
        // Log parsing errors only in development
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          console.warn('⚠️ Error parsing WebSocket message:', error);
          console.warn('⚠️ Raw message data:', event.data);
        }
        addMessage(
          'bot',
          'Sorry, I encountered an error processing your request.'
        );
      }

      setIsLoading(false);
    };

    ws.onerror = (error) => {
      // Use console.warn for connection errors (expected during initial connection attempts)
      // Only log detailed error info in development
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.warn('⚠️ WebSocket connection error:', error);
        console.warn(
          '⚠️ Failed to connect to:',
          'wss://tribu.dev.instanvi.com/livra/'
        );
      }
      setIsConnected(false);
      setConnectionStatus('Connection Error');
      setIsLoading(false);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setConnectionStatus(`Disconnected (Code: ${event.code})`);
      console.log(
        '🔌 WebSocket disconnected. Code:',
        event.code,
        'Reason:',
        event.reason
      );
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const addMessage = (
    type: 'user' | 'bot',
    content: string,
    data?: any,
    source?: 'potta' | 'fpa' | null,
    messageType?: 'actual' | 'forecast' | null
  ) => {
    console.log('📝 Adding message with data:', data);
    console.log('📝 Data type:', typeof data);
    console.log('📝 Data keys:', data ? Object.keys(data) : 'no data');
    console.log('📝 Has forecast:', data?.forecast ? 'YES' : 'NO');

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
    console.log('📤 Sending message:', userMessage);
    console.log('🔗 WebSocket state:', socket?.readyState);
    console.log('🔗 Is connected:', isConnected);

    setInputValue('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);

    // Send message via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = {
        user_session: realUserSession,
        user_auth_token: userAuthToken,
        user_prompt: userMessage,
      };

      console.log('📦 Payload being sent:', payload);
      console.log('🔑 Auth token length:', userAuthToken.length);
      console.log('👤 Real user session (from whoami):', realUserSession);

      try {
        socket.send(JSON.stringify(payload));
        console.log('✅ Message sent successfully via WebSocket');
      } catch (error) {
        // Log sending errors only in development
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          console.warn('⚠️ Error sending message:', error);
        }
        setIsLoading(false);
        addMessage('bot', 'Failed to send message. Please try again.');
      }
    } else {
      console.log('❌ WebSocket not available. State:', socket?.readyState);
      console.log('❌ Socket object:', socket);
      // Fallback for when WebSocket is not available
      setTimeout(() => {
        addMessage(
          'bot',
          "I'm sorry, but I'm currently offline. Please try again later."
        );
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
      <div className="mt-3 bg-gray-50 p-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">
          Data Response:
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {Object.keys(data).map((key) => (
                  <th
                    key={key}
                    className="text-left py-2 px-3 font-medium text-gray-600"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(data).map((value, index) => (
                  <td key={index} className="py-2 px-3 text-gray-800">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
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

    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    if (source === 'potta') {
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          Potta
        </span>
      );
    }
    if (source === 'fpa') {
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
          FPA
        </span>
      );
    }
    return null;
  };

  const renderTypeBadge = (messageType: 'actual' | 'forecast' | null) => {
    if (!messageType) return null;

    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    if (messageType === 'actual') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          Actual
        </span>
      );
    }
    if (messageType === 'forecast') {
      return (
        <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
          Forecast
        </span>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-[600px] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 flex rounded-full items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Livra AI</h3>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 rounded-full h-2 ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-xs text-gray-500">{connectionStatus}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-md ${
                message.type === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <Bot className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-xs">{message.content}</p>

                  {/* Source and Type badges */}
                  {(message.source || message.messageType) && (
                    <div className="flex gap-2 mt-2">
                      {message.source && renderSourceBadge(message.source)}
                      {message.messageType &&
                        renderTypeBadge(message.messageType)}
                    </div>
                  )}

                  {message.data && (
                    <>
                      {/* Debug: Log the data structure */}
                      {console.log('🔍 Message data structure:', message.data)}
                      {console.log(
                        '🔍 Has forecast property:',
                        !!message.data.forecast
                      )}
                      {console.log(
                        '🔍 Forecast is array:',
                        Array.isArray(message.data.forecast)
                      )}
                      {console.log('🔍 Forecast data:', message.data.forecast)}

                      {/* Check if this is forecast data and render chart */}
                      {(() => {
                        const hasForecast =
                          message.data.forecast &&
                          Array.isArray(message.data.forecast);
                        const hasForecastStructure =
                          message.data.baseline_id &&
                          message.data.metric &&
                          message.data.method_meta;
                        const shouldRenderChart =
                          hasForecast || hasForecastStructure;

                        console.log('🎯 Chart rendering decision:', {
                          hasForecast,
                          hasForecastStructure,
                          shouldRenderChart,
                          forecastLength: message.data.forecast?.length,
                        });

                        return shouldRenderChart ? (
                          <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg">
                            <ForecastChart data={message.data} />
                          </div>
                        ) : (
                          renderDataTable(message.data)
                        );
                      })()}
                    </>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {/* {message.type === 'user' && (
                  <User className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
                )} */}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">
                  Livra is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            disabled={isLoading || !isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !isConnected}
            className="p-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!isConnected && (
          <div className="mt-2">
            <p className="text-xs text-red-500">
              Connection lost. Trying to reconnect...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Endpoint: wss://tribu.dev.instanvi.com/livra/
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAI;
