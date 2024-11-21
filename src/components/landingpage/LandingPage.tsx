import Header from "./Header";
import CategoriesGrid from "./CategoriesGrid";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#031320] text-white font-mono">
      <div className="relative z-10 text-center space-y-12 px-4 py-16">
        {/* Logo and Title */}
        <Header />
        
        {/* Categories Grid */}
        <CategoriesGrid />
      </div>
    </div>
  );
}

export default LandingPage;