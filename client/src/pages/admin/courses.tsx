import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/sidebar";
import CourseList from "@/components/dashboard/course-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course } from "@shared/schema";
import { PlusCircle, Search, Filter } from "lucide-react";

// Course categories
const categories = [
  "All Categories",
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Design",
  "Business",
  "Marketing"
];

export default function AdminCourses() {
  const { user } = useAuth();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSort, setSelectedSort] = useState("newest");
  
  // Fetch all courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses,
    error: coursesError
  } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user?.isAdmin,
  });
  
  // Filter and sort courses
  const filteredCourses = courses?.filter(course => {
    // Filter by search query
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = 
      selectedCategory === "All Categories" || 
      course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort courses
    switch (selectedSort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "popular":
        return b.enrollments - a.enrollments;
      case "price-high":
        return b.price - a.price;
      case "price-low":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar isAdmin />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
                <p className="text-muted-foreground">
                  Create, edit and manage all your courses here
                </p>
              </div>
              
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/admin/courses/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Course
                </Link>
              </Button>
            </div>
            
            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select 
                      value={selectedSort} 
                      onValueChange={setSelectedSort}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Course List */}
            <CourseList 
              courses={filteredCourses || []} 
              isLoading={isLoadingCourses}
              error={coursesError || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
