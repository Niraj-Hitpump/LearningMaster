import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  hasUnreadMessages: boolean("has_unread_messages").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  isAdmin: true,
});

// Course model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  duration: text("duration").notNull(),
  level: text("level").notNull(),
  imageUrl: text("image_url").notNull(),
  instructor: text("instructor").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  enrollments: integer("enrollments").default(0),
  rating: integer("rating").default(0),
  reviews: integer("reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  content: json("content").$type<{ sections: CourseSection[] }>(),
});

// Define course section type for content
export type CourseSection = {
  title: string;
  lessons: {
    title: string;
    duration: string;
    content: string;
  }[];
};

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  price: true,
  duration: true,
  level: true,
  imageUrl: true,
  instructor: true,
  category: true,
  tags: true,
  featured: true,
  content: true,
});

// Enrollment model (for user enrollments)
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  userId: true,
  courseId: true,
});

// Contact message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),  // Optional: null for non-registered users
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread"), // unread, read, replied
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  name: true,
  email: true,
  subject: true,
  message: true,
});

// Message replies model
export const messageReplies = pgTable("message_replies", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  adminId: integer("admin_id").notNull(),
  reply: text("reply").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertMessageReplySchema = createInsertSchema(messageReplies).pick({
  messageId: true,
  adminId: true,
  reply: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageReply = typeof messageReplies.$inferSelect;
export type InsertMessageReply = z.infer<typeof insertMessageReplySchema>;
