import { useState } from "react";
import { Link } from "react-router-dom";
import AboutPopup from "./AboutPopup";

export default function Header() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const toggleAbout = () => setIsAboutOpen(!isAboutOpen);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[#031320] text-white z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4">
              <img
                src="/survey_logo.svg"
                alt="SurveyMGR Logo"
                className="h-12 w-auto"
              />
              <h1 className="text-xl font-hasklig font-bold tracking-tight">
                {'{'}CoFa ACs survey mngr{'};'}
              </h1>
            </Link>
          </div>
          <button
            className="bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary-foreground hover:text-primary"
            onClick={toggleAbout}
          >
            About
          </button>
        </div>
      </header>
      <AboutPopup isOpen={isAboutOpen} onClose={toggleAbout} />
    </>
  );
}
