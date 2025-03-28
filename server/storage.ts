import { users, type User, type InsertUser, 
         courses, type Course, type InsertCourse, type CourseSection,
         enrollments, type Enrollment, type InsertEnrollment,
         messages, type Message, type InsertMessage,
         messageReplies, type MessageReply, type InsertMessageReply } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Storage interface for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getFeaturedCourses(limit?: number): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Enrollment operations
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: number): Promise<Enrollment[]>;
  getAllEnrollments(): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment | undefined>;
  completeEnrollment(id: number): Promise<Enrollment | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
  getUnreadMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Message reply operations
  getMessageReplies(messageId: number): Promise<MessageReply[]>;
  createMessageReply(reply: InsertMessageReply): Promise<MessageReply>;
  markReplyAsRead(id: number): Promise<MessageReply | undefined>;
  
  // Notification operations
  setUserHasUnreadMessages(userId: number, hasUnread: boolean): Promise<User | undefined>;
  getUsersWithUnreadMessages(): Promise<User[]>;
  
  // Analytics operations
  getTotalUsers(): Promise<number>;
  getTotalCourses(): Promise<number>;
  getTotalEnrollments(): Promise<number>;
  getCourseCountByCategory(): Promise<{category: string, count: number}[]>;
  
  // Utility methods
  hashPassword(password: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private courseStore: Map<number, Course>;
  private enrollmentStore: Map<number, Enrollment>;
  private messageStore: Map<number, Message>;
  private messageReplyStore: Map<number, MessageReply>;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private enrollmentIdCounter: number;
  private messageIdCounter: number;
  private messageReplyIdCounter: number;

  constructor() {
    this.userStore = new Map();
    this.courseStore = new Map();
    this.enrollmentStore = new Map();
    this.messageStore = new Map();
    this.messageReplyStore = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.messageIdCounter = 1;
    this.messageReplyIdCounter = 1;
    
    // Create admin user with hashed password
    this.hashPassword("admin123").then(hashedPassword => {
      this.createUser({
        username: "admin",
        password: hashedPassword, // Now using hashed password
        email: "admin@eduhub.com",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true
      });
    });
    
    // Add some demo courses
    this.seedCourses();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.userStore.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    
    // Set default values for optional fields
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isAdmin: insertUser.isAdmin || false,
      hasUnreadMessages: false
    };
    
    this.userStore.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.userStore.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { 
      ...existingUser, 
      ...userUpdate
    };
    
    this.userStore.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // Check for enrollments first and delete them
    const userEnrollments = await this.getUserEnrollments(id);
    for (const enrollment of userEnrollments) {
      this.enrollmentStore.delete(enrollment.id);
    }
    
    return this.userStore.delete(id);
  }

  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courseStore.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courseStore.values());
  }
  
  async getFeaturedCourses(limit = 6): Promise<Course[]> {
    return Array.from(this.courseStore.values())
      .filter(course => course.featured)
      .slice(0, limit);
  }
  
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return Array.from(this.courseStore.values())
      .filter(course => course.category === category);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const course: Course = { 
      ...insertCourse, 
      id, 
      createdAt, 
      updatedAt, 
      enrollments: 0,
      rating: 0,
      reviews: 0
    };
    this.courseStore.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseUpdate: Partial<InsertCourse>): Promise<Course | undefined> {
    const existingCourse = this.courseStore.get(id);
    if (!existingCourse) return undefined;
    
    const updatedCourse: Course = { 
      ...existingCourse, 
      ...courseUpdate, 
      updatedAt: new Date() 
    };
    this.courseStore.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courseStore.delete(id);
  }

  // Enrollment methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollmentStore.get(id);
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollmentStore.values())
      .filter(enrollment => enrollment.userId === userId);
  }

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollmentStore.values())
      .filter(enrollment => enrollment.courseId === courseId);
  }
  
  async getAllEnrollments(): Promise<Enrollment[]> {
    return Array.from(this.enrollmentStore.values());
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const enrolledAt = new Date();
    const enrollment: Enrollment = {
      ...insertEnrollment,
      id,
      enrolledAt,
      completed: false,
      progress: 0
    };
    this.enrollmentStore.set(id, enrollment);
    
    // Update course enrollment count
    const course = this.courseStore.get(enrollment.courseId);
    if (course) {
      course.enrollments += 1;
      this.courseStore.set(course.id, course);
    }
    
    return enrollment;
  }

  async updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment | undefined> {
    const enrollment = this.enrollmentStore.get(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment: Enrollment = {
      ...enrollment,
      progress,
      completed: progress === 100
    };
    this.enrollmentStore.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  async completeEnrollment(id: number): Promise<Enrollment | undefined> {
    const enrollment = this.enrollmentStore.get(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment: Enrollment = {
      ...enrollment,
      completed: true,
      progress: 100
    };
    this.enrollmentStore.set(id, updatedEnrollment);
    return updatedEnrollment;
  }
  
  // Analytics methods
  async getTotalUsers(): Promise<number> {
    return this.userStore.size;
  }
  
  async getTotalCourses(): Promise<number> {
    return this.courseStore.size;
  }
  
  async getTotalEnrollments(): Promise<number> {
    return this.enrollmentStore.size;
  }
  
  async getCourseCountByCategory(): Promise<{category: string, count: number}[]> {
    const categories = new Map<string, number>();
    
    // Count courses by category
    for (const course of this.courseStore.values()) {
      const category = course.category;
      categories.set(category, (categories.get(category) || 0) + 1);
    }
    
    // Convert to array of objects
    return Array.from(categories.entries()).map(([category, count]) => ({
      category,
      count
    }));
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messageStore.get(id);
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messageStore.values())
      .filter(message => message.userId === userId);
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messageStore.values());
  }

  async getUnreadMessages(): Promise<Message[]> {
    return Array.from(this.messageStore.values())
      .filter(message => message.status === "unread");
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    
    const message: Message = {
      ...insertMessage,
      id,
      createdAt,
      status: "unread"
    };
    
    this.messageStore.set(id, message);
    
    // If the message is from a registered user, update their notification status
    if (message.userId) {
      const user = this.userStore.get(message.userId);
      if (user) {
        user.hasUnreadMessages = true;
        this.userStore.set(user.id, user);
      }
    }
    
    return message;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const message = this.messageStore.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = {
      ...message,
      status
    };
    
    this.messageStore.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: number): Promise<boolean> {
    // Delete associated replies
    const replies = await this.getMessageReplies(id);
    for (const reply of replies) {
      this.messageReplyStore.delete(reply.id);
    }
    
    return this.messageStore.delete(id);
  }

  // Message reply methods
  async getMessageReplies(messageId: number): Promise<MessageReply[]> {
    return Array.from(this.messageReplyStore.values())
      .filter(reply => reply.messageId === messageId);
  }

  async createMessageReply(insertReply: InsertMessageReply): Promise<MessageReply> {
    const id = this.messageReplyIdCounter++;
    const createdAt = new Date();
    
    const reply: MessageReply = {
      ...insertReply,
      id,
      createdAt,
      read: false
    };
    
    this.messageReplyStore.set(id, reply);
    
    // Update the message status to "replied"
    const message = this.messageStore.get(reply.messageId);
    if (message) {
      message.status = "replied";
      this.messageStore.set(message.id, message);
      
      // If the message is from a registered user, update their notification status
      if (message.userId) {
        const user = this.userStore.get(message.userId);
        if (user) {
          user.hasUnreadMessages = true;
          this.userStore.set(user.id, user);
        }
      }
    }
    
    return reply;
  }

  async markReplyAsRead(id: number): Promise<MessageReply | undefined> {
    const reply = this.messageReplyStore.get(id);
    if (!reply) return undefined;
    
    const updatedReply: MessageReply = {
      ...reply,
      read: true
    };
    
    this.messageReplyStore.set(id, updatedReply);
    return updatedReply;
  }

  // Notification methods
  async setUserHasUnreadMessages(userId: number, hasUnread: boolean): Promise<User | undefined> {
    const user = this.userStore.get(userId);
    if (!user) return undefined;
    
    user.hasUnreadMessages = hasUnread;
    this.userStore.set(userId, user);
    return user;
  }

  async getUsersWithUnreadMessages(): Promise<User[]> {
    return Array.from(this.userStore.values())
      .filter(user => user.hasUnreadMessages);
  }

  // Password hashing utility
  async hashPassword(password: string): Promise<string> {
    const scryptAsync = promisify(scrypt);
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }
  
  // Seed method to add demo courses
  private seedCourses() {
    const demoContent = {
      sections: [
        {
          title: "Introduction",
          lessons: [
            {
              title: "Course Overview",
              duration: "10:15",
              content: "Welcome to the course! In this lesson, we'll cover what to expect."
            },
            {
              title: "Setting Up Your Environment",
              duration: "15:30",
              content: "Let's set up all the tools you'll need for this course."
            }
          ]
        },
        {
          title: "Getting Started",
          lessons: [
            {
              title: "Basic Concepts",
              duration: "20:45",
              content: "We'll cover the fundamental concepts you need to understand."
            },
            {
              title: "Your First Project",
              duration: "25:10",
              content: "Let's build our first project together, step by step."
            }
          ]
        }
      ]
    };

    this.createCourse({
      title: "Full Stack Web Development: React, Node & MongoDB",
      description: "Master front-end and back-end technologies to build complete web applications from scratch.",
      price: 8999, // $89.99
      duration: "12 weeks",
      level: "Intermediate",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      instructor: "John Smith",
      category: "Web Development",
      tags: ["JavaScript", "React", "Node.js", "MongoDB"],
      featured: true,
      content: demoContent
    });

    this.createCourse({
      title: "Data Science & Machine Learning with Python",
      description: "Learn to analyze data, create models, and implement machine learning algorithms.",
      price: 7499, // $74.99
      duration: "8 weeks",
      level: "Intermediate",
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692",
      instructor: "Olivia Johnson",
      category: "Data Science",
      tags: ["Python", "Machine Learning", "Data Analysis"],
      featured: true,
      content: demoContent
    });

    this.createCourse({
      title: "UI/UX Design Masterclass: Create Modern Interfaces",
      description: "Learn design principles and tools to create beautiful, user-friendly interfaces.",
      price: 6999, // $69.99
      duration: "10 weeks",
      level: "Beginner",
      imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
      instructor: "Michael Davis",
      category: "Design",
      tags: ["UI", "UX", "Figma", "Design Principles"],
      featured: true,
      content: demoContent
    });
  }
}

export const storage = new MemStorage();
