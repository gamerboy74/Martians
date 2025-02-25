import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Swords } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../lib/supabase';

const matchSchema = z.object({
  tournament_id: z.string().min(1, 'Tournament is required'),
  round: z.number().min(1, 'Round must be at least 1'),
  team1_id: z.string().min(1, 'Team 1 is required'),
  team2_id: z.string().min(1, 'Team 2 is required'),
  start_time: z.string().min(1, 'Start time is required'),
  stream_url: z.string().url().optional().or(z.literal('')),
});

type MatchFormData = z.infer<typeof matchSchema>;

interface MatchFormProps {
  onSubmit: (data: MatchFormData) => Promise<void>;
  tournaments: Array<{ id: string; title: string }>;
  isLoading?: boolean;
}

export function MatchForm({ onSubmit, tournaments, isLoading }: MatchFormProps) {
  const [teams, setTeams] = useState<Array<{ id: string; team_name: string }>>([]);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      start_time: new Date().toLocaleString('en-CA', { 
        timeZone: 'Asia/Kolkata', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }).replace(/,/, '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
    },
  });

  const tournamentId = watch('tournament_id');

  useEffect(() => {
    if (tournamentId) {
      fetchTeamsForTournament(tournamentId);
    }
  }, [tournamentId]);

  const fetchTeamsForTournament = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, team_name')
        .eq('tournament_id', tournamentId)
        .eq('status', 'approved');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 bg-white";

  // Handle form submission to ensure IST
  const handleFormSubmit = (data: MatchFormData) => {
    // Convert start_time to ISO string with IST timezone
    const istDate = new Date(data.start_time);
    const istTimeString = istDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const isoISTTime = new Date(istTimeString).toISOString();
    
    const adjustedData = {
      ...data,
      start_time: isoISTTime,
    };
    onSubmit(adjustedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tournament</label>
        <select
          {...register('tournament_id')}
          className={inputClasses}
        >
          <option value="">Select Tournament</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.title}
            </option>
          ))}
        </select>
        {errors.tournament_id && (
          <p className="mt-1 text-sm text-red-600">{errors.tournament_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Round</label>
        <input
          type="number"
          {...register('round', { valueAsNumber: true })}
          className={inputClasses}
          min={1}
        />
        {errors.round && (
          <p className="mt-1 text-sm text-red-600">{errors.round.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Team 1</label>
          <select
            {...register('team1_id')}
            className={inputClasses}
            disabled={!tournamentId}
          >
            <option value="">Select Team 1</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.team_name}
              </option>
            ))}
          </select>
          {errors.team1_id && (
            <p className="mt-1 text-sm text-red-600">{errors.team1_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Team 2</label>
          <select
            {...register('team2_id')}
            className={inputClasses}
            disabled={!tournamentId}
          >
            <option value="">Select Team 2</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.team_name}
              </option>
            ))}
          </select>
          {errors.team2_id && (
            <p className="mt-1 text-sm text-red-600">{errors.team2_id.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Start Time (IST)</label>
        <input
          type="datetime-local"
          {...register('start_time')}
          className={inputClasses}
        />
        {errors.start_time && (
          <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Stream URL (Optional)</label>
        <input
          type="url"
          {...register('stream_url')}
          className={inputClasses}
          placeholder="https://twitch.tv/..."
        />
        {errors.stream_url && (
          <p className="mt-1 text-sm text-red-600">{errors.stream_url.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Swords className="h-5 w-5" />}
        >
          Create Match
        </Button>
      </div>
    </form>
  );
}