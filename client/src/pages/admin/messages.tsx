import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";

// Define our own MessageReply type to match what the API returns
interface MessageReply {
  id: number;
  messageId: number;
  userId: number;
  content: string;
  createdAt: Date;
  isAdmin: boolean;
  read: boolean;
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/sidebar";
import { Mail, MessageCircle, User as UserIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";

// Message with replies and user information
type MessageWithDetails = Message & {
  replies: MessageReply[];
  user?: Pick<User, "username" | "email" | "firstName" | "lastName">;
};

export default function AdminMessages() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("unread");
  const [selectedMessage, setSelectedMessage] = useState<MessageWithDetails | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch all messages
  const {
    data: allMessages = [],
    isLoading: isLoadingAllMessages,
    error: allMessagesError,
  } = useQuery<MessageWithDetails[]>({
    queryKey: ["/api/messages"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch unread messages
  const {
    data: unreadMessages = [],
    isLoading: isLoadingUnreadMessages,
    error: unreadMessagesError,
  } = useQuery<MessageWithDetails[]>({
    queryKey: ["/api/messages/unread"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Mutation to update message status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/messages/${id}/status`, { status });
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch the messages
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
      
      toast({
        title: "Status updated",
        description: "Message status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to reply to a message
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/messages/${messageId}/replies`, { content });
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      setReplyText("");
      
      // Invalidate queries to refetch the messages with new replies
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
      
      // If the current message is selected, refetch it specifically
      if (selectedMessage) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedMessage.id] });
      }
      
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a message
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      setSelectedMessage(null);
      
      // Invalidate queries to refetch the messages
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
      
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user's initials for avatar
  const getUserInitials = (message: MessageWithDetails) => {
    if (message.user) {
      if (message.user.firstName && message.user.lastName) {
        return `${message.user.firstName[0]}${message.user.lastName[0]}`;
      }
      return message.user.username[0].toUpperCase();
    }
    return message.name[0].toUpperCase();
  };

  // Get status badge color
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive" className="ml-2"><AlertCircle className="h-3 w-3 mr-1" />Unread</Badge>;
      case "read":
        return <Badge variant="outline" className="ml-2"><CheckCircle className="h-3 w-3 mr-1" />Read</Badge>;
      case "replied":
        return <Badge variant="secondary" className="ml-2"><MessageCircle className="h-3 w-3 mr-1" />Replied</Badge>;
      case "pending":
        return <Badge variant="secondary" className="ml-2"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return null;
    }
  };

  // Handle message selection
  const handleSelectMessage = (message: MessageWithDetails) => {
    setSelectedMessage(message);
    
    // If message is unread, mark it as read
    if (message.status === "unread") {
      updateStatusMutation.mutate({ id: message.id, status: "read" });
    }
  };

