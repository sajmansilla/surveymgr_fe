import { Link } from "react-router-dom";

const categories = [
  { name: "People", href: "/people", icon: "/yes-I-am-new-on-dark.svg" },
  { name: "Teams", href: "/teams", icon: "/joint-account-on-dark.svg" },
  { name: "Assignments", href: "/assignments", icon: "/anouncement-on-dark.svg" },
  { name: "Surveys", href: "/surveys", icon: "/feedback-on-dark.svg" },
  { name: "Categories", href: "/categories", icon: "/education-on-dark.svg" },
  { name: "Questions", href: "/questions", icon: "/survey-on-dark.svg" },
];

export default function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto font-hasklig">
      {categories.map((category) => (
        <Link
          key={category.name}
          to={category.href}
          className="group p-8 rounded-lg hover:bg-[#0a1925] bg-[#112331] transition-colors duration-200"
        >
          <div className="flex flex-col items-center space-y-4">
            <img
              src={category.icon}
              alt={category.name}
              className="w-16 h-16"
            />
            <span className="text-xl tracking-wide">
              {'{'}
              {category.name.toLowerCase()}
              {'};'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
