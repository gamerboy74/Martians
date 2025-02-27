import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrationService } from "../services/registrationService";
import { useApp } from "../context/AppContext";
import type { RegistrationFormData } from "../types/registration";

export function useRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useApp();
  const navigate = useNavigate();

  const submitRegistration = async (data: RegistrationFormData, tournamentId: string) => {
    if (isSubmitting) return null;
    setIsSubmitting(true);

    try {
      const result = await registrationService.submitRegistration(data, tournamentId);

      if (result) {
        addNotification({
          id: Date.now().toString(),
          type: "success",
          message: "Registration submitted! Please complete the payment.",
        });
        return {
          registrationId: result.registrationId,
          uploadToken: result.uploadToken,
        };
      }
      throw new Error("No result returned from registration service");
    } catch (error) {
      console.error("Registration error:", error);
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during registration. Please try again.",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitRegistration,
  };
}