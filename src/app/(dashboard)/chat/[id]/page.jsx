import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import InsightsPanel from "@/components/resume/InsightsPanel";
import ScoreGauge from "@/components/resume/ScoreGauge";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

function Surface({ children, className = "", padding = "20px" }) {
  return (
    <section
      className={className}
      style={{
        borderRadius: "28px",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.7))",
        backdropFilter: "blur(18px)",
        padding,
      }}
    >
      {children}
    </section>
  );
}

function StatTile({ label, value, tone, hint }) {
  return (
    <Surface className="h-full">
      <div className="flex h-full flex-col justify-between gap-3">
        <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ color: tone, fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>{hint}</div>
      </div>
    </Surface>
  );
}

export default async function ChatPage({ params }) {
  const { id } = await params;

  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, id),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
      },
    },
  });

  if (!chat) {
    notFound();
  }

  const analysis = chat.analysis || {
    score: 0,
    missingKeywords: [],
    formattingIssues: [],
    suggestedBulletPoints: [],
  };

  const initialMessages = chat.messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
  }));

  const missingKeywordsCount = analysis.missingKeywords?.length || 0;
  const formattingIssuesCount = analysis.formattingIssues?.length || 0;
  const rewritesCount = analysis.suggestedBulletPoints?.length || 0;

  return (
    <div
      className="h-[100dvh] overflow-hidden px-4 py-4 lg:px-6"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(249, 115, 22, 0.15), transparent 24%), radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 26%), linear-gradient(180deg, #07111f 0%, #020617 100%)",
      }}
    >
      <div className="mx-auto flex h-full max-w-[1520px] flex-col gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(180px,0.75fr))]">
          <Surface className="h-full" padding="18px 22px">
            <div className="flex h-full items-center gap-5">
              <div className="shrink-0">
                <ScoreGauge score={analysis.score || 0} size={112} />
              </div>
              <div className="min-w-0">
                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "28px",
                    fontWeight: 800,
                    lineHeight: 1.12,
                    marginBottom: "8px",
                  }}
                >
                  {chat.title}
                </div>
                <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.6, maxWidth: "58ch" }}>
                  One-screen review workspace. Keep the insights on the left, and use the chat on
                  the right for rewrites, role targeting, and ATS improvements.
                </p>
              </div>
            </div>
          </Surface>

          <StatTile
            label="Keywords"
            value={missingKeywordsCount}
            tone="#fb923c"
            hint="Terms still missing from the resume."
          />
          <StatTile
            label="Issues"
            value={formattingIssuesCount}
            tone="#f87171"
            hint="Structure or readability problems."
          />
          <StatTile
            label="Rewrites"
            value={rewritesCount}
            tone="#4ade80"
            hint="Suggested bullet upgrades available."
          />
        </div>

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="min-h-0">
            <InsightsPanel
              missingKeywords={analysis.missingKeywords}
              formattingIssues={analysis.formattingIssues}
              suggestedBulletPoints={analysis.suggestedBulletPoints}
            />
          </div>

          <div className="min-h-0 min-w-0">
            <ChatWindow chatId={chat.id} initialMessages={initialMessages} />
          </div>
        </div>
      </div>
    </div>
  );
}
