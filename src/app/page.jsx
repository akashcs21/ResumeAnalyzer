import ResumeUploadHero from "@/components/resume/ResumeUploadHero";

export default function HomePage() {
  // TODO: Get actual userId from Clerk auth
  const userId = "demo-user-id";

  return <ResumeUploadHero userId={userId} />;
}
