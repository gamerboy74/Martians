import { z } from 'zod';

export const registrationSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    inGameName: z.string().min(3, 'In-game name must be at least 3 characters'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    contactNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
  }),
  teamDetails: z.object({
    teamName: z.string().min(3, 'Team name must be at least 3 characters'),
    teamLogo: z.string().url('Please enter a valid image URL').optional(),
    teamMembers: z.array(z.object({
      name: z.string().min(3, 'Member name must be at least 3 characters'),
      username: z.string().min(3, 'Username must be at least 3 characters'),
    })).min(4, 'At least 4 team members required'),
    isTeamCaptain: z.boolean(),
  }),
  gameDetails: z.object({
    platform: z.enum(['Android', 'iOS', 'Emulator']),
    uid: z.string().min(6, 'UID must be at least 6 characters'),
    deviceModel: z.string().min(3, 'Device model must be at least 3 characters'),
    region: z.string().min(2, 'Region must be at least 2 characters'),
  }),
  tournamentDetails: z.object({
    format: z.enum(['Solo', 'Duo', 'Squad']),
    mode: z.enum(['Battle Royale', 'Team Deathmatch', 'Zombie Mode']),
    experience: z.boolean(),
    previousTournaments: z.string().optional(),
  }),
  termsAndConditions: z.object({
    agreeToRules: z.boolean().refine(val => val === true, 'You must agree to the rules'),
    agreeToFairPlay: z.boolean().refine(val => val === true, 'You must agree to fair play'),
    agreeToMediaUsage: z.boolean(),
  }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;