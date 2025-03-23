import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  content: string;
  author: {
    name: string;
    role: string;
    imageInitial: string;
  };
  index: number;
}

export default function TestimonialCard({ content, author, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="bg-white rounded-xl text-gray-800 shadow-xl h-full">
        <CardContent className="p-8">
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          
          <p className="text-gray-700 mb-6 font-medium">{content}</p>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium mr-3">
              {author.imageInitial}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{author.name}</h4>
              <p className="text-sm text-gray-500">{author.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
