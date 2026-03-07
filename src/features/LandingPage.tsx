import type { ReactNode } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ToolCard from "../components/ToolCard";
import PrivacyBanner from "../components/PrivacyBanner";

interface Tool {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
}

const tools: Tool[] = [
  {
    title: "Merge",
    description: "Combine multiple PDFs into one document",
    to: "/merge",
    icon: (
      <div className="h-10 w-10 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="10" height="14" rx="1" />
          <rect x="12" y="7" width="10" height="14" rx="1" />
        </svg>
      </div>
    ),
  },
  {
    title: "Split",
    description: "Extract pages from a PDF",
    to: "/split",
    icon: (
      <div className="h-10 w-10 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="1" />
          <circle cx="6" cy="18" r="1" />
          <line x1="12" y1="2" x2="12" y2="10" />
          <line x1="12" y1="14" x2="12" y2="22" />
          <line x1="9" y1="5" x2="15" y2="5" />
          <line x1="9" y1="19" x2="15" y2="19" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </div>
    ),
  },
  {
    title: "Compress",
    description: "Reduce PDF file size",
    to: "/compress",
    icon: (
      <div className="h-10 w-10 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14l4-4 4 4" />
          <path d="M20 10l-4 4-4-4" />
          <line x1="8" y1="10" x2="8" y2="3" />
          <line x1="16" y1="14" x2="16" y2="21" />
        </svg>
      </div>
    ),
  },
  {
    title: "Rotate",
    description: "Rotate PDF pages",
    to: "/rotate",
    icon: (
      <div className="h-10 w-10 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12a8 8 0 0114.93-4" />
          <path d="M20 12a8 8 0 01-14.93 4" />
          <polyline points="22 4 19 8 15 5" />
          <polyline points="2 20 5 16 9 19" />
        </svg>
      </div>
    ),
  },
  {
    title: "Sign",
    description: "Add your signature to a PDF",
    to: "/sign",
    icon: (
      <div className="h-10 w-10 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 2.5l4 4L7 21H3v-4L17.5 2.5z" />
          <line x1="14" y1="6" x2="18" y2="10" />
        </svg>
      </div>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              All your PDF tools in one place. 100% private.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Merge, split, compress, rotate, and sign PDFs directly in your
              browser. Your files never leave your device.
            </p>
          </div>
        </section>

        {/* Privacy banner */}
        <div className="mx-auto max-w-5xl px-4">
          <PrivacyBanner />
        </div>

        {/* Tool cards grid */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard
                key={tool.title}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                to={tool.to}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
