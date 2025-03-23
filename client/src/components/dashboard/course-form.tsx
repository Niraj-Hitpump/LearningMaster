import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertCourseSchema, CourseSection, Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Trash, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Extended schema for validation
const courseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().int().min(0, "Price must be a positive number"),
  duration: z.string().min(1, "Duration is required"),
  level: z.string().min(1, "Level is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  instructor: z.string().min(1, "Instructor name is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  featured: z.boolean().default(false),
  content: z.object({
    sections: z.array(
      z.object({
        title: z.string().min(1, "Section title is required"),
        lessons: z.array(
          z.object({
            title: z.string().min(1, "Lesson title is required"),
            duration: z.string().min(1, "Lesson duration is required"),
            content: z.string().min(10, "Lesson content must be at least 10 characters"),
          })
        ).min(1, "At least one lesson is required"),
      })
    ).min(1, "At least one section is required"),
  }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  initialData?: Course;
  onSuccess?: (course: Course) => void;
}

const categories = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
];

const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export default function CourseForm({ initialData, onSuccess }: CourseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  // Default form values
  const defaultValues: Partial<CourseFormValues> = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price ? initialData.price / 100 : 0, // Convert from cents to dollars for form
    duration: initialData?.duration || "",
    level: initialData?.level || "Beginner",
    imageUrl: initialData?.imageUrl || "",
    instructor: initialData?.instructor || "",
    category: initialData?.category || "Web Development",
    tags: initialData?.tags || [],
    featured: initialData?.featured || false,
    content: initialData?.content || {
      sections: [
        {
          title: "Section 1",
          lessons: [
            {
              title: "Introduction",
              duration: "10:00",
              content: "Welcome to the course! In this lesson we'll cover...",
            },
          ],
        },
      ],
    },
  };

  // Create form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
  });

  // Custom content field management
  const sections = form.watch("content.sections");

  const addSection = () => {
    const newSections = [
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        lessons: [
          {
            title: "New Lesson",
            duration: "00:00",
            content: "",
          },
        ],
      },
    ];
    form.setValue("content.sections", newSections);
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    form.setValue("content.sections", newSections);
  };

  const addLesson = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.push({
      title: "New Lesson",
      duration: "00:00",
      content: "",
    });
    form.setValue("content.sections", newSections);
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.splice(lessonIndex, 1);
    form.setValue("content.sections", newSections);
  };

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert price from dollars to cents
      const formattedData = {
        ...data,
        price: Math.round(data.price * 100),
      };
      
      let response;
      if (initialData) {
        // Update course
        response = await apiRequest("PUT", `/api/courses/${initialData.id}`, formattedData);
      } else {
        // Create new course
        response = await apiRequest("POST", "/api/courses", formattedData);
      }
      
      const course = await response.json();
      
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      toast({
        title: initialData ? "Course updated" : "Course created",
        description: initialData ? "Your course has been updated successfully." : "Your course has been created successfully.",
      });
      
      if (onSuccess) {
        onSuccess(course);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${initialData ? "update" : "create"} course. Please try again.`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Full Stack Web Development" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear and concise title for your course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your course" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of what students will learn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Course</FormLabel>
                    <FormDescription>
                      This course will be displayed in the featured section
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 8 weeks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="instructor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor</FormLabel>
                  <FormControl>
                    <Input placeholder="Instructor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL to the course cover image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1 text-primary hover:text-primary/80"
                          onClick={() => removeTag(tag)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add a tag (press Enter)"
                      className="flex-1 mr-2"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  {form.formState.errors.tags && (
                    <FormMessage>{form.formState.errors.tags.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Course Content</h3>
          <Accordion type="multiple" className="mb-4">
            {sections.map((section, sectionIndex) => (
              <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="border rounded-md mb-4">
                <div className="flex items-center justify-between px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex-1 mr-2">
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[sectionIndex].title = e.target.value;
                          form.setValue("content.sections", newSections);
                        }}
                        placeholder="Section Title"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </AccordionTrigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(sectionIndex);
                    }}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <Card key={lessonIndex}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-7">
                              <FormLabel className="text-sm">Lesson Title</FormLabel>
                              <Input
                                value={lesson.title}
                                onChange={(e) => {
                                  const newSections = [...sections];
                                  newSections[sectionIndex].lessons[lessonIndex].title = e.target.value;
                                  form.setValue("content.sections", newSections);
                                }}
                                placeholder="Lesson Title"
                              />
                            </div>
                            <div className="col-span-3">
                              <FormLabel className="text-sm">Duration</FormLabel>
                              <Input
                                value={lesson.duration}
                                onChange={(e) => {
                                  const newSections = [...sections];
                                  newSections[sectionIndex].lessons[lessonIndex].duration = e.target.value;
                                  form.setValue("content.sections", newSections);
                                }}
                                placeholder="00:00"
                              />
                            </div>
                            <div className="col-span-2 flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLesson(sectionIndex, lessonIndex)}
                                className="text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="col-span-12">
                              <FormLabel className="text-sm">Content</FormLabel>
                              <Textarea
                                value={lesson.content}
                                onChange={(e) => {
                                  const newSections = [...sections];
                                  newSections[sectionIndex].lessons[lessonIndex].content = e.target.value;
                                  form.setValue("content.sections", newSections);
                                }}
                                placeholder="Lesson content"
                                rows={3}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addLesson(sectionIndex)}
                      className="w-full"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button
            type="button"
            variant="outline"
            onClick={addSection}
            className="mb-8 w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-8" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Saving..." 
              : initialData 
                ? "Update Course" 
                : "Create Course"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
