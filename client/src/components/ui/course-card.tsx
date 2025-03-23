import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Course } from "@shared/schema";
import { motion } from "framer-motion";

interface CourseCardProps {
  course: Course;
  featured?: boolean;
}

export default function CourseCard({ course, featured = false }: CourseCardProps) {
  // Format price to display in dollars
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  // Calculate average rating (1-5 scale)
  const getAverageRating = () => {
    return course.rating ? course.rating : 4.5; // Default to 4.5 if no ratings
  };

  // Format numbers for display (eg. 1000 -> 1,000)
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full">
        <div className="relative">
          <img 
            src={course.imageUrl} 
            alt={course.title} 
            className="h-48 w-full object-cover"
          />
          <div className="absolute top-4 left-4">
            {featured && (
              <Badge className="bg-primary text-white font-bold">FEATURED</Badge>
            )}
            {!featured && course.featured && (
              <Badge className="bg-primary text-white font-bold">BESTSELLER</Badge>
            )}
            {!featured && !course.featured && course.enrollments > 100 && (
              <Badge className="bg-secondary-500 text-white font-bold">POPULAR</Badge>
            )}
          </div>
          <div className="absolute bottom-4 right-4">
            <Badge variant="outline" className="bg-white text-gray-800 font-medium shadow-sm">
              {course.duration}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(getAverageRating()) 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-300 fill-current"}`}
                />
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-600">
              {getAverageRating().toFixed(1)} ({formatNumber(course.reviews)} reviews)
            </p>
          </div>
          
          <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="font-medium text-gray-700">{course.instructor.charAt(0)}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{course.instructor}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-primary font-bold text-xl">{formatPrice(course.price)}</p>
            <Link href={`/courses/${course.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                View Course
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
