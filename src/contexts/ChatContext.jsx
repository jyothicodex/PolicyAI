import React, { createContext, useContext, useState, useEffect } from 'react';
import { streamQuestion as apiStreamQuestion, getChatHistory, clearChatHistory } from '../services/api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentId, setDocumentId] = useState('global');

  // Load history when documentId changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(documentId);
        if (history) {
          const formattedHistory = history.map(msg => ({
            role: msg.role || (msg.type === 'USER' ? 'user' : 'assistant'),
            content: msg.answer || msg.content,
            source: msg.source || (msg.sourceInfo ? JSON.parse(msg.sourceInfo) : null),
            confidence: msg.confidence,
            timestamp: msg.createdAt || new Date().toISOString()
          }));
          
          setMessages(formattedHistory);
          if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'assistant') {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();
  }, [documentId]);

  const streamQuestion = async (question) => {
    if (!question.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    const assistantMessagePlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessagePlaceholder]);
    setIsLoading(true);

    try {
      await apiStreamQuestion(
        userMessage.content,
        documentId,
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            lastMessage.content += chunk;
            newMessages[newMessages.length - 1] = lastMessage;
            return newMessages;
          });
        },
        (metadata) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            lastMessage.source = metadata;
            lastMessage.confidence = 85;
            newMessages[newMessages.length - 1] = lastMessage;
            return newMessages;
          });
        },
        () => {
          setIsLoading(false);
        },
        (err) => {
          console.error("Stream error", err);
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            lastMessage.content = "Error: Connection interrupted.";
            newMessages[newMessages.length - 1] = lastMessage;
            return newMessages;
          });
          setIsLoading(false);
        }
      );
    } catch {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content = 'Sorry, I encountered an error processing your question. Please try again.';
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await clearChatHistory(documentId);
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      documentId,
      setDocumentId,
      streamQuestion,
      clearChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
