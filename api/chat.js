const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are MindfulChat, a compassionate and supportive mental health companion. Your role is to provide emotional support, a safe space to express feelings, and practical coping strategies.

Guidelines:
- Listen actively and respond with genuine empathy and warmth
- Validate emotions without judgment ("That sounds really hard", "It makes complete sense you'd feel that way")
- Offer practical coping strategies when appropriate: breathing exercises, grounding techniques (5-4-3-2-1 method), journaling prompts, mindfulness practices
- Keep responses conversational, warm, and focused — like a caring friend, not a clinical textbook
- Responses should be 2-3 short paragraphs. Be concise but meaningful. Avoid long lists or bullet points.
- Gently encourage professional help when discussing ongoing conditions, trauma, or medication needs
- Ask thoughtful follow-up questions to show you're truly listening

CRITICAL SAFETY PROTOCOL — If someone expresses suicidal thoughts, self-harm urges, or is in immediate danger:
1. Acknowledge their pain with compassion and WITHOUT judgment
2. Immediately include this: "If you're in crisis right now, please reach out to the 988 Suicide & Crisis Lifeline — just call or text 988 (available 24/7 in the US). Outside the US, visit findahelpline.com for local resources. You can also go to your nearest emergency room."
3. Stay present in the conversation — gently ask if they are safe right now
4. Do NOT abruptly end the conversation

Remember: You are a caring companion, not a replacement for professional mental health care. But your warmth and presence can make a real difference.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.',
    });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const AnthropicClient = Anthropic.default || Anthropic;
    const client = new AnthropicClient({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    return res.status(200).json({ message: response.content[0].text });
  } catch (error) {
    console.error('Anthropic API error:', error);

    if (error instanceof Error) {
      if (error.status === 401) {
        return res.status(401).json({ error: 'Invalid API key. Please check your ANTHROPIC_API_KEY.' });
      }
      if (error.status === 429) {
        return res.status(429).json({ error: 'Rate limit reached. Please try again in a moment.' });
      }
    }

    return res.status(500).json({ error: 'Failed to get a response. Please try again.' });
  }
};
