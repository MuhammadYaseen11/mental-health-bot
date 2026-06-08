import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Paper,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import './App.css';

const SUGGESTED_PROMPTS = [
  "I've been feeling really anxious lately",
  "I'm struggling to sleep and feel overwhelmed",
  "I need help managing stress at work",
  "I feel lonely and disconnected",
  "I want to learn mindfulness techniques",
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm here for you 💙\n\nThis is a safe space where you can talk about anything on your mind — stress, anxiety, relationships, or just how your day went.\n\nI'm not a therapist, but I'm here to listen and support you. How are you feeling today?",
  timestamp: new Date(),
};

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: '#7c4dff', width: 36, height: 36, fontSize: '1rem', flexShrink: 0 }}>
          💙
        </Avatar>
      )}
      <Box sx={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            bgcolor: isUser ? '#7c4dff' : '#f3f0ff',
            color: isUser ? 'white' : '#1a1a2e',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.65, fontSize: '0.95rem' }}>
            {message.content}
          </Typography>
        </Paper>
        <Typography variant="caption" sx={{ color: '#9e9e9e', mt: 0.5, px: 0.5 }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
      {isUser && (
        <Avatar sx={{ bgcolor: '#e8eaf6', color: '#5c35cc', width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
          You
        </Avatar>
      )}
    </Box>
  );
}

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
      <Avatar sx={{ bgcolor: '#7c4dff', width: 36, height: 36, fontSize: '1rem' }}>💙</Avatar>
      <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: '18px 18px 18px 4px', bgcolor: '#f3f0ff' }}>
        <Box className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </Box>
      </Paper>
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
      {/* Header */}
      <Box className="chat-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#7c4dff', width: 44, height: 44 }}>
            <FavoriteIcon sx={{ color: 'white', fontSize: 22 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, fontSize: '1.1rem' }}>
              MindfulChat
            </Typography>
            <Typography variant="caption" sx={{ color: '#7c4dff', fontWeight: 500 }}>
              Your mental wellness companion
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Clear conversation">
          <IconButton onClick={clearConversation} size="small" sx={{ color: '#9e9e9e', '&:hover': { color: '#7c4dff' } }}>
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Crisis banner */}
      <Box className="disclaimer-banner">
        <Typography variant="caption" sx={{ color: '#555', textAlign: 'center', display: 'block' }}>
          Not a substitute for professional help. In crisis? Call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline, US) · International: <strong>findahelpline.com</strong>
        </Typography>
      </Box>

      {/* Messages area */}
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
          <Typography variant="caption" sx={{ color: '#9e9e9e', mb: 1, display: 'block', fontWeight: 500 }}>
            Try saying...
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                onClick={() => sendMessage(prompt)}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#c5b3ff',
                  color: '#5c35cc',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  '&:hover': { bgcolor: '#f3f0ff', borderColor: '#7c4dff' },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input area */}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: '#fafafa',
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#c5b3ff' },
              '&.Mui-focused fieldset': { borderColor: '#7c4dff' },
            },
          }}
        />
        <IconButton
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          sx={{
            bgcolor: '#7c4dff',
            color: 'white',
            width: 48,
            height: 48,
            ml: 1,
            flexShrink: 0,
            '&:hover': { bgcolor: '#651fff' },
            '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#bdbdbd' },
          }}
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
