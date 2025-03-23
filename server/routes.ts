import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAdmin } from "./auth";
import { insertCourseSchema, insertEnrollmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // HTTP server
  const httpServer = createServer(app);

  // =========== Course Routes ===========
  
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get featured courses
  app.get("/api/courses/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const courses = await storage.getFeaturedCourses(limit);
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured courses" });
    }
  });

  // Get courses by category
  app.get("/api/courses/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const courses = await storage.getCoursesByCategory(category);
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses by category" });
    }
  });

  // Get a single course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create a course (admin only)
  app.post("/api/courses", isAdmin, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update a course (admin only)
  app.put("/api/courses/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      // Validate partial course update
      const courseUpdate = insertCourseSchema.partial().parse(req.body);
      
      const updatedCourse = await storage.updateCourse(id, courseUpdate);
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json(updatedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete a course (admin only)
  app.delete("/api/courses/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const deleted = await storage.deleteCourse(id);
      if (!deleted) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // =========== Enrollment Routes ===========

  // Get user enrollments
  app.get("/api/enrollments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const enrollments = await storage.getUserEnrollments(req.user!.id);
      
      // Fetch full course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return {
            ...enrollment,
            course
          };
        })
      );

      res.status(200).json(enrollmentsWithCourses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Enroll in a course
  app.post("/api/enrollments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      // Check if course exists
      const course = await storage.getCourse(enrollmentData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already enrolled
      const userEnrollments = await storage.getUserEnrollments(req.user!.id);
      const alreadyEnrolled = userEnrollments.some(
        e => e.courseId === enrollmentData.courseId
      );

      if (alreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await storage.createEnrollment(enrollmentData);
      
      // Include course details in response
      const enrollmentWithCourse = {
        ...enrollment,
        course
      };

      res.status(201).json(enrollmentWithCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Update enrollment progress
  app.put("/api/enrollments/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }

      const { progress } = req.body;
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }

      // Verify enrollment belongs to user
      const enrollment = await storage.getEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      if (enrollment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedEnrollment = await storage.updateEnrollmentProgress(id, progress);
      
      // Fetch course details
      const course = await storage.getCourse(updatedEnrollment!.courseId);
      
      // Include course details in response
      const enrollmentWithCourse = {
        ...updatedEnrollment,
        course
      };

      res.status(200).json(enrollmentWithCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update enrollment progress" });
    }
  });

  // Mark enrollment as complete
  app.put("/api/enrollments/:id/complete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid enrollment ID" });
      }

      // Verify enrollment belongs to user
      const enrollment = await storage.getEnrollment(id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      if (enrollment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const completedEnrollment = await storage.completeEnrollment(id);
      
      // Fetch course details
      const course = await storage.getCourse(completedEnrollment!.courseId);
      
      // Include course details in response
      const enrollmentWithCourse = {
        ...completedEnrollment,
        course
      };

      res.status(200).json(enrollmentWithCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete enrollment" });
    }
  });

  return httpServer;
}
