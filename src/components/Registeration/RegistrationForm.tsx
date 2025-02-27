import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Gamepad2,
  CheckCircle,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import {
  registrationSchema,
  RegistrationFormData,
} from "../../types/registration";
import FormSection from "./FormSection";
import InputField from "./InputField";

interface RegistrationFormProps {
  tournamentId: string;
  onSubmit: (data: RegistrationFormData) => void;
  isSubmitting: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  tournamentId,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamDetails: { teamMembers: Array(3).fill({ name: "", username: "" }) },
      termsAndConditions: {
        agreeToRules: false,
        agreeToFairPlay: false,
        agreeToMediaUsage: false,
      },
    },
  });

  return (
    <section className="min-h-screen py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            BGMI Tournament Registration
          </h1>
          <p className="text-purple-400">
            Fill out the form to register for the tournament
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <FormSection
            title="Personal Information"
            icon={<Trophy className="w-6 h-6 text-purple-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                register={register("personalInfo.fullName")}
                error={errors.personalInfo?.fullName}
                placeholder="Enter your full name"
              />
              <InputField
                label="In-game Name"
                register={register("personalInfo.inGameName")}
                error={errors.personalInfo?.inGameName}
                placeholder="Enter your BGMI username"
              />
              <InputField
                label="Date of Birth"
                type="date"
                register={register("personalInfo.dateOfBirth")}
                error={errors.personalInfo?.dateOfBirth}
              />
              <InputField
                label="Contact Number"
                type="tel"
                register={register("personalInfo.contactNumber")}
                error={errors.personalInfo?.contactNumber}
                placeholder="+91 1234567890"
              />
              <InputField
                label="Email Address"
                type="email"
                register={register("personalInfo.email")}
                error={errors.personalInfo?.email}
                placeholder="your.email@example.com"
                className="md:col-span-2"
              />
            </div>
          </FormSection>

          {/* Team Details */}
          <FormSection
            title="Team Details"
            icon={<Users className="w-6 h-6 text-purple-400" />}
          >
            <div className="space-y-6">
              <InputField
                label="Team Name"
                register={register("teamDetails.teamName")}
                error={errors.teamDetails?.teamName}
                placeholder="Enter your team name"
              />
              <div>
                <InputField
                  label="Team Logo URL"
                  type="url"
                  register={register("teamDetails.teamLogo")}
                  error={errors.teamDetails?.teamLogo}
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Provide a URL to your team's logo image (PNG, JPG, or JPEG
                  format)
                </p>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Team Members
                </label>
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <InputField
                      label=""
                      register={register(
                        `teamDetails.teamMembers.${index}.name`
                      )}
                      placeholder={`Member ${index + 1} Name`}
                    />
                    <InputField
                      label=""
                      register={register(
                        `teamDetails.teamMembers.${index}.username`
                      )}
                      placeholder={`Member ${index + 1} Username`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("teamDetails.isTeamCaptain")}
                  className="w-4 h-4 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I am the team captain
                </label>
              </div>
            </div>
          </FormSection>

          {/* Game Details */}
          <FormSection
            title="Game Details"
            icon={<Gamepad2 className="w-6 h-6 text-purple-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  {...register("gameDetails.platform")}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Emulator">Emulator</option>
                </select>
              </div>
              <InputField
                label="BGMI UID"
                register={register("gameDetails.uid")}
                placeholder="Enter your BGMI UID"
              />
              <InputField
                label="Device Model"
                register={register("gameDetails.deviceModel")}
                placeholder="e.g., iPhone 13 Pro, Samsung S21"
              />
              <InputField
                label="Region"
                register={register("gameDetails.region")}
                placeholder="e.g., Asia, Europe"
              />
            </div>
          </FormSection>

          {/* Tournament Details */}
          <FormSection
            title="Tournament Details"
            icon={<Trophy className="w-6 h-6 text-purple-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format
                </label>
                <select
                  {...register("tournamentDetails.format")}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Squad">Squad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mode
                </label>
                <select
                  {...register("tournamentDetails.mode")}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Battle Royale">Battle Royale</option>
                </select>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("tournamentDetails.experience")}
                  className="w-4 h-4 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I have participated in tournaments before
                </label>
              </div>
              {watch("tournamentDetails.experience") && (
                <textarea
                  {...register("tournamentDetails.previousTournaments")}
                  className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 h-24"
                  placeholder="Please list your previous tournament experience..."
                />
              )}
            </div>
          </FormSection>

          {/* Terms and Conditions */}
          <FormSection
            title="Terms and Conditions"
            icon={<CheckCircle className="w-6 h-6 text-purple-400" />}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register("termsAndConditions.agreeToRules")}
                  className="w-4 h-4 mt-1 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I agree to the tournament rules and regulations
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register("termsAndConditions.agreeToFairPlay")}
                  className="w-4 h-4 mt-1 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I agree to play fairly and follow BGMI's terms of service
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register("termsAndConditions.agreeToMediaUsage")}
                  className="w-4 h-4 mt-1 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-300">
                  I consent to the use of my gameplay footage and photos for
                  promotional purposes
                </label>
              </div>
            </div>
          </FormSection>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" />
            {isSubmitting ? "PROCESSING..." : "PROCEED TO PAYMENT"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;
