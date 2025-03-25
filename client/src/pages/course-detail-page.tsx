import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Course, CourseSection } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Film, Award, BookOpen, ArrowLeft, Users, Star, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDetailPage() {
  const [, params] = useRoute<{ id: string }>("/courses/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // Get course ID from URL
  const courseId = params?.id ? parseInt(params.id, 10) : 0;
  
  // Fetch course details
  const { 
    data: course, 
    isLoading: isLoadingCourse,
    error: courseError
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: courseId > 0,
  });
  
  // Fetch user enrollments if user is logged in
  const { 
    data: enrollments,
    isLoading: isLoadingEnrollments 
  } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });
  
  // Check if user is enrolled in this course
  const isEnrolled = enrollments?.some(enrollment => enrollment.courseId === courseId);
  
  // Handle enrollment
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/enrollments", { courseId });
    },
    onSuccess: () => {
      toast({
        title: "Enrollment successful",
        description: "You have successfully enrolled in this course",
      });
      
      // Invalidate enrollments query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    },
  });
  
  // Handle enrollment button click
  const handleEnroll = async () => {
    if (!user) {
      // Redirect to auth page with return URL
      window.location.href = `/auth?returnUrl=/courses/${courseId}`;
      return;
    }
    
    setIsEnrolling(true);
    try {
      await enrollMutation.mutateAsync();
    } finally {
      setIsEnrolling(false);
    }
  };
  
  // Format price to display in dollars
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  // Calculate total course duration
  const calculateTotalDuration = (content?: { sections: CourseSection[] }) => {
    if (!content?.sections) return "0h 0m";
    
    let totalMinutes = 0;
    
    content.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        const [minutes = 0, seconds = 0] = lesson.duration.split(":").map(Number);
        totalMinutes += minutes + (seconds / 60);
      });
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Calculate total lessons count
  const calculateTotalLessons = (content?: { sections: CourseSection[] }) => {
    if (!content?.sections) return 0;
    
    return content.sections.reduce((total, section) => {
      return total + section.lessons.length;
    }, 0);
  };
  
  // Loading state
  if (isLoadingCourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Error state
  if (courseError || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <a href="/courses">Browse Courses</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Course header */}
        <div className="bg-gradient-to-r from-primary-800 to-accent-500 text-black py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" className="text-white mb-4" asChild>
              <a href="/courses">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to courses
              </a>
            </Button>
            
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2">
                <Badge className="mb-4 bg-white text-primary">{course.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="mb-6 text-lg text-indigo-100">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-300 fill-yellow-300" />
                    <span>4.8 (368 ratings)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{course.enrollments} students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    <span>{calculateTotalLessons(course.content)} lessons</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-200 text-primary-800 flex items-center justify-center font-medium mr-3">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">Created by</p>
                    <p>{course.instructor}</p>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="mt-6 md:mt-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-3xl font-bold">{formatPrice(course.price)}</span>
                      {course.featured && (
                        <Badge className="bg-secondary-500">BESTSELLER</Badge>
                      )}
                    </div>
                    
                    {isEnrolled ? (
                      <div className="space-y-4">
                        <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">You're enrolled in this course</span>
                        </div>
                        <Button className="w-full" asChild>
                          <a href="/dashboard">Go to Dashboard</a>
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mb-4 text-base py-6"
                        onClick={handleEnroll}
                        disabled={isEnrolling || isLoadingEnrollments}
                      >
                        {isEnrolling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          "Enroll Now"
                        )}
                      </Button>
                    )}
                    
                    <div className="space-y-4 mt-6">
                      <h3 className="font-semibold">This course includes:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Film className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                          <span>{calculateTotalDuration(course.content)} of on-demand video</span>
                        </li>
                        <li className="flex items-start">
                          <BookOpen className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                          <span>{calculateTotalLessons(course.content)} lessons</span>
                        </li>
                        <li className="flex items-start">
                          <Clock className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                          <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-start">
                          <Award className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                          <span>Certificate of completion</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Course content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Course Content</h3>
                  <div className="text-sm text-gray-600">
                    {course.content?.sections.length} sections • {calculateTotalLessons(course.content)} lessons • {calculateTotalDuration(course.content)} total length
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {course.content?.sections.map((section, index) => (
                    <AccordionItem key={index} value={`section-${index}`}>
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex justify-between w-full pr-4">
                          <span className="font-medium text-left">{section.title}</span>
                          <span className="text-gray-500 text-sm">{section.lessons.length} lessons</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="divide-y">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <li key={lessonIndex} className="py-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <Film className="h-4 w-4 mr-3 text-gray-500" />
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-gray-500 text-sm">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            
            <TabsContent value="overview">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4">About This Course</h3>
                <p className="text-gray-700 mb-6">{course.description}</p>
                
                <h4 className="font-semibold text-lg mb-2">What you'll learn</h4>
                <ul className="grid md:grid-cols-2 gap-2 mb-6">
                  {Array(4).fill(0).map((_, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                      <span>Comprehensive understanding of {course.category} fundamentals</span>
                    </li>
                  ))}
                </ul>
                
                <h4 className="font-semibold text-lg mb-2">Requirements</h4>
                <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-700">
                  <li>No prior experience needed - we'll start from the basics</li>
                  <li>A computer with internet access</li>
                  <li>Passion to learn and practice</li>
                </ul>
                
                <h4 className="font-semibold text-lg mb-2">Who this course is for</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Beginners looking to learn {course.category}</li>
                  <li>Intermediate learners wanting to refresh their skills</li>
                  <li>Anyone interested in advancing their career in {course.category}</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="instructor">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold">
                    {course.instructor.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{course.instructor}</h3>
                    <p className="text-primary-600 mb-4">{course.category} Expert</p>
                    
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-gray-700">4.8 Instructor Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-500 mr-1" />
                        <span className="text-gray-700">4,268 Students</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-500 mr-1" />
                        <span className="text-gray-700">12 Courses</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">
                      I'm a passionate instructor with over 10 years of experience in {course.category}. 
                      I've worked with companies ranging from startups to Fortune 500 companies, and I'm excited to share my knowledge with you.
                    </p>
                    
                    <p className="text-gray-700">
                      My teaching approach focuses on practical, hands-on learning with real-world examples. 
                      I believe in helping students build a strong foundation while keeping up with the latest industry trends.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">4.8</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">Course Rating</p>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-bold mb-4">Student Feedback</h3>
                    
                    {/* Sample reviews */}
                    {[
                      {
                        name: "Alex Johnson",
                        rating: 5,
                        date: "2 months ago",
                        comment: "This course exceeded my expectations! The instructor explains concepts clearly and the projects were very practical. Highly recommend!",
                      },
                      {
                        name: "Sarah Kim",
                        rating: 4,
                        date: "1 month ago",
                        comment: "Great course overall. The content is well-structured and easy to follow. I would have liked more advanced topics, but it's perfect for beginners.",
                      },
                      {
                        name: "Michael Chen",
                        rating: 5,
                        date: "3 weeks ago",
                        comment: "I've taken many courses on this subject, and this is by far the best one. The instructor's teaching style is engaging and the content is up-to-date.",
                      },
                    ].map((review, index) => (
                      <div key={index} className={index !== 0 ? "pt-4 mt-4 border-t" : ""}>
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{review.name}</div>
                          <div className="text-gray-500 text-sm">{review.date}</div>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related courses */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Students Also Bought</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={`https://images.unsplash.com/photo-${1510000000000 + i * 1000000}`} 
                      alt="Course" 
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="outline" className="bg-white text-gray-800 font-medium shadow-sm">
                        {course.duration}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-1">
                      Advanced {course.category} Techniques
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      Take your {course.category} skills to the next level with advanced techniques and patterns.
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-primary font-bold text-xl">{formatPrice(course.price - 1000)}</p>
                      <Button size="sm">View Course</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
