import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session } = useAuthStore();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password);
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-purple-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Tournament Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage tournaments and users
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                  placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 
                  focus:border-purple-500 sm:text-sm"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 
                  placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 
                  focus:border-purple-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
              text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;