  // Handle sending a reply
  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    replyMutation.mutate({
      messageId: selectedMessage.id,
      content: replyText.trim(),
    });
  };

  // Filter and sort messages based on the active tab
  const displayMessages = activeTab === "unread" ? unreadMessages : allMessages;
  
  // Helper function to safely parse dates
  const safeDate = (date: Date | string | null) => {
    if (!date) return new Date();
    return typeof date === 'string' ? new Date(date) : date;
  };

  // Sort messages by date (newest first)
  const sortedMessages = [...displayMessages].sort((a, b) => {
    return safeDate(b.createdAt).getTime() - safeDate(a.createdAt).getTime();
  });

  const isLoading = isLoadingAllMessages || isLoadingUnreadMessages;
  const error = allMessagesError || unreadMessagesError;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={true} />
      
      <div className="flex-1 p-8 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          </div>
          
          {error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-500">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                  <p>Failed to load messages. Please try again.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Message List */}
              <div className="lg:col-span-1">
                <Card className="h-[calc(100vh-150px)] flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>
                      {unreadMessages.length > 0 && (
                        <Badge variant="secondary">{unreadMessages.length} unread</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <Tabs defaultValue="unread" value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="unread">Unread</TabsTrigger>
                        <TabsTrigger value="all">All Messages</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="unread" className="m-0 flex-1">
                      <ScrollArea className="h-[calc(100vh-265px)]">
                        <div className="px-4 py-2">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                              <p className="text-muted-foreground">Loading messages...</p>
                            </div>
                          ) : unreadMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                              <Mail className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No unread messages</p>
                            </div>
                          ) : (
                            sortedMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 mb-2 rounded-lg transition-colors cursor-pointer ${
                                  selectedMessage?.id === message.id
                                    ? "bg-primary/10"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => handleSelectMessage(message)}
                              >
                                <div className="flex items-start space-x-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {getUserInitials(message)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center">
                                      <span className="font-medium truncate">{message.name}</span>
                                      {getStatusBadge(message.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{message.subject}</p>
                                    <p className="text-xs text-gray-400">
                                      {format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="all" className="m-0 flex-1">
                      <ScrollArea className="h-[calc(100vh-265px)]">
                        <div className="px-4 py-2">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                              <p className="text-muted-foreground">Loading messages...</p>
                            </div>
                          ) : allMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                              <Mail className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No messages found</p>
                            </div>
                          ) : (
                            sortedMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 mb-2 rounded-lg transition-colors cursor-pointer ${
                                  selectedMessage?.id === message.id
                                    ? "bg-primary/10"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => handleSelectMessage(message)}
                              >
                                <div className="flex items-start space-x-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {getUserInitials(message)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center">
                                      <span className="font-medium truncate">{message.name}</span>
                                      {getStatusBadge(message.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{message.subject}</p>
                                    <p className="text-xs text-gray-400">
                                      {format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
              
              {/* Message Details */}
              <div className="lg:col-span-2">
                <Card className="h-[calc(100vh-150px)] flex flex-col">
                  {selectedMessage ? (
                    <>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              {selectedMessage.subject}
                              {getStatusBadge(selectedMessage.status)}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              From {selectedMessage.name} ({selectedMessage.email})
                              {selectedMessage.user && (
                                <span className="inline-flex items-center ml-2 text-xs bg-gray-100 rounded px-2 py-1">
                                  <UserIcon className="h-3 w-3 mr-1" />
                                  Registered user
                                </span>
                              )}
                            </CardDescription>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(selectedMessage.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMutation.mutate(selectedMessage.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                updateStatusMutation.mutate({
                                  id: selectedMessage.id,
                                  status: selectedMessage.status === "unread" ? "read" : "unread"
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              Mark as {selectedMessage.status === "unread" ? "Read" : "Unread"}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 overflow-y-auto pb-0">
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
                          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{selectedMessage.message}</div>
                        </div>
                        
                        {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Replies</h3>
                            <div className="space-y-4">
                              {selectedMessage.replies.map((reply) => (
                                <div key={reply.id} className={`flex ${reply.isAdmin ? "justify-end" : ""}`}>
                                  <div className={`rounded-lg p-4 max-w-[80%] ${
                                    reply.isAdmin
                                      ? "bg-primary/10 text-primary-foreground"
                                      : "bg-gray-100"
                                  }`}>
                                    <div className="text-xs text-gray-500 mb-1">
                                      {reply.isAdmin ? "You" : selectedMessage.name} - {" "}
                                      {format(new Date(reply.createdAt), "MMM d, 'at' h:mm a")}
                                    </div>
                                    <div className="whitespace-pre-wrap">{reply.content}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="pt-4">
                        <div className="w-full space-y-2">
                          <Textarea
                            placeholder="Write your reply here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full min-h-[100px]"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={handleSendReply}
                              disabled={!replyText.trim() || replyMutation.isPending}
                            >
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">Select a message</h3>
                      <p className="text-muted-foreground">
                        Choose a message from the inbox to view its details
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}