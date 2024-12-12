import { useState } from "react";
import { Link } from "react-router-dom";
import AboutPopup from "./AboutPopup";

const categories = [
  { name: "People", href: "/people" },
  { name: "Reports", href: "/reports" },
  { name: "Teams", href: "/teams" },
  { name: "Surveys", href: "/surveys" },
  { name: "Categories & Questions", href: "/categories" },
  { name: "Assignments", href: "/assignments" },
];

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
              <h1 className="text-xl font-hasklig font-semibold tracking-tight">
                {'{ '}CoFa ACs survey mngr{' };'}
              </h1>
            </Link>
          </div>
          <nav className="flex space-x-6 items-center">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="flex items-center space-x-2"
              >
                <span className="text-primary-foreground py-2 px-4 rounded hover:text-secondary">{category.name}</span>
              </Link>
            ))}
            <button
              className="text-primary-foreground py-2 px-4 rounded hover:text-secondary"
              onClick={toggleAbout}
            >
              About
            </button>
          </nav>
        </div>
      </header>
      <AboutPopup isOpen={isAboutOpen} onClose={toggleAbout} />
    </>
  );
}
