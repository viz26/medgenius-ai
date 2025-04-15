import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, FlaskConical, HeartPulse, FileText, Beaker, TestTube } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Home", path: "/", icon: <HeartPulse className="mr-2 h-4 w-4" /> },
    { name: "Patient Analysis", path: "/patient-analysis", icon: <FileText className="mr-2 h-4 w-4" /> },
    { name: "Drug Recommendation", path: "/drug-recommendation", icon: <FlaskConical className="mr-2 h-4 w-4" /> },
    { name: "Drug Discovery", path: "/drug-discovery", icon: <Beaker className="mr-2 h-4 w-4" /> },
    { name: "Side Effects", path: "/side-effects", icon: <HeartPulse className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 py-4 px-6 md:px-12",
        isScrolled ? "backdrop-blur-lg bg-white/70 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 w-48">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 font-semibold text-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <FlaskConical className="h-6 w-6 text-blue-600" />
            <span className="font-semibold tracking-tight text-gray-900">MedGenius AI</span>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between flex-1 mx-8">
          <nav className="flex items-center justify-center space-x-8 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-blue-600 whitespace-nowrap",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="flex-shrink-0 w-48 flex justify-end">
            {user ? <UserMenu /> : (
              <NavLink
                to="/login"
                className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex-shrink-0 md:hidden">
          <button
            className="focus:outline-none text-gray-900"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/90 backdrop-blur-lg shadow-lg animate-fade-in">
          <div className="flex flex-col p-6 space-y-4 stagger-animation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => cn(
                  "flex items-center py-2 text-base font-medium transition-colors hover:text-blue-600 animate-slide-in",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
            
            {user ? (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    "flex items-center py-2 text-base font-medium transition-colors hover:text-blue-600 animate-slide-in",
                    isActive ? "text-blue-600" : "text-gray-600"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center py-2 text-base font-medium text-gray-600 hover:text-blue-600 transition-colors animate-slide-in"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
