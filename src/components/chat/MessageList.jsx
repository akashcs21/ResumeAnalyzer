// MessageList — Renders a list of chat messages
export default function MessageList({ messages }) {
  return (
    <div className="message-list">
      {messages?.map((msg, i) => (
        <div key={i} className={`message ${msg.role}`}>
          {msg.content}
        </div>
      ))}
    </div>
  );
}
