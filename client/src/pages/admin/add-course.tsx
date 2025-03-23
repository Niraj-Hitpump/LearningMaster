import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import CourseForm from "@/components/dashboard/course-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Course } from "@shared/schema";

export default function AddCourse() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
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
                <h1 className="text-2xl font-bold tracking-tight">Add New Course</h1>
                <p className="text-muted-foreground">
                  Create a new course to add to your learning platform
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  Fill in the details about your new course. All fields marked with an asterisk (*) are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseForm onSuccess={handleSuccess} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
