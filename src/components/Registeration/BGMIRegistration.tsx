import React, { useState, useEffect } from "react";
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
  const [tournamentData, setTournamentData] = useState<{
    registration_fee: number;
    qr_code_url?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tournamentId = location.state?.tournamentId;

  // Log component render to debug double loading
  console.log("BGMIRegistration rendered, tournamentId:", tournamentId);

  // Early return if no tournamentId to prevent unnecessary renders
  if (!tournamentId) {
    console.log("No tournamentId, redirecting to /");
    return <Navigate to="/" />;
  }

  // Fetch tournament data (registration_fee and qr_code_url) from Supabase
  useEffect(() => {
    console.log("useEffect triggered for fetching tournament data");
    const fetchTournamentData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("registration_fee, qr_code_url")
          .eq("id", tournamentId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Tournament not found");

        console.log("Tournament data fetched:", data);
        setTournamentData({
          registration_fee: data.registration_fee,
          qr_code_url: data.qr_code_url,
        });
      } catch (error) {
        console.error("Error fetching tournament data:", error);
        addNotification({
          id: Date.now().toString(),
          type: "error",
          message: "Failed to load tournament details. Please try again.",
        });
        navigate("/"); // Redirect to home on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournamentData();

    // Cleanup function to prevent memory leaks or double fetches
    return () => {
      console.log("Cleanup for fetchTournamentData effect");
    };
  }, [tournamentId, addNotification, navigate]); // Dependencies are stable, should run once

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
      console.log("Confirmation email sent successfully");
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
    console.log("handleFormSubmit called with data:", data);
    try {
      const result = await submitRegistration(data, tournamentId);
      if (result) {
        setFormData(data);
        setRegistrationId(result.registrationId);
        setUploadToken(result.uploadToken);
        setShowCheckout(true);
        console.log("Registration submitted, moving to checkout");
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
      "handlePaymentConfirmation called - txId:",
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
          payment_screenshot_path: filePath,
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
      console.log("Navigated to registration-success");
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

  // Show spinner while loading tournament data
  if (isLoading) {
    console.log("Rendering spinner due to isLoading");
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If tournament data failed to load, it will have redirected already
  if (!tournamentData) {
    console.log("No tournamentData, should have redirected");
    return null;
  }

  console.log("Rendering main content, showCheckout:", showCheckout);
  return showCheckout ? (
    <CheckoutPage
      fee={tournamentData.registration_fee}
      upiId="yourbusiness@upi"
      qrCodeUrl={
        tournamentData.qr_code_url ||
        "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"
      }
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