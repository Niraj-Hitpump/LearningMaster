import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import HomePage from "@/pages/home-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailPage from "@/pages/course-detail-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCourses from "@/pages/admin/courses";
import AddCourse from "@/pages/admin/add-course";
import EditCourse from "@/pages/admin/edit-course";
import AdminMessages from "@/pages/admin/messages";
import AdminUsers from "@/pages/admin/users";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:id" component={CourseDetailPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected user routes */}
      <ProtectedRoute path="/dashboard" component={UserDashboard} />
      
      {/* Protected admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} role="admin" />
      <ProtectedRoute path="/admin/users" component={AdminUsers} role="admin" />
      <ProtectedRoute path="/admin/courses" component={AdminCourses} role="admin" />
      <ProtectedRoute path="/admin/courses/add" component={AddCourse} role="admin" />
      <ProtectedRoute path="/admin/courses/edit/:id" component={EditCourse} role="admin" />
      <ProtectedRoute path="/admin/messages" component={AdminMessages} role="admin" />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
