import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { api } from "../../services/api";

export default function ChatModal({ open, worker, onClose }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  //---------------------------------------------------
  // Scroll to latest message
  //---------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  //---------------------------------------------------
  // ESC Close
  //---------------------------------------------------

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  //---------------------------------------------------
  // Load Messages
  //---------------------------------------------------

  useEffect(() => {
    if (!open || !worker) return;

    loadMessages();
  }, [open, worker]);

  async function loadMessages() {
    try {
      setLoading(true);

      const data = await api.get("messages/");

      const allMessages = Array.isArray(data) ? data : data.results || [];

      const currentUser = JSON.parse(localStorage.getItem("user"))
      const filtered = allMessages.filter((msg) => {
        return (
          String(msg.sender) === String(currentUser.id) &&
          String(msg.receiver) === String(worker.userId)
        ) ||
          (
            String(msg.sender) === String(worker.userId) &&
            String(msg.receiver) === String(currentUser.id)
          );
      });

      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //---------------------------------------------------
  // Send Message
  //---------------------------------------------------

  async function sendMessage() {
    if (!message.trim()) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const payload = {
        sender: currentUser.id,
        receiver: worker.userId,
        content: message.trim(),
      };

      await api.post("messages/", payload);

      setMessage("");

      loadMessages();
    } catch (err) {
      console.error(err);
    }
  }

  //---------------------------------------------------
  // ENTER
  //---------------------------------------------------

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  //---------------------------------------------------
  // Closed
  //---------------------------------------------------

  if (!open || !worker) return null;

  //---------------------------------------------------
  // Avatar
  //---------------------------------------------------

  const initials = `${worker.first_name?.[0] || ""}${worker.last_name?.[0] || ""}`;

  //---------------------------------------------------
  // JSX
  //---------------------------------------------------

  return (
    <>
      <div className="chat-overlay" onClick={onClose} />

      <div className="chat-modal">
        {/* Header */}

        <div className="chat-header">
          <div className="chat-user">
            {worker.profile_picture ? (
              <img
                src={worker.profile_picture}
                alt=""
                className="chat-avatar"
              />
            ) : (
              <div className="chat-avatar initials">
                {initials || worker.username[0]}
              </div>
            )}

            <div>
              <h3>
                {worker.first_name} {worker.last_name}
              </h3>

              <span>@{worker.username}</span>
            </div>
          </div>

          <button className="chat-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Messages */}

        <div className="chat-body">
          {loading ? (
            <div className="chat-loading">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <h3>No Messages Yet</h3>

              <p>Start the conversation with {worker.first_name}.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender === JSON.parse(localStorage.getItem("user")).id
                    ? "sent"
                    : "received"
                }`}
              >
                <div className="message-bubble">
                  {msg.content}

                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}

        <div className="chat-input">
          <textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={sendMessage}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
