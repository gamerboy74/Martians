import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { RegistrationFormData } from "../../types/registration";
import { useRegistration } from "../../hooks/useRegistration";
import { useApp } from "../../context/AppContext";
import RegistrationForm from "./RegistrationForm";
import CheckoutPage from "./CheckoutPage";
import { supabase } from "../../lib/supabase";

const BGMIRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitting, submitRegistration } = useRegistration();
  const { addNotification } = useApp();
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const tournamentId = location.state?.tournamentId;
  const registrationFee = 500; // INR
  const upiId = "yourbusiness@upi"; // Replace with your actual UPI ID
  const qrCodeUrl =
    "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"; // Replace with your actual QR code URL

  if (!tournamentId) return <Navigate to="/" />;

  const sendConfirmationEmail = async (
    email: string,
    fullName: string,
    teamName: string
  ) => {
    const payload = { email, fullName, teamName, tournamentId };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to send confirmation email");
    } catch (error) {
      console.error("Email sending failed:", error);
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message:
          "Registration successful, but failed to send confirmation email.",
      });
    }
  };

  const handleFormSubmit = async (data: RegistrationFormData) => {
    try {
      const result = await submitRegistration(data, tournamentId);
      if (result) {
        setFormData(data);
        setRegistrationId(result.registrationId);
        setUploadToken(result.uploadToken);
        setShowCheckout(true);
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: "Failed to submit registration. Please try again.",
      });
    }
  };

  const handlePaymentConfirmation = async (txId: string, filePath: string) => {
    if (!formData || !registrationId || !uploadToken) {
      console.error("Missing required data:", {
        formData,
        registrationId,
        uploadToken,
      });
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: "Missing required registration data. Please try again.",
      });
      return;
    }

    console.log(
      "Saving txId:",
      txId,
      "filePath:",
      filePath,
      "registrationId:",
      registrationId
    );
    try {
      const { error } = await supabase
        .from("registrations")
        .update({
          payment_screenshot_path: filePath, // Ensure this is the Storage path, not URL
          tx_id: txId,
          status: "pending",
        })
        .eq("id", registrationId);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      console.log("Update successful, verifying path...");
      const { data: verificationData } = await supabase
        .from("registrations")
        .select("payment_screenshot_path")
        .eq("id", registrationId)
        .single();
      console.log(
        "Verified stored path in database:",
        verificationData?.payment_screenshot_path
      );

      await sendConfirmationEmail(
        formData.personalInfo.email,
        formData.personalInfo.fullName,
        formData.teamDetails.teamName
      );
      navigate("/registration-success");
    } catch (error) {
      console.error("Error in handlePaymentConfirmation:", error);
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to confirm payment.",
      });
    }
  };

  return showCheckout ? (
    <CheckoutPage
      fee={registrationFee}
      upiId={upiId}
      qrCodeUrl={qrCodeUrl}
      tournamentId={tournamentId}
      uploadToken={uploadToken || ""}
      onConfirm={handlePaymentConfirmation}
      onBack={() => setShowCheckout(false)}
      isSubmitting={isSubmitting}
    />
  ) : (
    <RegistrationForm
      tournamentId={tournamentId}
      onSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default BGMIRegistration;
