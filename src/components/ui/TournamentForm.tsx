import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy } from "lucide-react";
import { Button } from "./Button";
import { supabase } from "../../lib/supabase";
import { Tournament } from "../../types";

const tournamentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  game: z.string().min(2, "Game must be at least 2 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  registration_deadline: z.string().min(1, "Registration deadline is required"),
  prize_pool: z.string().min(1, "Prize pool is required"),
  registration_fee: z.number().min(0, "Registration fee cannot be negative"),
  max_participants: z.number().min(2, "Must have at least 2 participants"),
  format: z.enum(["solo", "duo", "squad", "team"], {
    required_error: "Please select a format",
  }),
  status: z.enum(["upcoming", "ongoing", "completed"]).default("upcoming"),
  registration_open: z.boolean().default(true),
  image_url: z.string().url("Please enter a valid image URL"),
});

type TournamentFormData = z.infer<typeof tournamentSchema> & {
  qr_code_file?: File;
};

interface TournamentFormProps {
  onSubmit: (data: Omit<Tournament, "id" | "created_at" | "updated_at">) => Promise<void>;
  initialData?: Partial<Tournament>;
  isLoading?: boolean;
}

export function TournamentForm({ onSubmit, initialData, isLoading }: TournamentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      registration_open: true,
      status: "upcoming",
      registration_fee: 0,
      ...initialData,
    },
  });

  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(initialData?.qr_code_url || null);

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
      setQrCodePreview(URL.createObjectURL(file));
    }
  };

  const onSubmitWithUpload = async (data: TournamentFormData) => {
    let qrCodeUrl = initialData?.qr_code_url;

    if (qrCodeFile) {
      const fileExt = qrCodeFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `qr-codes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("qr-codes")
        .upload(filePath, qrCodeFile);

      if (uploadError) {
        console.error("Error uploading QR code:", uploadError.message);
        throw new Error("Failed to upload QR code");
      }

      const { data: publicUrlData } = supabase.storage
        .from("qr-codes")
        .getPublicUrl(filePath);

      qrCodeUrl = publicUrlData.publicUrl;
    }

    const { qr_code_file, ...formData } = data;
    await onSubmit({
      ...formData,
      qr_code_url: qrCodeUrl,
      current_participants: 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitWithUpload)}
      className="space-y-4 sm:space-y-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl border border-gray-200/50 transition-all duration-300"
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Title */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 animate-fade-in">Title</label>
          <input
            type="text"
            {...register("title")}
            className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            placeholder="e.g., BGMI Championship 2024"
          />
          {errors.title && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 animate-slide-in">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 resize-none transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            placeholder="Describe your tournament..."
          />
          {errors.description && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.description.message}</p>}
        </div>

        {/* Game */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 animate-slide-in">Game</label>
          <input
            type="text"
            {...register("game")}
            className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            placeholder="e.g., BGMI, Valorant, etc."
          />
          {errors.game && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.game.message}</p>}
        </div>

        {/* Image URL */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 animate-slide-in">Image URL</label>
          <input
            type="url"
            {...register("image_url")}
            className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            placeholder="https://example.com/image.jpg"
          />
          {errors.image_url && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.image_url.message}</p>}
        </div>

        {/* QR Code Image */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 animate-slide-in">QR Code Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleQrCodeChange}
            className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
          />
          {qrCodePreview && (
            <div className="mt-2">
              <img
                src={qrCodePreview}
                alt="QR Code Preview"
                className="max-w-[200px] sm:max-w-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-500 hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Start Date</label>
            <input
              type="datetime-local"
              {...register("start_date")}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            />
            {errors.start_date && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.start_date.message}</p>}
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">End Date</label>
            <input
              type="datetime-local"
              {...register("end_date")}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            />
            {errors.end_date && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.end_date.message}</p>}
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Registration Deadline</label>
            <input
              type="datetime-local"
              {...register("registration_deadline")}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            />
            {errors.registration_deadline && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.registration_deadline.message}</p>}
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Prize Pool</label>
            <input
              type="text"
              {...register("prize_pool")}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
              placeholder="e.g., 10,000"
            />
            {errors.prize_pool && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.prize_pool.message}</p>}
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Registration Fee (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register("registration_fee", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
              placeholder="e.g., 50.00"
            />
            {errors.registration_fee && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.registration_fee.message}</p>}
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Max Participants</label>
            <input
              type="number"
              {...register("max_participants", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
              placeholder="e.g., 64"
            />
            {errors.max_participants && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.max_participants.message}</p>}
          </div>
        </div>

        {/* Format and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Format</label>
            <select
              {...register("format")}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            >
              <option value="">Select format</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
              <option value="team">Team</option>
            </select>
            {errors.format && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.format.message}</p>}
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 animate-slide-in">Status</label>
            <select
              {...register("status")}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-white/90 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg hover:border-purple-300 py-2 sm:py-3 px-3 sm:px-4"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            {errors.status && <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.status.message}</p>}
          </div>
        </div>

        {/* Registration Open */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("registration_open")}
            className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 hover:border-purple-500"
          />
          <label className="ml-2 block text-sm font-medium text-gray-700 animate-slide-in">Registration Open</label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Trophy className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />}
          className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
        >
          {initialData ? "Update Tournament" : "Create Tournament"}
        </Button>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }

        /* Responsive Adjustments for Small Devices */
        @media (max-width: 640px) {
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
          .p-6 {
            padding: 1rem;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .text-sm {
            font-size: 0.875rem;
          }
          .text-xs {
            font-size: 0.75rem;
          }
          .max-w-xs {
            max-width: 10rem;
          }
          .h-5 {
            height: 1.25rem;
            width: 1.25rem;
          }
          .gap-6 {
            gap: 1rem;
          }
        }
      `}</style>
    </form>
  );
}