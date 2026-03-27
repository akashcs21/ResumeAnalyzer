import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import AnalysisBootstrapper from "@/components/resume/AnalysisBootstrapper";
import InsightsPanel from "@/components/resume/InsightsPanel";
import ScoreGauge from "@/components/resume/ScoreGauge";
import MagicBento, { MagicBentoItem } from "@/components/ui/MagicBento";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";

function SkeletonBlock({ width = "100%", height = 16, radius = 12, style = {} }) {
  return (
    <div
      className="skeleton-block"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

function DetailPill({ children, tone = "rgba(148, 163, 184, 0.16)", color = "#cbd5e1" }) {
  return (
    <span
      className="transition-transform hover:scale-105"
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "999px",
        padding: "6px 10px",
        background: tone,
        color,
        fontSize: "12px",
        lineHeight: 1,
        whiteSpace: "nowrap",
        cursor: "default"
      }}
    >
      {children}
    </span>
  );
}

function StatValue({ label, value, tone, hint, detailTitle, details = [] }) {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div style={{ color: "#cbd5e1", fontSize: "12px", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color: tone, fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5 }}>{hint}</div>
      {detailTitle ? (
        <div style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>
          {detailTitle}
        </div>
      ) : null}
      {details.length ? (
        <div className="flex flex-wrap gap-2">
          {details.map((detail) => (
            <DetailPill key={detail.label} tone={detail.tone} color={detail.color}>
              {detail.label}
            </DetailPill>
          ))}
        </div>
      ) : null}
    </div>
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

  const analysisPending = !chat.analysis;
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
  const keywordPreview = (analysis.missingKeywords || []).slice(0, 3);
  const issuePreview = (analysis.formattingIssues || []).slice(0, 2);
  const rewritePreview = (analysis.suggestedBulletPoints || []).slice(0, 2);

  return (
    <div
      className="min-h-[100dvh] xl:h-[100dvh] overflow-y-auto xl:overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255, 92, 63, 0.14), transparent 24%), radial-gradient(circle at top right, rgba(0, 148, 255, 0.12), transparent 26%), linear-gradient(180deg, #07101c 0%, #020617 100%)",
      }}
    >
      <MagicBento
        className="mx-auto h-full max-w-[1540px]"
        textAutoHide
        enableStars
        enableSpotlight
        enableBorderGlow
        enableTilt={false}
        enableMagnetism={false}
        clickEffect
        spotlightRadius={400}
        particleCount={12}
        glowColor="132, 0, 255"
        disableAnimations={false}
      >
        <MagicBentoItem
          className="col-span-12 xl:col-span-6"
          style={{ padding: "16px" }}
          index={0}
        >
            <div className="flex h-full items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
              <div className="shrink-0">
                {analysisPending ? (
                  <SkeletonBlock
                    width={112}
                    height={112}
                    radius={999}
                    style={{ border: "10px solid rgba(148, 163, 184, 0.08)" }}
                  />
                ) : (
                  <ScoreGauge score={analysis.score || 0} size={112} />
                )}
              </div>
              <div className="min-w-0">
                {analysisPending ? (
                  <>
                    <div className="animate-pulse mb-3 relative">
                      <h2 className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-extrabold text-[26px] leading-[1.2]">
                        Unleashing AI on your resume 🚀
                      </h2>
                      <p className="text-indigo-300/80 text-sm mt-1">Hold on tight, compiling your career insights...</p>
                    </div>
                    <SkeletonBlock width="95%" height={14} radius={10} style={{ marginBottom: 8 }} />
                    <SkeletonBlock width="88%" height={14} radius={10} style={{ marginBottom: 8 }} />
                    <SkeletonBlock width="64%" height={14} radius={10} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <SkeletonBlock width={132} height={28} radius={999} />
                      <SkeletonBlock width={148} height={28} radius={999} />
                      <SkeletonBlock width={134} height={28} radius={999} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                      <Link 
                        href="/" 
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all shadow-sm flex-shrink-0"
                        title="Back to Home"
                      >
                        <Home size={18} />
                      </Link>
                      <div
                        className="text-lg sm:text-2xl md:text-[28px] truncate"
                        style={{
                          color: "#f8fafc",
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        {chat.title}
                      </div>
                    </div>
                    <p className="hidden sm:block" style={{ color: "#cbd5e1", margin: 0, lineHeight: 1.65, maxWidth: "56ch" }}>
                      Interactive resume workspace. Review metrics, inspect gaps, and use the chat to tailor the resume for specific roles.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <DetailPill tone="rgba(255, 155, 74, 0.16)" color="#ffb977">
                        ATS score {analysis.score}/100
                      </DetailPill>
                      <DetailPill tone="rgba(90, 232, 159, 0.16)" color="#8ef2bb">
                        {chat.messages.length} saved messages
                      </DetailPill>
                      <DetailPill tone="rgba(123, 97, 255, 0.16)" color="#b5a8ff">
                        Analysis complete
                      </DetailPill>
                    </div>
                  </>
                )}
              </div>
            </div>
          </MagicBentoItem>

        <MagicBentoItem className="col-span-12 sm:col-span-6 xl:col-span-2" style={{ padding: "22px" }} index={1}>
          {analysisPending ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <SkeletonBlock width="34%" height={12} radius={8} />
              <SkeletonBlock width="32%" height={44} radius={12} />
              <SkeletonBlock width="88%" height={14} radius={10} />
              <SkeletonBlock width="42%" height={12} radius={8} />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock width={66} height={28} radius={999} />
                <SkeletonBlock width={62} height={28} radius={999} />
                <SkeletonBlock width={74} height={28} radius={999} />
              </div>
            </div>
          ) : (
            <StatValue
              label="Keywords"
              value={missingKeywordsCount}
              tone="#ff9b4a"
              hint="Terms still missing from the resume."
              detailTitle="Top gaps"
              details={keywordPreview.map((item) => ({
                label: item,
                tone: "rgba(255, 155, 74, 0.14)",
                color: "#ffbe84",
              }))}
            />
          )}
        </MagicBentoItem>

        <MagicBentoItem className="col-span-12 sm:col-span-6 xl:col-span-2" style={{ padding: "22px" }} index={2}>
          {analysisPending ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <SkeletonBlock width="26%" height={12} radius={8} />
              <SkeletonBlock width="28%" height={44} radius={12} />
              <SkeletonBlock width="84%" height={14} radius={10} />
              <SkeletonBlock width="46%" height={12} radius={8} />
              <div className="flex flex-col gap-2">
                <SkeletonBlock width="92%" height={28} radius={999} />
                <SkeletonBlock width="76%" height={28} radius={999} />
              </div>
            </div>
          ) : (
            <StatValue
              label="Issues"
              value={formattingIssuesCount}
              tone="#ff7b7b"
              hint="Structure or readability problems."
              detailTitle="Top blockers"
              details={issuePreview.map((item) => ({
                label: item.length > 28 ? `${item.slice(0, 28)}...` : item,
                tone: "rgba(255, 123, 123, 0.14)",
                color: "#ffb1b1",
              }))}
            />
          )}
        </MagicBentoItem>

        <MagicBentoItem className="col-span-12 xl:col-span-2" style={{ padding: "22px" }} index={3}>
          {analysisPending ? (
            <div className="flex h-full flex-col justify-between gap-4">
              <SkeletonBlock width="34%" height={12} radius={8} />
              <SkeletonBlock width="24%" height={44} radius={12} />
              <SkeletonBlock width="86%" height={14} radius={10} />
              <SkeletonBlock width="52%" height={12} radius={8} />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock width={72} height={28} radius={999} />
                <SkeletonBlock width={72} height={28} radius={999} />
              </div>
            </div>
          ) : (
            <StatValue
              label="Rewrites"
              value={rewritesCount}
              tone="#5ae89f"
              hint="Suggested bullet upgrades available."
              detailTitle="Ready to revise"
              details={rewritePreview.map((item, index) => ({
                label: item.original.length > 24 ? `Bullet ${index + 1}` : item.original,
                tone: "rgba(90, 232, 159, 0.14)",
                color: "#9ef0c0",
              }))}
            />
          )}
        </MagicBentoItem>

        <MagicBentoItem
          className="col-span-12 xl:col-span-3 min-h-0 xl:h-full min-h-[420px] xl:min-h-0"
          style={{ padding: "0", overflow: "hidden" }}
          index={4}
        >
          <div className="flex h-full min-h-0 flex-col">
            <AnalysisBootstrapper chatId={chat.id} shouldAnalyze={analysisPending} />
            <div className="min-h-0 flex-1">
              <InsightsPanel
                missingKeywords={analysis.missingKeywords}
                formattingIssues={analysis.formattingIssues}
                suggestedBulletPoints={analysis.suggestedBulletPoints}
                isPending={analysisPending}
              />
            </div>
          </div>
        </MagicBentoItem>

        <MagicBentoItem
          className="col-span-12 xl:col-span-9 h-[70vh] xl:h-auto xl:min-h-0"
          style={{ padding: "0", overflow: "hidden" }}
          index={5}
        >
          <ChatWindow chatId={chat.id} initialMessages={initialMessages} />
        </MagicBentoItem>
      </MagicBento>
    </div>
  );
}
