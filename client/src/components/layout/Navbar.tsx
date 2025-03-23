import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, BookOpen, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location === path;
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Show initial of name in avatar fallback
  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username[0].toUpperCase();
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-primary-800 font-sans">EduHub</span>
                </div>
              </a>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <NavLink href="/" isActive={isActive("/")}>Home</NavLink>
              <NavLink href="/courses" isActive={isActive("/courses")}>Courses</NavLink>
              <NavLink href="/about" isActive={isActive("/about")}>About</NavLink>
              <NavLink href="/contact" isActive={isActive("/contact")}>Contact</NavLink>
            </div>
          </div>
          
          {/* Desktop right side */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search courses..." 
                className="bg-gray-100 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href={user.isAdmin ? "/admin" : "/dashboard"}>
                      <a className="flex w-full cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>{user.isAdmin ? "Admin Dashboard" : "My Dashboard"}</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="flex w-full cursor-pointer items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex cursor-pointer items-center text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" className="text-primary">Log in</Button>
                </Link>
                <Link href="/auth?signup=true">
                  <Button className="bg-primary hover:bg-primary/90">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavMobileLink href="/" isActive={isActive("/")}>Home</NavMobileLink>
              <NavMobileLink href="/courses" isActive={isActive("/courses")}>Courses</NavMobileLink>
              <NavMobileLink href="/about" isActive={isActive("/about")}>About</NavMobileLink>
              <NavMobileLink href="/contact" isActive={isActive("/contact")}>Contact</NavMobileLink>
            </div>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4 space-y-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-lg text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
                
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-2 py-1">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <Link href={user.isAdmin ? "/admin" : "/dashboard"}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        <span>{user.isAdmin ? "Admin Dashboard" : "My Dashboard"}</span>
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start" 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link href="/auth">
                      <Button variant="outline" className="w-full">Log in</Button>
                    </Link>
                    <Link href="/auth?signup=true">
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

type NavLinkProps = {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
};

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link href={href}>
      <a className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium 
        ${isActive 
          ? "text-primary nav-link-active" 
          : "text-gray-600 hover:text-primary nav-link"}`}
      >
        {children}
      </a>
    </Link>
  );
}

function NavMobileLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link href={href}>
      <a className={`block px-3 py-2 rounded-md text-base font-medium 
        ${isActive 
          ? "bg-primary-50 text-primary" 
          : "text-gray-600 hover:bg-gray-50 hover:text-primary"}`}
      >
        {children}
      </a>
    </Link>
  );
}
