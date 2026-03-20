export default function ChatPage({ params }) {
  const { id } = params;

  return (
    <div>
      <h1>Chat Session: {id}</h1>
      {/* ChatWindow component goes here */}
    </div>
  );
}
