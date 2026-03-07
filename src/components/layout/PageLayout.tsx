import type { FC, ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PrivacyBanner from "../PrivacyBanner";

interface PageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const PageLayout: FC<PageLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
        <div className="mt-6">
          <PrivacyBanner />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
