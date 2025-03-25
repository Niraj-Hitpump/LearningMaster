import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/ui/features-section";
import NewsletterForm from "@/components/ui/newsletter-form";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import CourseCard from "@/components/ui/course-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { motion } from "framer-motion";

export default function HomePage() {
  // Fetch featured courses
  const { data: featuredCourses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/featured"],
  });

  // Testimonial data
  const testimonials = [
    {
      content: "The web development course was exactly what I needed to transition into tech. The instructor was knowledgeable and the projects were challenging but doable. I landed a job within 2 months of completing the course!",
      author: {
        name: "Alex Johnson",
        role: "Full Stack Developer",
        imageInitial: "AJ"
      },
    },
    {
      content: "The UI/UX Design Masterclass transformed my portfolio. The instructor broke down complex design concepts into easy-to-understand lessons. I'm now freelancing with clients I could only dream of before!",
      author: {
        name: "Sarah Kim",
        role: "UI/UX Designer",
        imageInitial: "SK"
      },
    },
    {
      content: "As someone with no prior coding experience, I was nervous about taking the Python course. But the step-by-step approach made learning enjoyable. I'm now automating tasks at my current job and getting noticed by management!",
      author: {
        name: "David Rogers",
        role: "Business Analyst",
        imageInitial: "DR"
      },
    },
  ];

  // Instructor data
  const instructors = [
    {
      name: "John Smith",
      role: "Web Development",
      bio: "10+ years of experience with modern web technologies.",
      initial: "JS"
    },
    {
      name: "Olivia Johnson",
      role: "Data Science",
      bio: "PhD in Computer Science with expertise in machine learning.",
      initial: "OJ"
    },
    {
      name: "Michael Davis",
      role: "UI/UX Design",
      bio: "Former Lead Designer at major tech companies.",
      initial: "MD"
    },
    {
      name: "Emily Chen",
      role: "Business & Marketing",
      bio: "MBA with 8+ years experience in digital marketing.",
      initial: "EC"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-black">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Popular Courses Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold font-sans text-gray-900">Popular Courses</h2>
                <p className="mt-2 text-lg text-gray-800 font-semibold">Explore our top-rated courses and start learning today</p>
              </div>
              <a href="/courses" className="hidden md:flex items-center text-primary hover:text-primary-700 font-semibold">
                View all courses
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses?.map((course) => (
                  <CourseCard key={course.id} course={course} featured />
                ))}
              </div>
            )}
            
            <div className="mt-10 text-center md:hidden">
              <a href="/courses" className="inline-flex items-center text-primary hover:text-primary-700 font-semibold">
                View all courses
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        {/* Instructors Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-sans text-gray-900 sm:text-4xl">Meet Our Expert Instructors</h2>
              <p className="mt-4 text-lg text-gray-800 font-semibold max-w-2xl mx-auto">Learn from industry professionals with years of experience in their fields.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {instructors.map((instructor, index) => (
                <motion.div 
                  key={index} 
                  className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.1)" }}
                >
                  <motion.div 
                    className="w-32 h-32 rounded-full mx-auto mb-4 bg-primary-100 text-primary-600 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md"
                    whileHover={{ scale: 1.05, borderColor: "rgba(99, 102, 241, 0.4)" }}
                  >
                    {instructor.initial}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900">{instructor.name}</h3>
                  <p className="text-primary mb-2">{instructor.role}</p>
                  <p className="text-gray-700 text-sm mb-3 font-medium">{instructor.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="text-gray-500 hover:text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-primary">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-gradient-to-r from-primary-700 to-accent-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-sans text-white sm:text-4xl">What Our Students Say</h2>
              <p className="mt-4 text-lg text-black max-w-2xl mx-auto">Don't just take our word for it. Here's what students have to say about their learning experience.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  content={testimonial.content}
                  author={testimonial.author}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <NewsletterForm />
      </main>
      
      <Footer />
    </div>
  );
}
