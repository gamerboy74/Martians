import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trophy } from 'lucide-react';
import { Button } from './Button';

const tournamentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  game: z.string().min(2, 'Game must be at least 2 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  registration_deadline: z.string().min(1, 'Registration deadline is required'),
  prize_pool: z.string().min(1, 'Prize pool is required'),
  max_participants: z.number().min(2, 'Must have at least 2 participants'),
  format: z.enum(['solo', 'duo', 'squad', 'team'], {
    required_error: 'Please select a format',
  }),
  status: z.enum(['upcoming', 'ongoing', 'completed']).default('upcoming'),
  registration_open: z.boolean().default(true),
  image_url: z.string().url('Please enter a valid image URL'),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface TournamentFormProps {
  onSubmit: (data: TournamentFormData) => Promise<void>;
  initialData?: Partial<TournamentFormData>;
  isLoading?: boolean;
}

export function TournamentForm({ onSubmit, initialData, isLoading }: TournamentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      registration_open: true,
      status: 'upcoming',
      ...initialData
    }
  });

  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 bg-white";
  const selectClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 bg-white";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            {...register('title')}
            className={inputClasses}
            placeholder="e.g., BGMI Championship 2024"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className={inputClasses}
            placeholder="Describe your tournament..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Game
          </label>
          <input
            type="text"
            {...register('game')}
            className={inputClasses}
            placeholder="e.g., BGMI, Valorant, etc."
          />
          {errors.game && (
            <p className="mt-1 text-sm text-red-600">{errors.game.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            type="url"
            {...register('image_url')}
            className={inputClasses}
            placeholder="https://example.com/image.jpg"
          />
          {errors.image_url && (
            <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              {...register('start_date')}
              className={inputClasses}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              {...register('end_date')}
              className={inputClasses}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              {...register('registration_deadline')}
              className={inputClasses}
            />
            {errors.registration_deadline && (
              <p className="mt-1 text-sm text-red-600">{errors.registration_deadline.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prize Pool
            </label>
            <input
              type="text"
              {...register('prize_pool')}
              className={inputClasses}
              placeholder="e.g.,10,000"
            />
            {errors.prize_pool && (
              <p className="mt-1 text-sm text-red-600">{errors.prize_pool.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Participants
            </label>
            <input
              type="number"
              {...register('max_participants', { valueAsNumber: true })}
              className={inputClasses}
              placeholder="e.g., 64"
            />
            {errors.max_participants && (
              <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Format
            </label>
            <select
              {...register('format')}
              className={selectClasses}
            >
              <option value="">Select format</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
              <option value="team">Team</option>
            </select>
            {errors.format && (
              <p className="mt-1 text-sm text-red-600">{errors.format.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            {...register('status')}
            className={selectClasses}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('registration_open')}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Registration Open
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Trophy className="h-5 w-5" />}
        >
          {initialData ? 'Update Tournament' : 'Create Tournament'}
        </Button>
      </div>
    </form>
  );
}