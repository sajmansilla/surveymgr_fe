import React from "react";
import { Link } from "react-router-dom";

const categories = [
  { name: "People", href: "/people", icon: "/joint-account-on-white.svg" },
  { name: "Reports", href: "/reports", icon: "/feedback-on-white.svg" },
  { name: "Teams", href: "/teams", icon: "/yes-I-am-new-on-white.svg" },
  { name: "Surveys", href: "/surveys", icon: "/survey-on-white.svg" },
  { name: "Categories & Questions", href: "/categories", icon: "/education-on-white.svg" },
  { name: "Assignments", href: "/assignments", icon: "/anouncement-on-white.svg" },
];

export default function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto font-body">
      {categories.map((category) => (
        <Link
          key={category.name}
          to={category.href}
          className="group p-8 rounded-lg hover:bg-secondary bg-card transition-colors duration-200"
        >
          <div className="flex flex-col items-center space-y-4">
            <img
              src={category.icon}
              alt={category.name}
              className="w-16 h-16"
            />
            <span className="text-xl tracking-wide text-primary font-bold">
              {'{ '}
              {category.name
                .toLowerCase()
                .split(' ')
                .map((word, index, array) => (
                  <React.Fragment key={index}>
                    {index > 0 && <br />}
                    {word}
                    {index === array.length - 1 ? '' : ''}
                  </React.Fragment>
                ))}
              {' };'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
