import { Link } from "react-router-dom";
import { Users, Clipboard, UserCog, Layers, FileText, Instagram, Facebook, Twitter } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-400">
      <div className="relative"/>
      
      <div className="relative z-10 text-center space-y-8 px-4 py-10 flex-grow">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900">CoFa ACs Survey Mgr</h1>
        <p className="text-xl text-slate-600 tracking-wide">CHOOSE A CATEGORY</p>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="
                  group
                  flex flex-col items-center justify-center rounded-lg bg-slate-100 p-8 backdrop-blur-sm transition-colors hover:bg-slate-200"
                >
                  {category.icon}
                  <span className="text-slate-900">{category.name}</span>
                </Link>
              ))}
            </div>
      </div>

      {/* Enlaces a redes sociales */}
      <div className="flex justify-center space-x-6 pt-8 pb-10">
        {socialLinks.map((social) => (
          <Link
            key={social.name}
            to={social.href}
            className="text-slate-600 hover:text-slate-500 transition-colors"
          >
            {social.icon}
            <span className="sr-only">{social.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

const categories = [
  {
    name: "People",
    href: "/people",
    icon: <UserCog className="h-8 w-8 text-slate-800" />,
  },
  {
    name: "Teams",
    href: "/teams",
    icon: <Users className="h-8 w-8 text-slate-800" />,
  },
  {
    name: "Assignments",
    href: "/assignments",
    icon: <Clipboard className="h-8 w-8 text-slate-800" />,
  },
  {
    name: "Surveys",
    href: "/surveys",
    icon: <FileText className="h-8 w-8 text-slate-800" />,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: <Layers className="h-8 w-8 text-slate-800" />,
  },
  {
    name: "Questions",
    href: "/questions",
    icon: <Clipboard className="h-8 w-8 text-slate-800" />,
  },
]

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: <Instagram className="h-6 w-6 text-slate-800" />,
  },
  {
    name: "Facebook",
    href: "#",
    icon: <Facebook className="h-6 w-6 text-slate-800" />,
  },
  {
    name: "Twitter",
    href: "#",
    icon: <Twitter className="h-6 w-6 text-slate-800" />,
  },
]
