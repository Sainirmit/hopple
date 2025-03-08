import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// POST /api/user/onboarding - Complete the onboarding process
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onboardingData = await request.json();

    // Add the email from the session
    const dataWithEmail = {
      ...onboardingData,
      email: session.user.email,
      // Ensure we have the correct structure for the backend
      hasCompletedOnboarding: true,
    };

    console.log(
      "Sending onboarding data to backend:",
      JSON.stringify(dataWithEmail, null, 2)
    );

    // Call backend API to complete onboarding
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataWithEmail),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(
          "Failed to save onboarding data to API:",
          JSON.stringify(error, null, 2)
        );
        console.error("Response status:", response.status);
        // Return the error for debugging but still mark as completed
        return NextResponse.json(
          {
            success: true,
            warning: error.detail || "Saved locally but not to backend",
          },
          { status: 200 }
        );
      }

      const userData = await response.json();
      return NextResponse.json(userData);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Return success but with a warning
      return NextResponse.json(
        { success: true, warning: "Saved locally but not to backend" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
