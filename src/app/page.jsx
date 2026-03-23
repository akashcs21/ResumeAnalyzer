import ResumeUploadHero from "@/components/resume/ResumeUploadHero";
import { auth, signOut } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-200">
      <div className="absolute top-4 right-6 z-50">
        {userId ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-700 hover:text-white rounded-full transition-all border border-slate-700/50 shadow-sm"
            >
              Sign out
            </button>
          </form>
        ) : (
          <a
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all border border-indigo-500/50 shadow-sm"
          >
            Sign in
          </a>
        )}
      </div>
      <ResumeUploadHero userId={userId} />
    </div>
  );
}
