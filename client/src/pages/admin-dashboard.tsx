import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import StatsCard from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, BookOpen, DollarSign, GraduationCap, 
  Users, BarChart3, TrendingUp, Clock, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Course, Enrollment, User } from "@shared/schema";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch all courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses 
  } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user?.isAdmin,
  });
  
  // Format price to display in dollars
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  // Calculate stats
  const totalCourses = courses?.length || 0;
  const totalEnrollments = courses?.reduce((total, course) => total + course.enrollments, 0) || 0;
  const featuredCourses = courses?.filter(course => course.featured).length || 0;
  const totalRevenue = courses?.reduce((total, course) => total + (course.price * course.enrollments), 0) || 0;
  
  // Get most popular courses
  const popularCourses = courses
    ? [...courses].sort((a, b) => b.enrollments - a.enrollments).slice(0, 5)
    : [];
  
  // Get recently added courses
  const recentCourses = courses
    ? [...courses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    : [];
  
  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar isAdmin />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName || user?.username}. Here's an overview of your platform.
              </p>
            </div>
            
            {/* Stats Overview */}
            <motion.div 
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Total Courses"
                  value={totalCourses.toString()}
                  icon={<BookOpen className="h-6 w-6" />}
                  trend={{ value: 12, isPositive: true }}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Total Enrollments"
                  value={totalEnrollments.toString()}
                  icon={<UserPlus className="h-6 w-6" />}
                  trend={{ value: 8, isPositive: true }}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Featured Courses"
                  value={featuredCourses.toString()}
                  icon={<GraduationCap className="h-6 w-6" />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Total Revenue"
                  value={formatPrice(totalRevenue)}
                  icon={<DollarSign className="h-6 w-6" />}
                  trend={{ value: 14, isPositive: true }}
                />
              </motion.div>
            </motion.div>
            
            {/* Main Content */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              {/* Popular Courses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle>Popular Courses</CardTitle>
                    <CardDescription>Your top-performing courses by enrollment</CardDescription>
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : popularCourses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No courses available</p>
                      <Button asChild className="mt-4">
                        <Link href="/admin/courses/add">Add New Course</Link>
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead className="text-right">Enrollments</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {popularCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell className="text-right">{course.enrollments}</TableCell>
                            <TableCell className="text-right">{formatPrice(course.price)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  <div className="mt-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/courses">
                        View all courses
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Courses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle>Recent Courses</CardTitle>
                    <CardDescription>The latest courses added to the platform</CardDescription>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : recentCourses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No courses available</p>
                      <Button asChild className="mt-4">
                        <Link href="/admin/courses/add">Add New Course</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentCourses.map((course) => (
                        <div key={course.id} className="flex items-center">
                          <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Added on {formatDate(course.createdAt)}
                            </p>
                          </div>
                          <Badge variant={course.featured ? "default" : "secondary"}>
                            {course.featured ? "Featured" : "Standard"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/courses">
                        View all courses
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Platform Statistics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>
                    Key performance metrics for your learning platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold">{totalEnrollments}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>New this month</span>
                        <span className="text-green-600 font-medium">+24 (8%)</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Course Price</p>
                          <p className="text-2xl font-bold">
                            {formatPrice(totalCourses ? totalRevenue / totalCourses : 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Change from last month</span>
                        <span className="text-green-600 font-medium">+5%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          <p className="text-2xl font-bold">12.5%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Change from last month</span>
                        <span className="text-green-600 font-medium">+2.3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <Button className="w-full" asChild>
                      <Link href="/admin/courses/add">
                        Add New Course
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/courses">
                        Manage Courses
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
