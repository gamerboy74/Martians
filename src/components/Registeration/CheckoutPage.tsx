import React, { useState, useCallback, useMemo } from "react";
import { CreditCard, CheckCircle, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique identifiers

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
    const [txId, setTxId] = useState<string>("");
    const [uploadState, setUploadState] = useState<{
      file: File | null;
      preview: string | null;
      error: string | null;
      isUploading: boolean;
      uploadComplete: boolean;
      isSubmitted: boolean;
      uuid: string | null; // Add uuid to track the generated UUID
    }>({
      file: null,
      preview: null,
      error: null,
      isUploading: false,
      uploadComplete: false,
      isSubmitted: false,
      uuid: null, // Initialize uuid as null
    });

    const uploadImage = useCallback(
      async (file: File, fileName: string) => {
        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));
        try {
          console.log("Uploading file with name:", fileName);
          const { error, data } = await supabase.storage
            .from("payment-screenshots")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
              metadata: { upload_token: uploadToken },
            });

          if (error) {
            if (error.message.includes("duplicate")) {
              throw new Error(
                "File already uploaded. Please try again with a new file."
              );
            }
            throw error;
          }
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            uploadComplete: true,
          }));
          return fileName; // Return the full unique path
        } catch (error) {
          setUploadState((prev) => ({
            ...prev,
            error: "Failed to upload payment proof. Please try again.",
            isUploading: false,
            uploadComplete: false,
          }));
          console.error("Upload error:", error);
          return null;
        }
      },
      [uploadToken]
    );

    const handleImageChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log("Image selected, file:", file);
        if (file) {
          const uuid = uuidv4(); // Generate a unique UUID
          const fileName = `${tournamentId}/${uuid}_${file.name}`; // Unique path with UUID
          setUploadState((prev) => ({
            ...prev,
            file,
            preview: URL.createObjectURL(file),
            error: null,
            isUploading: true,
            uploadComplete: false,
            uuid, // Store the UUID in uploadState
          }));
          const uploadedPath = await uploadImage(file, fileName);
          if (uploadedPath) {
            setUploadState((prev) => ({
              ...prev,
              isUploading: false,
              uploadComplete: true,
            }));
          }
        }
      },
      [tournamentId, uploadImage]
    );

    const handleSubmit = useCallback(async () => {
      const { file, isUploading, uploadComplete, isSubmitted, uuid } =
        uploadState;
      console.log("Attempting submit, state:", {
        txId,
        file,
        isUploading,
        uploadComplete,
        isSubmitted,
        isSubmitting,
      });
      if (isSubmitted) {
        console.log("Submission already in progress, ignoring click");
        return; // Prevent multiple clicks
      }

      if (!txId || !file || isUploading) {
        setUploadState((prev) => ({
          ...prev,
          error:
            !txId || !file
              ? "Please provide both transaction ID and payment screenshot"
              : null,
        }));
        return;
      }

      if (!uploadComplete || !uuid) {
        // Check if uuid exists
        console.log("Upload or UUID not complete; re-checking...");
        return;
      }

      setUploadState((prev) => ({ ...prev, isSubmitted: true, error: null }));
      try {
        const fileName = file.name;
        console.log(
          "Submitting with txId and uploaded path:",
          `${tournamentId}/${uuid}_${fileName}` // Use the stored UUID
        );
        await onConfirm(txId, `${tournamentId}/${uuid}_${fileName}`); // Pass the consistent path
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          error: "Failed to submit registration. Please try again.",
          isSubmitted: false, // Reset on error to allow retry
        }));
        console.error("Submission error:", error);
      }
    }, [txId, uploadState, onConfirm, isSubmitting, tournamentId]);

    const canSubmit = useMemo(() => {
      const result =
        !!txId &&
        !!uploadState.file &&
        !uploadState.isUploading &&
        !isSubmitting &&
        uploadState.uploadComplete &&
        !uploadState.isSubmitted &&
        !!uploadState.uuid; // Ensure uuid exists
      console.log("canSubmit value:", result, "with state:", {
        txId,
        uploadState,
        isSubmitting,
      });
      return result;
    }, [
      txId,
      uploadState.file,
      uploadState.isUploading,
      uploadState.uploadComplete,
      uploadState.isSubmitted,
      uploadState.uuid, // Include uuid in memo dependencies
      isSubmitting,
    ]);

    return (
      <section className="min-h-screen py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
        <div className="max-w-2xl mx-auto relative">
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8 text-center">
            <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Complete Your Payment
            </h2>
            <p className="text-gray-300 mb-6">
              Registration Fee: <span className="text-purple-400">₹{fee}</span>
            </p>

            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-48 h-48 rounded-lg border border-purple-500/30 object-contain"
                />
                <p className="text-gray-300 mt-4">Scan to Pay</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Or send to UPI ID:</p>
                <p className="text-lg font-medium text-purple-400">{upiId}</p>
              </div>
              <div className="text-left text-sm text-gray-400 bg-black/50 p-4 rounded-lg">
                <p>Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your UPI app (Google Pay, PhonePe, etc.)</li>
                  <li>Scan the QR code or enter the UPI ID</li>
                  <li>
                    Enter ₹{fee} and add "Tournament {tournamentId}" in remarks
                  </li>
                  <li>Send the payment</li>
                  <li>
                    Upload payment screenshot and enter transaction ID below
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Transaction ID</label>
                <input
                  type="text"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Enter UPI Transaction ID"
                  disabled={uploadState.isUploading || uploadState.isSubmitted}
                  className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Upload Payment Screenshot
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="payment-upload"
                    disabled={
                      uploadState.isUploading || uploadState.isSubmitted
                    }
                  />
                  <label
                    htmlFor="payment-upload"
                    className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-gray-400 flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-500/10"
                  >
                    <Upload className="w-5 h-5" />
                    {uploadState.file
                      ? "Change Screenshot"
                      : "Upload Screenshot"}
                  </label>
                  {uploadState.preview && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={uploadState.preview}
                        alt="Payment preview"
                        className="w-48 h-48 rounded-lg border border-purple-500/30 object-contain"
                      />
                    </div>
                  )}
                </div>
                {uploadState.error && (
                  <p className="text-red-400 text-sm">{uploadState.error}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {uploadState.isUploading
                  ? "UPLOADING..."
                  : isSubmitting || uploadState.isSubmitted
                    ? "SUBMITTING..."
                    : "I’ve Paid - Submit Registration"}
              </button>
              <button
                onClick={onBack}
                disabled={
                  uploadState.isUploading ||
                  uploadState.isSubmitted ||
                  isSubmitting
                }
                className="w-full py-3 bg-transparent border border-purple-500/50 hover:bg-purple-500/10 rounded-lg text-purple-400 font-medium"
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
