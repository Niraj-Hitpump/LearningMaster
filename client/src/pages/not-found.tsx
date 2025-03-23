import { motion } from "framer-motion";
import { Link } from "wouter";
import { Frown, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-4 border-2 shadow-lg">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <motion.div
                  initial={{ y: -5 }}
                  animate={{ y: 5 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <Frown className="h-24 w-24 text-primary" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute top-0 right-0 -mt-4 -mr-4 bg-destructive rounded-full text-destructive-foreground font-bold text-xl w-10 h-10 flex items-center justify-center"
                >
                  404
                </motion.div>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold text-foreground mt-4 text-center"
              >
                Page Not Found
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-2 text-muted-foreground text-center"
              >
                The page you're looking for doesn't exist or has been moved.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button asChild className="flex items-center gap-2 w-full">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
              
              <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2 w-full">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
