import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './AIChatbot.css';

const PRESET_QUESTIONS = [
  '🍰 Recommend a cake under ₹600',
  '🍮 What sweets are bestsellers?',
  '🥨 Show crispy savouries & snacks',
  '🎁 How do loyalty points work?',
  '🚚 Delivery cities & timing'
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Hello! I am Mithai Assistant. Ask me any question about our sweets, cakes, prices, ingredients, or order delivery!',
      products: []
    }
  ]);

  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await productAPI.chatQuery(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.answer || 'Here are the best matching items from our store:',
        products: res.products || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Sorry, I had trouble connecting to the catalog. Please try asking again!',
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const weightId = product.weights && product.weights.length > 0 ? product.weights[0].id : null;
    await addToCart(product.id, weightId, 1, product);
    openCart();
  };

  return (
    <div className="ai-chatbot-wrapper">
      {/* Floating Launcher Button */}
      <button
        className={`ai-chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Ask Mithai AI Assistant"
        aria-label="Open AI Assistant"
      >
        <span className="toggle-icon">🤖</span>
        <span className="toggle-badge">AI Assistant</span>
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="ai-chatbot-window">
          {/* Header */}
          <div className="ai-chatbot-header">
            <div className="header-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h4>Mithai AI Assistant</h4>
                <span className="online-indicator">
                  <span className="dot"></span> Online • Accurate Q&A
                </span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Preset Chips */}
          <div className="ai-preset-chips">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button key={idx} className="chip-btn" onClick={() => handleSend(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="ai-chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="msg-content">
                  <p>{msg.text}</p>

                  {/* Product Recommendation Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chat-product-grid">
                      {msg.products.map((p) => (
                        <div key={p.id} className="chat-product-card">
                          <img src={p.image_url} alt={p.name} className="chat-prod-img" />
                          <div className="chat-prod-info">
                            <span className="chat-prod-cat">{p.category_name || 'Bakery'}</span>
                            <h5 className="chat-prod-name">{p.name}</h5>
                            <div className="chat-prod-price-row">
                              <span className="chat-prod-price">₹{p.base_price}</span>
                              <span className="chat-prod-rating">★ {p.rating || 4.5}</span>
                            </div>
                            <div className="chat-prod-actions">
                              <button
                                className="chat-add-btn"
                                onClick={() => handleAddToCart(p)}
                              >
                                + Add
                              </button>
                              <button
                                className="chat-view-btn"
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/products/slug/${p.slug}`);
                                }}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message bot loading">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form className="ai-chatbot-input-bar" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
              type="text"
              placeholder="Ask a question (e.g. chocolate cakes under 500)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
            <button type="submit" disabled={!inputQuery.trim() || loading}>
              Send ➢
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
