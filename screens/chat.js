/* ============================================================
   screens/chat.js – Buddy Chatbot Screen
   ============================================================ */

const BOT_RESPONSES = [
    {
        keywords: ['sad', 'down', 'unhappy', 'depressed', 'hopeless', 'cry'],
        reply: "I'm really sorry you're feeling that way 💙 It takes courage to share. Can you tell me a little more about what's been going on?"
    },
    {
        keywords: ['anxious', 'anxiety', 'worried', 'nervous', 'panic', 'stress'],
        reply: "It sounds like anxiety is really weighing on you right now. Try taking 3 slow deep breaths with me. Breathe in for 4 counts… hold for 4… out for 4. 🌬️ You're doing great."
    },
    {
        keywords: ['happy', 'good', 'great', 'wonderful', 'excited', 'joy'],
        reply: "That's wonderful to hear! 🌟 Moments of happiness are worth celebrating. What made today feel great for you?"
    },
    {
        keywords: ['tired', 'exhausted', 'sleep', 'fatigue', 'drained'],
        reply: "Rest is so important for mental well-being. Are you getting enough sleep? Even small changes — like putting your phone down 30 minutes before bed — can help a lot. 😴"
    },
    {
        keywords: ['angry', 'frustrated', 'irritated', 'annoyed', 'mad'],
        reply: "It's completely valid to feel frustrated. Feelings of anger often signal that something important to us isn't being respected. Would you like to talk about what triggered this? 🙏"
    },
    {
        keywords: ['lonely', 'alone', 'isolated', 'no one'],
        reply: "Loneliness can feel incredibly heavy. Please know that you matter, and I'm here with you right now. Would you like to explore some ways to feel more connected? 💜"
    },
    {
        keywords: ['help', 'support', 'therapist', 'doctor', 'professional'],
        reply: "Reaching out is the bravest first step. 🌿 I'd recommend speaking with a licensed mental health professional. Would you like me to show you some resources?"
    },
    {
        keywords: ['phq', 'assessment', 'score', 'screening'],
        reply: "The PHQ-9 is a great way to track how you've been feeling over the past two weeks. Want me to take you there?"
    },
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy'],
        reply: "Hi there! 👋 I'm Buddy, your mental health companion. I'm here to listen without judgment, anytime. How are you feeling right now?"
    },
    {
        keywords: ['thank', 'thanks', 'appreciate'],
        reply: "You're so welcome! 🤗 Remember, I'm always here whenever you need someone to talk to."
    },
];

const DEFAULT_REPLIES = [
    "I hear you. Can you tell me more about that? I'm all ears. 💙",
    "Thank you for sharing that with me. This is a safe space — take your time. 🌿",
    "It sounds like you're going through a lot. You're not alone in this. How long have you been feeling this way?",
    "That's really important. I want to make sure I understand — can you say a bit more?",
    "I appreciate you opening up. How does that make you feel overall? 🌸",
];

function getBotReply(msg) {
    const lower = msg.toLowerCase();
    for (const r of BOT_RESPONSES) {
        if (r.keywords.some(k => lower.includes(k))) return r.reply;
    }
    return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
}

function timeStr() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderChat() {
    const msgs = AppState.chatHistory.map(m => renderBubble(m)).join('');
    return `
  <div class="chat-screen">
    <div class="chat-header">
      <div class="bot-avatar">🤗</div>
      <div>
        <div class="bot-name">Buddy</div>
        <div class="bot-status">Online — here for you</div>
      </div>
    </div>
    <div class="chat-messages" id="chatMessages">
      ${AppState.chatHistory.length === 0 ? renderBubble({ role: 'bot', text: `Hi ${AppState.user.name}! 👋 I'm Buddy, your mental wellness companion. This is a safe, judgment-free space. What's on your mind today?`, time: timeStr() }) : msgs}
    </div>
    <div class="chat-input-bar">
      <button class="voice-btn" id="voiceBtn" title="Voice to text" aria-label="Voice input">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </button>
      <textarea class="chat-input" id="chatInput" placeholder="Share what's on your mind…" rows="1" aria-label="Chat input"></textarea>
      <button class="send-btn" id="sendBtn" aria-label="Send message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
      </button>
    </div>
  </div>`;
}

function renderBubble({ role, text, time }) {
    if (role === 'bot') {
        return `<div class="msg msg-bot">
      <div class="msg-avatar">🤗</div>
      <div>
        <div class="msg-bubble">${text}</div>
        <div class="msg-time">${time || ''}</div>
      </div>
    </div>`;
    }
    return `<div class="msg msg-user">
    <div class="msg-avatar" style="background:linear-gradient(135deg,var(--lavender),var(--teal));font-size:14px;color:#fff;font-weight:700;">${AppState.user.initials}</div>
    <div>
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">${time || ''}</div>
    </div>
  </div>`;
}

function addMessage(role, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const msg = { role, text, time: timeStr() };
    AppState.chatHistory.push(msg);
    container.insertAdjacentHTML('beforeend', renderBubble(msg));
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'msg msg-bot'; div.id = 'typingIndicator';
    div.innerHTML = `<div class="msg-avatar">🤗</div>
    <div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    addMessage('user', text);
    showTyping();
    const delay = 800 + Math.random() * 800;
    setTimeout(() => {
        hideTyping();
        addMessage('bot', getBotReply(text));
    }, delay);
}

function initChat() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const voiceBtn = document.getElementById('voiceBtn');

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        });
    }

    // Voice-to-text
    if (voiceBtn) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const recognition = new SR();
            recognition.lang = 'en-US'; recognition.interimResults = false;
            recognition.onresult = e => {
                if (chatInput) chatInput.value += e.results[0][0].transcript + ' ';
                voiceBtn.classList.remove('listening');
            };
            recognition.onerror = () => voiceBtn.classList.remove('listening');
            voiceBtn.addEventListener('click', () => {
                if (voiceBtn.classList.contains('listening')) {
                    recognition.stop(); voiceBtn.classList.remove('listening');
                } else {
                    recognition.start(); voiceBtn.classList.add('listening');
                    showToast('🎙️ Listening… speak now');
                }
            });
        } else {
            voiceBtn.addEventListener('click', () => showToast('⚠️ Voice not supported in this browser'));
        }
    }

    // Scroll to bottom
    const msgs = document.getElementById('chatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
}
