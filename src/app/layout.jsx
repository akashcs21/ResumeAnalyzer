import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Resume Analyzer",
  description: "AI-powered resume analysis and chat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
