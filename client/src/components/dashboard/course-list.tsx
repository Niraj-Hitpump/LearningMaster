import { Course } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, MoreVertical, Pencil, Trash, Users, Clock, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  error: Error | null;
}

export default function CourseList({ courses, isLoading, error }: CourseListProps) {
  const { toast } = useToast();
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteClick = (courseId: number) => {
    setDeletingCourseId(courseId);
  };
  
  const handleCancelDelete = () => {
    setDeletingCourseId(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingCourseId) return;
    
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/courses/${deletingCourseId}`);
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingCourseId(null);
    }
  };

  // Format price from cents to dollars
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Loading courses...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Error loading courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            Failed to load courses: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Courses</CardTitle>
            <CardDescription>You haven't created any courses yet</CardDescription>
          </div>
          <Link href="/admin/courses/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="h-40 flex flex-col items-center justify-center text-center p-8">
          <BarChart className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No courses found</p>
          <p className="text-sm text-muted-foreground">Get started by creating your first course</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Manage your courses</CardDescription>
          </div>
          <Link href="/admin/courses/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Enrollments</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{formatPrice(course.price)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {course.enrollments}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={course.featured ? "default" : "secondary"}>
                      {course.featured ? "Featured" : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/courses/${course.id}`}>
                          <DropdownMenuItem>
                            <BarChart className="mr-2 h-4 w-4" />
                            View Course
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/admin/courses/edit/${course.id}`}>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(course.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{courses.length}</strong> courses
          </p>
        </CardFooter>
      </Card>
      
      <AlertDialog open={deletingCourseId !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this course
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
