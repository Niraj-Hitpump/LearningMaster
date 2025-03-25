import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function AdminNavbar() {
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread-count"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 10000, // Poll every 10 seconds
    onError: () => {
      // Silently handle polling errors
      console.warn("Failed to fetch unread count");
    }
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Link href="/admin" className="font-bold text-xl">
            Admin Panel
          </Link>
        </div>

        {/* Right section */}
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/admin/messages">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
