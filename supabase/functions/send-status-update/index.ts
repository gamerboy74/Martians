import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { Resend } from "https://esm.sh/resend"; // Unpinned like the first version

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
console.log("API Key:", Deno.env.get("RESEND_API_KEY"));



// List of allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://martiansgg.netlify.app",
  "http://localhost:5175", // Your current dev origin
  "http://localhost:5173", // Common Vite default port
   // Add your production domain later
];

serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Restrict to POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { email, fullName, teamName, tournamentId, status } = await req.json();

    // Validate required fields
    if (!email || !fullName || !teamName || !tournamentId || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const statusMessage =
      status === "approved"
        ? "Congratulations! Your team has been approved for the BGMI Tournament. Get ready to compete!"
        : "We regret to inform you that your team has been rejected for the BGMI Tournament.";

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified domain in production
      to: [email], // Ensure `to` is an array as per Resend API
      subject: `BGMI Tournament Registration Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Status Update</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #FFF5E1

;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #e9ecef;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background-image: url('https://media.discordapp.net/attachments/1334811878714769408/1337039646131224576/Banners-3.png?ex=67c10574&is=67bfb3f4&hm=d64a5cb1fcf72ff9138f41054487f89c7e30c53b3d5f8f553e8ab4131810ffec&=&format=webp&quality=lossless&width=1920&height=743');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              color: white;
              text-align: center;
              padding: 60px 20px 20px; /* Increased padding to enlarge banner, with extra at the top */
              border-bottom: 5px solid #ff0000; /* Red border to match banner */
              position: relative;
              min-height: 200px; /* Increased height to make banner larger */
            }
            .header-text {
              color: white;
              text-align: center;
              font-size: 24px;
              padding: 10px;
              background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay for readability */
              position: absolute;
              bottom: 20px; /* Position at the bottom of the banner */
              left: 0;
              right: 0;
              z-index: 1;
            }
            .content {
              padding: 30px;
              color: #444;
            }
            .content h2 {
              color: #ff0000; /* Red to match banner theme */
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content p {
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .details {
              background-color: #1a1a1a; /* Dark background to match banner */
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              border-left: 4px solid #ff0000; /* Red border to match banner */
              color: #ffffff; /* White text for contrast */
            }
            .details ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .details li {
              margin-bottom: 10px;
              font-weight: bold;
            }
            .status-message {
              background-color: ${status === "approved" ? "#e8f5e9" : "#ffebee"};
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              border-left: 4px solid ${status === "approved" ? "#4caf50" : "#f44336"};
              color: #333;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background-color: #1a1a1a; /* Dark background to match banner */
              color: #ffffff; /* White text for contrast */
              font-size: 14px;
              border-top: 1px solid #ff0000; /* Red border to match banner */
            }
            .button {
              display: inline-block;
              padding: 12px 25px;
              background-color: #ff0000; /* Red to match banner */
              color: white !important; /* Increased specificity with !important */
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin-top: 20px;
            }
            .button:hover {
              background-color: #cc0000; /* Darker red for hover */
            }
            @media (max-width: 480px) {
              .container {
                margin: 10px;
                border-radius: 0;
              }
              .header, .content, .footer {
                padding: 15px;
              }
              .header {
                padding: 40px 15px 15px; /* Adjusted for mobile */
                min-height: 150px; /* Reduced height for mobile */
              }
              .header-text {
                font-size: 20px;
                padding: 8px;
                bottom: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <!-- Banner image only, no logo -->
            </div>
            <div class="content">
              <h2>Hello ${fullName},</h2>
              <div class="status-message">${statusMessage}</div>
              <div class="details">
                <ul>
                  <li><strong>Team Name:</strong> ${teamName}</li>
                  <li><strong>Tournament ID:</strong> ${tournamentId}</li>
                </ul>
              </div>
              <p>For any questions, please reply to this email or contact our support team at <a href="mailto:support@martiansgg.com" style="color: #ff0000;">support@martiansgg.com</a>.</p>
              <a href="https://martiansgg.netlify.app/tournament/${tournamentId}" class="button" style="color: white;">View Tournament Details</a> <!-- Inline style for fallback -->
            </div>
            <div class="footer">
              <p>Best regards,<br>MARTIANS GAMING GUILD</p>
              <p>Questions? Contact us at <a href="mailto:support@martiansgg.com" style="color: #ff0000;">support@martiansgg.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: "Failed to send email", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ message: "Status update email sent successfully", data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Status update email failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send status update email", details: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
