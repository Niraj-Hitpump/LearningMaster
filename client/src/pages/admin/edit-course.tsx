import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import CourseForm from "@/components/dashboard/course-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Course } from "@shared/schema";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function EditCourse() {
  const { user } = useAuth();
  const [, params] = useRoute<{ id: string }>("/admin/courses/edit/:id");
  const [, setLocation] = useLocation();
  
  // Get course ID from URL
  const courseId = params?.id ? parseInt(params.id, 10) : 0;
  
  // Fetch course details
  const { 
    data: course, 
    isLoading, 
    error 
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: courseId > 0 && !!user?.isAdmin,
  });
  
  // Handle form submission success
  const handleSuccess = (course: Course) => {
    // Redirect to the course list
    setLocation("/admin/courses");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar isAdmin />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div>
                <Button variant="ghost" size="sm" asChild className="mb-2">
                  <Link href="/admin/courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to courses
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
                <p className="text-muted-foreground">
                  Update the details of your existing course
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Failed to load course</h2>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the course details. Please try again later.
                  </p>
                  <Button asChild>
                    <Link href="/admin/courses">Go Back to Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>
                    Update the details of "{course?.title}". All fields marked with an asterisk (*) are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CourseForm initialData={course} onSuccess={handleSuccess} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
