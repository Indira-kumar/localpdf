import type { FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="border-t border-gray-200 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-gray-500 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} LocalPDF</span>
        <span>100% private &ndash; files never leave your browser</span>
      </div>
    </footer>
  );
};

export default Footer;
