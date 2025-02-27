import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Trash2, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { useToast } from '../../hooks/useToast';
import { useLoadingState } from '../../hooks/useLoadingState';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

const roleSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user']),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isLoading, withLoading } = useLoadingState();
  const toast = useToast();
  const confirmDialog = useConfirmDialog();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users:auth.users!user_id (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch users');
      return;
    }

    setUsers(data.map(item => ({
      id: item.user_id,
      email: item.users.email,
      role: item.role,
      created_at: item.created_at,
    })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data: RoleFormData) => {
    await withLoading(async () => {
      // First, get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      // Then assign the role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userData.id,
          role: data.role,
        });

      if (error) throw error;

      toast.success('User role updated successfully');
      setIsDialogOpen(false);
      reset();
      fetchUsers();
    }, {
      errorMessage: 'Failed to update user role',
    });
  };

  const handleDeleteRole = async (userId: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this user role? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });

    if (confirmed) {
      await withLoading(async () => {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;

        toast.success('User role deleted successfully');
        fetchUsers();
      }, {
        errorMessage: 'Failed to delete user role',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">User Role Management</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          leftIcon={<UserPlus className="h-5 w-5" />}
        >
          Add User Role
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteRole(user.id)}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add User Role"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              {...register('role')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}