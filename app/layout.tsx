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

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("eduliver-theme");
    var isDark = stored === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  } catch (error) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased transition-colors duration-200">
        <MathJaxContext config={config}>
          <Sidebar />

          <div className="w-full">{children}</div>
        </MathJaxContext>
      </body>
    </html>
  );
}
