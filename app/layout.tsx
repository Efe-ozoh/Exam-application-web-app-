import type { Metadata } from "next";
import Sidebar from "@/components/ui/Sidebar";
import 'antd/dist/reset.css';
import './globals.css';
import { MathJaxContext } from "better-react-mathjax";

const config = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["$$", "$$"]],
  },
};

export const metadata: Metadata = {
  title: "Eduliver | Your UTME Success Hub",
  description: "Your UTME Success Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MathJaxContext config={config}>
          <Sidebar />

          <main className="w-full">{children}</main>
        </MathJaxContext>
      </body>
    </html>
  );
}
