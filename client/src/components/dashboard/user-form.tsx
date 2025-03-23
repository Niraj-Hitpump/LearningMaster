import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

// Create a modified schema for the form
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: Omit<User, "password">;
  onSuccess?: () => void;
  isUpdate?: boolean;
}

export default function UserForm({ initialData, onSuccess, isUpdate = false }: UserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form definition with react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData
      ? {
          username: initialData.username,
          email: initialData.email,
          password: "", // Don't prefill the password
          firstName: initialData.firstName || "",
          lastName: initialData.lastName || "",
          isAdmin: initialData.isAdmin || false,
        }
      : {
          username: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          isAdmin: false,
        },
  });

  // Create or update user mutation
  const userMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      setIsSubmitting(true);
      try {
        if (isUpdate && initialData) {
          // Only send changed fields for update
          const changedFields: Partial<UserFormValues> = {};
          
          for (const [key, value] of Object.entries(data)) {
            const initialValue = (initialData as any)[key];
            if (key === "password" && value === "") {
              // Skip empty password
              continue;
            }
            if (value !== initialValue) {
              (changedFields as any)[key] = value;
            }
          }
          
          // If no changes, return the initial data
          if (Object.keys(changedFields).length === 0) {
            return initialData;
          }
          
          const res = await apiRequest("PUT", `/api/users/${initialData.id}`, changedFields);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to update user");
          }
          
          return await res.json();
        } else {
          // Create new user
          const res = await apiRequest("POST", "/api/users", data);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to create user");
          }
          
          return await res.json();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: isUpdate ? "User updated" : "User created",
        description: isUpdate
          ? `User ${data.username} has been updated successfully`
          : `User ${data.username} has been created successfully`,
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!isUpdate) {
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: UserFormValues) => {
    userMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                The unique username used to login
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The user's email address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isUpdate ? "New Password" : "Password"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isUpdate ? "Leave blank to keep current password" : "Enter password"} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {isUpdate 
                  ? "Leave blank to keep the current password" 
                  : "The password for this account"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isAdmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Administrator</FormLabel>
                <FormDescription>
                  Administrators have full access to all features
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={initialData?.isAdmin && isUpdate}
                  aria-readonly={initialData?.isAdmin && isUpdate}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting || userMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isUpdate ? "Update User" : "Create User"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}