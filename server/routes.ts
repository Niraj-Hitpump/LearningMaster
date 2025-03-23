import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAdmin } from "./auth";
import { insertCourseSchema, insertEnrollmentSchema, insertMessageSchema, insertMessageReplySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // HTTP server
  const httpServer = createServer(app);

  // =========== User Management Routes (Admin Only) ===========
  
  // Get all users (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get a single user (admin only)
  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Create a user (admin only)
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      // Validate user data
      const userData = {
        ...req.body,
        // Make sure password is included
        password: req.body.password || Math.random().toString(36).substring(2, 10) // Generate random password if not provided
      };
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password before storing
      userData.password = await storage.hashPassword(userData.password);
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Update a user (admin only)
  app.put("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent changing admin status of admin user
      if (existingUser.isAdmin && req.body.isAdmin === false) {
        return res.status(403).json({ message: "Cannot remove admin status from admin user" });
      }
      
      // If updating username, check if it's already taken
      if (req.body.username && req.body.username !== existingUser.username) {
        const existingUsername = await storage.getUserByUsername(req.body.username);
        if (existingUsername && existingUsername.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // If updating email, check if it's already taken
      if (req.body.email && req.body.email !== existingUser.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail && existingEmail.id !== id) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // If updating password, hash it
      let userData = { ...req.body };
      if (userData.password) {
        userData.password = await storage.hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser!;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Delete a user (admin only)
  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent deleting admin user
      if (user.isAdmin) {
        return res.status(403).json({ message: "Cannot delete admin user" });
      }
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // =========== Analytics Routes (Admin Only) ===========
  
  app.get("/api/analytics/dashboard", isAdmin, async (req, res) => {
    try {
      const totalUsers = await storage.getTotalUsers();
      const totalCourses = await storage.getTotalCourses();
      const totalEnrollments = await storage.getTotalEnrollments();
      const coursesByCategory = await storage.getCourseCountByCategory();
      
      // Count completed enrollments
      const enrollments = await storage.getAllEnrollments();
      const completedEnrollments = enrollments.filter(e => e.completed).length;
      const completionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;
      
      res.status(200).json({
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        coursesByCategory
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
  
  // =========== Settings Routes (Admin Only) ===========
  
  app.get("/api/settings", isAdmin, async (req, res) => {
    // In a real app, these would be stored in the database
    res.status(200).json({
      siteName: "EduHub LMS",
      siteDescription: "A modern learning management system",
      contactEmail: "admin@eduhub.com",
      enableRegistration: true,
      maintenanceMode: false
    });
  });
  
  app.put("/api/settings", isAdmin, async (req, res) => {
    // In a real app, we would save these settings to storage
    res.status(200).json({
      ...req.body,
      updated: true
    });
  });
  
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

  // =========== Message Routes ===========

  // Get all messages (admin only)
  app.get("/api/messages", isAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get unread messages (admin only)
  app.get("/api/messages/unread", isAdmin, async (req, res) => {
    try {
      const messages = await storage.getUnreadMessages();
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread messages" });
    }
  });

  // Get user messages
  app.get("/api/messages/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messages = await storage.getMessagesByUser(req.user!.id);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user messages" });
    }
  });

  // Get message by ID
  app.get("/api/messages/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Check if user is authorized to view this message
      if (!req.user!.isAdmin && message.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Get replies for this message
      const replies = await storage.getMessageReplies(id);

      // Return message with replies
      res.status(200).json({
        ...message,
        replies
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
      // Prepare message data
      let messageData: any = {
        ...req.body,
        status: "unread"
      };

      // If user is authenticated, add their ID
      if (req.isAuthenticated()) {
        messageData.userId = req.user!.id;
      }

      // Validate message data
      const validMessageData = insertMessageSchema.parse(messageData);
      
      // Create message
      const message = await storage.createMessage(validMessageData);

      // If from authenticated user with an ID, update unread notification status
      if (message.userId) {
        await storage.setUserHasUnreadMessages(message.userId, true);
      }

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Create a reply to a message
  app.post("/api/messages/:id/replies", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      // Check if message exists
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Only admin can reply to user messages
      // Or users can reply to their own messages that admin has replied to
      if (!req.user!.isAdmin && message.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Prepare reply data
      const replyData = insertMessageReplySchema.parse({
        ...req.body,
        messageId,
        userId: req.user!.id,
        isAdmin: req.user!.isAdmin,
        read: false
      });

      // Create reply
      const reply = await storage.createMessageReply(replyData);

      // If admin is replying to a user message, update the message status
      if (req.user!.isAdmin && message.userId !== req.user!.id) {
        await storage.updateMessageStatus(messageId, "replied");
      }

      // Set notification for user
      if (!req.user!.isAdmin && message.userId) {
        await storage.setUserHasUnreadMessages(message.userId, true);
      }

      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Update message status (admin only)
  app.put("/api/messages/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }

      const message = await storage.updateMessageStatus(id, status);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message status" });
    }
  });

  // Mark reply as read
  app.put("/api/messages/replies/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid reply ID" });
      }

      const updatedReply = await storage.markReplyAsRead(id);
      if (!updatedReply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      res.status(200).json(updatedReply);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark reply as read" });
    }
  });

  // Delete a message (admin only)
  app.delete("/api/messages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const deleted = await storage.deleteMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Get users with unread messages (admin only)
  app.get("/api/notifications/unread-messages", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsersWithUnreadMessages();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users with unread messages" });
    }
  });

  return httpServer;
}
