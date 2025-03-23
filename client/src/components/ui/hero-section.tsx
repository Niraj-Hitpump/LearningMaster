import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const { user } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-accent-500">
      <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2">
        <svg viewBox="0 0 1440 320" className="w-full text-white opacity-20">
          <path 
            fill="currentColor" 
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,192C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.h1 
              className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
              variants={itemVariants}
            >
              Unlock Your Potential with <span className="text-yellow-300">Online Learning</span>
            </motion.h1>
            
            <motion.p 
              className="text-indigo-100 text-lg md:text-xl mb-8 max-w-lg"
              variants={itemVariants}
            >
              Join thousands of students in our interactive learning platform with expert-led courses in programming, design, business, and more.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Link href="/courses">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 font-medium rounded-lg shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl"
                >
                  Explore Courses
                </Button>
              </Link>
              
              <Link href={user ? "/dashboard" : "/auth"}>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary font-medium rounded-lg transform transition hover:-translate-y-1"
                >
                  {user ? "My Dashboard" : "Try Free Lessons"}
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-8 flex items-center"
              variants={itemVariants}
            >
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-white bg-primary-300 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">JS</span>
                </div>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-accent-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">MK</span>
                </div>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-secondary-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">TD</span>
                </div>
              </div>
              <p className="ml-4 text-indigo-100">
                <span className="font-semibold text-white">12,000+</span> students already learning
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            className="hidden md:block"
            variants={itemVariants}
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1610484826967-09c5720778c7" 
                alt="Online Learning" 
                className="rounded-lg shadow-2xl"
              />
              
              <motion.div 
                className="absolute -right-8 -bottom-8 bg-white p-4 rounded-lg shadow-xl"
                animate={{ rotate: [3, 0, 3] }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5
                }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Certificate Included</h3>
                    <p className="text-xs text-gray-500">For all completed courses</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
