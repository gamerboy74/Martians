import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Trophy, Users, Gamepad2, CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import { registrationSchema } from '../types/registration';
import { useRegistration } from '../hooks/useRegistration';
import type { RegistrationFormData } from '../types/registration';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const BGMIRegistration: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSubmitting, submitRegistration } = useRegistration();
  const { addNotification } = useApp();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamDetails: {
        teamMembers: Array(3).fill({ name: '', username: '' }),
      },
      termsAndConditions: {
        agreeToRules: false,
        agreeToFairPlay: false,
        agreeToMediaUsage: false,
      },
    },
  });

  const tournamentId = location.state?.tournamentId;

  if (!tournamentId) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await submitRegistration(data, tournamentId);
      navigate('/registration-success');
    } catch (error) {
      console.error('Registration error:', error);
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: error instanceof Error 
          ? error.message 
          : 'An error occurred during registration. Please try again.',
      });
    }
  };

  return (
    <section className="min-h-screen py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">BGMI Tournament Registration</h1>
          <p className="text-purple-400">Fill out the form below to register for the tournament</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-white mb-4">
              <Trophy className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('personalInfo.fullName')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Enter your full name"
                />
                {errors.personalInfo?.fullName && (
                  <p className="mt-1 text-red-400 text-sm">{errors.personalInfo.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  In-game Name
                </label>
                <input
                  type="text"
                  {...register('personalInfo.inGameName')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Enter your BGMI username"
                />
                {errors.personalInfo?.inGameName && (
                  <p className="mt-1 text-red-400 text-sm">{errors.personalInfo.inGameName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register('personalInfo.dateOfBirth')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                {errors.personalInfo?.dateOfBirth && (
                  <p className="mt-1 text-red-400 text-sm">{errors.personalInfo.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  {...register('personalInfo.contactNumber')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="+91 1234567890"
                />
                {errors.personalInfo?.contactNumber && (
                  <p className="mt-1 text-red-400 text-sm">{errors.personalInfo.contactNumber.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('personalInfo.email')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="your.email@example.com"
                />
                {errors.personalInfo?.email && (
                  <p className="mt-1 text-red-400 text-sm">{errors.personalInfo.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Team Details */}
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-white mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Team Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  {...register('teamDetails.teamName')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Enter your team name"
                />
                {errors.teamDetails?.teamName && (
                  <p className="mt-1 text-red-400 text-sm">{errors.teamDetails.teamName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Logo URL
                </label>
                <input
                  type="url"
                  {...register('teamDetails.teamLogo')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="https://example.com/logo.png"
                />
                {errors.teamDetails?.teamLogo && (
                  <p className="mt-1 text-red-400 text-sm">{errors.teamDetails.teamLogo.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-400">
                  Provide a URL to your team's logo image (PNG, JPG, or JPEG format)
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Team Members
                </label>
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      {...register(`teamDetails.teamMembers.${index}.name`)}
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                      text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder={`Member ${index + 1} Name`}
                    />
                    <input
                      type="text"
                      {...register(`teamDetails.teamMembers.${index}.username`)}
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                      text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder={`Member ${index + 1} Username`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('teamDetails.isTeamCaptain')}
                  className="w-4 h-4 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I am the team captain
                </label>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-white mb-4">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Game Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  {...register('gameDetails.platform')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Emulator">Emulator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BGMI UID
                </label>
                <input
                  type="text"
                  {...register('gameDetails.uid')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Enter your BGMI UID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Device Model
                </label>
                <input
                  type="text"
                  {...register('gameDetails.deviceModel')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="e.g., iPhone 13 Pro, Samsung S21"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  {...register('gameDetails.region')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="e.g., Asia, Europe"
                />
              </div>
            </div>
          </div>

          {/* Tournament Details */}
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-white mb-4">
              <Trophy className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Tournament Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format
                </label>
                <select
                  {...register('tournamentDetails.format')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Squad">Squad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mode
                </label>
                <select
                  {...register('tournamentDetails.mode')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Battle Royale">Battle Royale</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('tournamentDetails.experience')}
                  className="w-4 h-4 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I have participated in tournaments before
                </label>
              </div>

              {watch('tournamentDetails.experience') && (
                <textarea
                  {...register('tournamentDetails.previousTournaments')}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg 
                  text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 h-24"
                  placeholder="Please list your previous tournament experience..."
                />
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-white mb-4">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Terms and Conditions</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register('termsAndConditions.agreeToRules')}
                  className="w-4 h-4 mt-1 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I agree to the tournament rules and regulations
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register('termsAndConditions.agreeToFairPlay')}
                  className="w-4 h-4 mt-1 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I agree to play fairly and follow BGMI's terms of service
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register('termsAndConditions.agreeToMediaUsage')}
                  className="w-4 h-4 mt-1 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I consent to the use of my gameplay footage and photos for promotional purposes
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium 
            transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trophy className="w-5 h-5" />
            <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT REGISTRATION'}</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default BGMIRegistration;