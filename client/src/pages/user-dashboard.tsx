import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Enrollment, Course } from "@shared/schema";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  BookOpen, Clock, Award, BarChart, CheckCircle, Loader2,
  PlayCircle, LayoutDashboard, GraduationCap, Calendar
} from "lucide-react";
import { Link } from "wouter";

type EnrollmentWithCourse = Enrollment & { course?: Course };

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch user enrollments
  const { 
    data: enrollments, 
    isLoading: isLoadingEnrollments,
    error: enrollmentsError
  } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });
  
  // Calculate user stats
  const completedCourses = enrollments?.filter(e => e.completed).length || 0;
  const inProgressCourses = enrollments?.filter(e => !e.completed).length || 0;
  const totalEnrollments = enrollments?.length || 0;
  const averageProgress = enrollments && enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;
  
  // Handle progress update
  const updateProgress = async (enrollmentId: number, newProgress: number) => {
    try {
      await apiRequest("PUT", `/api/enrollments/${enrollmentId}/progress`, { progress: newProgress });
      
      // Invalidate enrollments query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      
      toast({
        title: "Progress updated",
        description: `Course progress updated to ${newProgress}%`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update course progress",
        variant: "destructive",
      });
    }
  };
  
  // Handle course completion
  const markAsComplete = async (enrollmentId: number) => {
    try {
      await apiRequest("PUT", `/api/enrollments/${enrollmentId}/complete`);
      
      // Invalidate enrollments query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      
      toast({
        title: "Course completed!",
        description: "Congratulations on completing this course!",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to mark course as complete",
        variant: "destructive",
      });
    }
  };
  
  // Get recent enrollments
  const recentEnrollments = enrollments?.sort((a, b) => {
    return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
  }).slice(0, 3);
  
  // Get in-progress courses
  const inProgressEnrollments = enrollments?.filter(e => !e.completed).sort((a, b) => b.progress - a.progress);
  
  // Get completed courses
  const completedEnrollments = enrollments?.filter(e => e.completed);
  
  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName || user?.username}!</h1>
              <p className="text-muted-foreground">
                Here's an overview of your learning progress and courses.
              </p>
            </div>
            
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Courses
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalEnrollments}</div>
                      <p className="text-xs text-muted-foreground">
                        Courses you've enrolled in
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        In Progress
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inProgressCourses}</div>
                      <p className="text-xs text-muted-foreground">
                        Courses currently in progress
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Completed
                      </CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{completedCourses}</div>
                      <p className="text-xs text-muted-foreground">
                        Courses successfully completed
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Progress
                      </CardTitle>
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{averageProgress}%</div>
                      <p className="text-xs text-muted-foreground">
                        Average completion across all courses
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Activity */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-8">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recent Enrollments</CardTitle>
                      <CardDescription>
                        Your most recently enrolled courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingEnrollments ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : enrollmentsError ? (
                        <div className="text-center py-8 text-destructive">
                          Failed to load enrollments
                        </div>
                      ) : recentEnrollments?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>You haven't enrolled in any courses yet</p>
                          <Button asChild className="mt-4">
                            <Link href="/courses">Browse Courses</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {recentEnrollments?.map((enrollment) => (
                            <div key={enrollment.id} className="flex gap-4">
                              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpen className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {enrollment.course?.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Enrolled on {formatDate(enrollment.enrolledAt)}
                                </p>
                                <div className="flex items-center pt-1">
                                  <div className="w-full max-w-[180px]">
                                    <Progress value={enrollment.progress} className="h-2" />
                                  </div>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {enrollment.progress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Learning Stats</CardTitle>
                      <CardDescription>
                        Your learning activity summary
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Learning Progress</p>
                            <p className="text-sm text-muted-foreground">{averageProgress}% average</p>
                          </div>
                          <Progress value={averageProgress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-primary/10 rounded-lg p-4 text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">Learning Streak</p>
                            <p className="text-2xl font-bold mt-1">3 days</p>
                          </div>
                          
                          <div className="bg-primary/10 rounded-lg p-4 text-center">
                            <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">Achievements</p>
                            <p className="text-2xl font-bold mt-1">{completedCourses}</p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/courses">Find New Courses</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* In Progress Tab */}
              <TabsContent value="in-progress">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {isLoadingEnrollments ? (
                    <div className="col-span-full flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : enrollmentsError ? (
                    <div className="col-span-full text-center py-12 text-destructive">
                      Failed to load enrollments
                    </div>
                  ) : inProgressEnrollments?.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
                      <p className="text-muted-foreground mb-6">
                        You don't have any courses in progress yet.
                      </p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  ) : (
                    inProgressEnrollments?.map((enrollment) => (
                      <motion.div 
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="h-full flex flex-col overflow-hidden">
                          <div className="relative">
                            <img 
                              src={enrollment.course?.imageUrl} 
                              alt={enrollment.course?.title} 
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="sm">
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Continue Learning
                              </Button>
                            </div>
                          </div>
                          <CardContent className="flex-grow flex flex-col p-5">
                            <h3 className="font-bold text-lg mb-2 line-clamp-1">
                              {enrollment.course?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {enrollment.course?.description}
                            </p>
                            
                            <div className="mt-auto space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span className="font-medium">{enrollment.progress}%</span>
                                </div>
                                <Progress value={enrollment.progress} className="h-2" />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1"
                                  variant={enrollment.progress === 100 ? "default" : "outline"}
                                  onClick={() => markAsComplete(enrollment.id)}
                                  disabled={enrollment.progress < 100}
                                >
                                  {enrollment.progress === 100 ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Complete
                                    </>
                                  ) : (
                                    "Mark Complete"
                                  )}
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  asChild
                                >
                                  <Link href={`/courses/${enrollment.courseId}`}>
                                    <LayoutDashboard className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              {/* Completed Tab */}
              <TabsContent value="completed">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {isLoadingEnrollments ? (
                    <div className="col-span-full flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : enrollmentsError ? (
                    <div className="col-span-full text-center py-12 text-destructive">
                      Failed to load enrollments
                    </div>
                  ) : completedEnrollments?.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No completed courses yet</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't completed any courses yet. Keep learning!
                      </p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  ) : (
                    completedEnrollments?.map((enrollment) => (
                      <motion.div 
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="h-full flex flex-col overflow-hidden">
                          <div className="relative">
                            <img 
                              src={enrollment.course?.imageUrl} 
                              alt={enrollment.course?.title} 
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute top-0 right-0 m-2">
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            </div>
                          </div>
                          <CardContent className="flex-grow flex flex-col p-5">
                            <h3 className="font-bold text-lg mb-2 line-clamp-1">
                              {enrollment.course?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {enrollment.course?.description}
                            </p>
                            
                            <div className="mt-auto space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Completed on {formatDate(enrollment.enrolledAt)}
                              </p>
                              
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1"
                                  variant="default"
                                >
                                  <Award className="mr-2 h-4 w-4" />
                                  View Certificate
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  asChild
                                >
                                  <Link href={`/courses/${enrollment.courseId}`}>
                                    <LayoutDashboard className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
