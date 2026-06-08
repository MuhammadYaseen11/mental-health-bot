import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import SmsIcon from '@mui/icons-material/Sms';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import './App.css';

const SUGGESTED_PROMPTS = [
  "I've been feeling really anxious lately",
  "I'm struggling to sleep and feel overwhelmed",
  "I need help managing stress",
  "I feel lonely and disconnected",
  "Teach me a breathing exercise",
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm here for you 💙\n\nThis is a safe, judgment-free space where you can talk about anything — stress, anxiety, relationships, or just how your day went.\n\nI'm not a therapist, but I genuinely care and I'm here to listen. How are you feeling today?",
  timestamp: new Date(),
};

function CrisisBanner() {
  return (
    <Box className="crisis-banner">
      <Box className="crisis-banner-inner">
        <Box className="crisis-item">
          <LocalPhoneIcon sx={{ fontSize: 14, mr: 0.5, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Call or Text&nbsp;<span className="crisis-number">988</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#c62828', opacity: 0.75, ml: 0.5 }}>
            Suicide &amp; Crisis Lifeline
          </Typography>
        </Box>
        <Box className="crisis-divider" />
        <Box className="crisis-item">
          <SmsIcon sx={{ fontSize: 14, mr: 0.5, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Text&nbsp;<span className="crisis-number">HOME</span>&nbsp;to&nbsp;<span className="crisis-number">741741</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#c62828', opacity: 0.75, ml: 0.5 }}>
            Crisis Text Line
          </Typography>
        </Box>
        <Box className="crisis-divider" />
        <Box className="crisis-item">
          <Typography variant="caption" sx={{ color: '#b71c1c', opacity: 0.7 }}>
            Free · Confidential · 24/7
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <Box
      className={`message-row ${isUser ? 'message-user' : 'message-bot'}`}
    >
      {!isUser && (
        <Box className="bot-avatar">
          <span>💙</span>
        </Box>
      )}
      <Box className={`message-content ${isUser ? 'message-content-user' : 'message-content-bot'}`}>
        <Box className={`bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
          <Typography sx={{ lineHeight: 1.65, fontSize: '0.94rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
        </Box>
        <Typography variant="caption" className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
      {isUser && (
        <Box className="user-avatar">
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>You</Typography>
        </Box>
      )}
    </Box>
  );
}

function TypingIndicator() {
  return (
    <Box className="message-row message-bot">
      <Box className="bot-avatar"><span>💙</span></Box>
      <Box className="bubble bubble-bot" sx={{ px: 2.5, py: 1.5 }}>
        <Box className="typing-dots">
          <span /><span /><span />
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: userText, timestamp: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    const apiMessages = updated
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: data.message, timestamp: new Date() },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  const showSuggestions = messages.length === 1;

  return (
    <Box className="app-container">

      {/* US Crisis Helpline Banner */}
      <CrisisBanner />

      {/* Header */}
      <Box className="chat-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box className="header-logo">
            <AutoAwesomeIcon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
              MindfulChat
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box className="online-dot" />
              <Typography variant="caption" sx={{ color: '#7c4dff', fontWeight: 600, fontSize: '0.7rem' }}>
                Always here for you
              </Typography>
            </Box>
          </Box>
        </Box>
        <Tooltip title="Clear conversation">
          <IconButton onClick={clearConversation} size="small" className="clear-btn">
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages */}
      <Box className="messages-area">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggested prompts */}
      {showSuggestions && (
        <Box className="suggestions-area">
          <Typography variant="caption" className="suggestions-label">
            What's on your mind?
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                onClick={() => sendMessage(prompt)}
                size="small"
                className="suggestion-chip"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input */}
      <Box className="input-area">
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share what's on your mind… (Enter to send)"
          variant="outlined"
          disabled={loading}
          className="message-input"
        />
        <IconButton
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="send-btn"
        >
          <SendIcon sx={{ fontSize: 19 }} />
        </IconButton>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
