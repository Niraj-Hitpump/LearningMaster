import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { AlertCircle, Check, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import UserForm from "@/components/dashboard/user-form";
import Sidebar from "@/components/dashboard/sidebar";

// Remove password from user type for display
type UserWithoutPassword = Omit<User, "password">;

export default function AdminUsers() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch all users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserWithoutPassword[]>({
    queryKey: ['/api/users'],
    staleTime: 10000, // 10 seconds
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('DELETE', `/api/users/${userId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (user: UserWithoutPassword) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleEdit = (user: UserWithoutPassword) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
  };

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar isAdmin={true} />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Users</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users'] })}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row">
        <Sidebar isAdmin />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage your users and their access</p>
              </div>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add User
              </Button>
            </div>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !users || users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>
                              ) : (
                                <Badge variant="secondary">User</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleEdit(user)}
                                  size="icon"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(user)}
                                  size="icon"
                                  variant="destructive"
                                  disabled={user.isAdmin}
                                  title={user.isAdmin ? "Cannot delete admin user" : "Delete user"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update the user details below
                  </DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <UserForm
                    initialData={selectedUser}
                    onSuccess={handleSuccess}
                    isUpdate
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                  <DialogDescription>
                    Fill in the user details below
                  </DialogDescription>
                </DialogHeader>
                <UserForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user 
                    <span className="font-semibold"> {selectedUser?.username}</span> and
                    all their enrollments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteUserMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}