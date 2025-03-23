import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  BookOpen,
  Users,
  Settings,
  BarChart,
  PlusCircle,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get unread messages count for admin
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["/api/messages/unread"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAdmin,
    // Refetch every minute to keep badge updated
    refetchInterval: 60000,
  });

  const unreadCount = unreadMessages.length;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  // Create message menu item with unread count badge
  const messageMenuItem = {
    icon: MessageSquare,
    label: (
      <div className="flex items-center">
        Messages
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-2 text-xs px-1">
            {unreadCount}
          </Badge>
        )}
      </div>
    ),
    path: "/admin/messages"
  };

  // Define menu items based on user role
  const menuItems = isAdmin
    ? [
        { icon: Home, label: "Dashboard", path: "/admin" },
        { icon: BookOpen, label: "Courses", path: "/admin/courses" },
        { icon: PlusCircle, label: "Add Course", path: "/admin/courses/add" },
        { icon: Users, label: "Users", path: "/admin/users" },
        messageMenuItem,
        { icon: BarChart, label: "Analytics", path: "/admin/analytics" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
      ]
    : [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: BookOpen, label: "My Courses", path: "/dashboard/courses" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" },
      ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden px-4 py-3 flex items-center justify-between bg-white border-b">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-2 text-xl font-bold text-primary-800">EduHub</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full flex-col bg-white border-r w-64 fixed left-0 top-0 bottom-0">
        <div className="p-4 border-b">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary-800">EduHub</span>
            </div>
          </Link>
        </div>
        
        <div className="py-6 px-3 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start rounded-md mb-1 font-normal",
                    isActive(item.path) ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden z-40 fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="h-full w-64 bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <Link href="/">
                  <div className="flex items-center cursor-pointer">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="ml-2 text-xl font-bold text-primary-800">EduHub</span>
                  </div>
                </Link>
              </div>
              
              <div className="py-6 px-3 flex-1">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div onClick={() => setIsMobileOpen(false)}>
                        <Button
                          variant={isActive(item.path) ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start rounded-md mb-1 font-normal",
                            isActive(item.path) ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100",
                          )}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Log out
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
