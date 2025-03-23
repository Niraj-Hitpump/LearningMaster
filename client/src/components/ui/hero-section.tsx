import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Star, BookOpen, Users, Award } from "lucide-react";

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
      {/* Background elements for visual interest */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2">
        <svg viewBox="0 0 1440 320" className="w-full text-white opacity-20">
          <path 
            fill="currentColor" 
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,192C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.div
              className="inline-block px-3 py-1 mb-6 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium"
              variants={itemVariants}
            >
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-300" fill="currentColor" /> 
                Highest rated learning platform
              </span>
            </motion.div>
            
            <motion.h1 
              className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight drop-shadow-md mb-6"
              variants={itemVariants}
            >
              Unlock Your Potential with <span className="text-yellow-300 relative inline-block">
                Online Learning
                <motion.span 
                  className="absolute bottom-1 left-0 h-1 bg-yellow-300 w-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1 }}
                ></motion.span>
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-white text-lg md:text-xl mb-8 max-w-lg drop-shadow font-medium bg-black/10 backdrop-blur-sm p-3 rounded-lg"
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
                  className="bg-white text-primary hover:bg-gray-100 font-medium rounded-lg shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto group"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href={user ? "/dashboard" : "/auth"}>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary font-medium rounded-lg transform transition hover:-translate-y-1 w-full sm:w-auto"
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
                <div className="h-8 w-8 rounded-full border-2 border-white bg-primary-300 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">JS</span>
                </div>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-accent-400 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">MK</span>
                </div>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-secondary-500 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">TD</span>
                </div>
              </div>
              <p className="ml-4 text-white font-medium drop-shadow">
                <span className="font-bold text-white">12,000+</span> students already learning
              </p>
            </motion.div>
            
            {/* Stats section */}
            <motion.div
              className="grid grid-cols-3 gap-4 mt-8 bg-white/10 backdrop-blur-sm p-4 rounded-lg"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <BookOpen className="h-5 w-5 text-yellow-300" />
                </div>
                <p className="text-white font-bold text-xl">200+</p>
                <p className="text-white/80 text-xs">Courses</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Users className="h-5 w-5 text-yellow-300" />
                </div>
                <p className="text-white font-bold text-xl">50+</p>
                <p className="text-white/80 text-xs">Expert Instructors</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Award className="h-5 w-5 text-yellow-300" />
                </div>
                <p className="text-white font-bold text-xl">100%</p>
                <p className="text-white/80 text-xs">Satisfaction</p>
              </div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent rounded-lg z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1610484826967-09c5720778c7" 
                alt="Online Learning" 
                className="rounded-lg shadow-2xl z-0 relative"
              />
              
              <motion.div 
                className="absolute -right-5 -bottom-5 bg-white p-4 rounded-lg shadow-xl z-20"
                animate={{ rotate: [2, -2, 2] }}
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
              
              {/* Second floating element */}
              <motion.div 
                className="absolute -left-5 top-16 bg-white p-3 rounded-lg shadow-xl z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
