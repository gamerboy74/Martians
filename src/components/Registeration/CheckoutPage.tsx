import React, { useState, useCallback, useMemo, useEffect } from "react";
import { CreditCard, CheckCircle, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";

interface CheckoutPageProps {
  fee: number;
  upiId: string;
  qrCodeUrl: string;
  tournamentId: string;
  uploadToken: string;
  onConfirm: (txId: string, filePath: string) => Promise<void> | void;
  onBack: () => void;
  isSubmitting: boolean;
}

const CheckoutPage: React.FC<CheckoutPageProps> = React.memo(
  ({
    fee,
    upiId,
    qrCodeUrl,
    tournamentId,
    uploadToken,
    onConfirm,
    onBack,
    isSubmitting,
  }) => {
    const [txId, setTxId] = useState("");
    const [uploadState, setUploadState] = useState<{
      file: File | null;
      preview: string | null;
      error: string | null;
      isUploading: boolean;
      uploadComplete: boolean;
      isSubmitted: boolean;
      uuid: string | null;
    }>({
      file: null,
      preview: null,
      error: null,
      isUploading: false,
      uploadComplete: false,
      isSubmitted: false,
      uuid: null,
    });
    const [tournamentTitle, setTournamentTitle] = useState<string | null>(null);
    const [isLoadingTitle, setIsLoadingTitle] = useState(true);

    useEffect(() => {
      const fetchTournamentTitle = async () => {
        try {
          const { data, error } = await supabase
            .from("tournaments")
            .select("title")
            .eq("id", tournamentId)
            .single();

          if (error) throw error;
          if (!data) throw new Error("Tournament not found");

          setTournamentTitle(data.title);
        } catch {
          setTournamentTitle("Unknown Tournament");
        } finally {
          setIsLoadingTitle(false);
        }
      };
      fetchTournamentTitle();

      // Cleanup preview URL to prevent memory leaks
      return () => {
        if (uploadState.preview) URL.revokeObjectURL(uploadState.preview);
      };
    }, [tournamentId, uploadState.preview]);

    const uploadImage = useCallback(
      async (file: File, fileName: string) => {
        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));
        try {
          const { error } = await supabase.storage
            .from("payment-screenshots")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
              metadata: { upload_token: uploadToken },
            });

          if (error) {
            if (error.message.includes("duplicate")) {
              throw new Error(
                "File already uploaded. Please try a new file."
              );
            }
            throw error;
          }
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            uploadComplete: true,
          }));
          return fileName;
        } catch {
          setUploadState((prev) => ({
            ...prev,
            error: "Failed to upload payment proof. Please try again.",
            isUploading: false,
            uploadComplete: false,
          }));
          return null;
        }
      },
      [uploadToken]
    );

    const handleImageChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uuid = uuidv4();
        const fileName = `${tournamentId}/${uuid}_${file.name}`;
        const preview = URL.createObjectURL(file);

        setUploadState((prev) => ({
          ...prev,
          file,
          preview,
          error: null,
          isUploading: true,
          uploadComplete: false,
          uuid,
        }));

        const uploadedPath = await uploadImage(file, fileName);
        if (uploadedPath) {
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            uploadComplete: true,
          }));
        }
      },
      [tournamentId, uploadImage]
    );

    const handleSubmit = useCallback(async () => {
      const { file, isUploading, uploadComplete, isSubmitted, uuid } = uploadState;
      if (isSubmitted || !txId || !file || isUploading || !uploadComplete || !uuid) {
        setUploadState((prev) => ({
          ...prev,
          error:
            !txId || !file
              ? "Please provide transaction ID and screenshot"
              : null,
        }));
        return;
      }

      setUploadState((prev) => ({ ...prev, isSubmitted: true, error: null }));
      try {
        await onConfirm(txId, `${tournamentId}/${uuid}_${file.name}`);
      } catch {
        setUploadState((prev) => ({
          ...prev,
          error: "Failed to submit. Please try again.",
          isSubmitted: false,
        }));
      }
    }, [txId, uploadState, onConfirm, tournamentId]);

    const debouncedSetTxId = useMemo(
      () => debounce((value: string) => setTxId(value), 300),
      []
    );

    const handleTxIdChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetTxId(e.target.value);
      },
      [debouncedSetTxId]
    );

    const canSubmit = useMemo(() => {
      const { file, isUploading, uploadComplete, isSubmitted, uuid } = uploadState;
      return (
        !!txId &&
        !!file &&
        !isUploading &&
        !isSubmitting &&
        uploadComplete &&
        !isSubmitted &&
        !!uuid
      );
    }, [
      txId,
      uploadState.file,
      uploadState.isUploading,
      uploadState.uploadComplete,
      uploadState.isSubmitted,
      uploadState.uuid,
      isSubmitting,
    ]);

    if (isLoadingTitle) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    return (
      <section className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
        <div className="max-w-2xl mx-auto relative">
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-center">
            <CreditCard className="w-10 sm:w-12 h-10 sm:h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Complete Your Payment
            </h2>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Registration Fee: <span className="text-purple-400">₹{fee}</span>
            </p>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-40 sm:w-48 h-40 sm:h-48 rounded-lg border border-purple-500/30 object-contain"
                />
                <p className="text-gray-300 mt-4 text-xs sm:text-sm">Scan to Pay</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-400">Or send to UPI ID:</p>
                <p className="text-base sm:text-lg font-medium text-purple-400">{upiId}</p>
              </div>
              <div className="text-left text-xs sm:text-sm text-gray-400 bg-black/50 p-3 sm:p-4 rounded-lg">
                <p>Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your UPI app (Google Pay, PhonePe, etc.)</li>
                  <li>Scan the QR code or enter the UPI ID</li>
                  <li>
                    Enter ₹{fee} and add "Tournament {tournamentTitle || 'Unknown'}" in remarks
                  </li>
                  <li>Send the payment</li>
                  <li>Upload screenshot and transaction ID below</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-gray-400">Transaction ID</label>
                <input
                  type="text"
                  onChange={handleTxIdChange}
                  placeholder="Enter UPI Transaction ID"
                  disabled={uploadState.isUploading || uploadState.isSubmitted}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-gray-400">
                  Upload Payment Screenshot
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="payment-upload"
                    disabled={uploadState.isUploading || uploadState.isSubmitted}
                  />
                  <label
                    htmlFor="payment-upload"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border border-purple-500/30 rounded-lg text-gray-400 flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-500/10 text-xs sm:text-sm"
                  >
                    <Upload className="w-4 sm:w-5 h-4 sm:h-5" />
                    {uploadState.file ? "Change Screenshot" : "Upload Screenshot"}
                  </label>
                  {uploadState.preview && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={uploadState.preview}
                        alt="Payment preview"
                        className="w-40 sm:w-48 h-40 sm:h-48 rounded-lg border border-purple-500/30 object-contain"
                      />
                    </div>
                  )}
                </div>
                {uploadState.error && (
                  <p className="text-red-400 text-xs sm:text-sm">{uploadState.error}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
              >
                <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                {uploadState.isUploading
                  ? "UPLOADING..."
                  : isSubmitting || uploadState.isSubmitted
                  ? "SUBMITTING..."
                  : "I’ve Paid - Submit Registration"}
              </button>
              <button
                onClick={onBack}
                disabled={uploadState.isUploading || uploadState.isSubmitted || isSubmitting}
                className="w-full py-2 sm:py-3 bg-transparent border border-purple-500/50 hover:bg-purple-500/10 rounded-lg text-purple-400 font-medium text-xs sm:text-sm"
              >
                Back to Form
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default CheckoutPage;