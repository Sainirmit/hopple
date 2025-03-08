import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { apiRequest } from "@/lib/utils/api";

// PUT /api/user - Update user data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await request.json();

    // Save to backend API
    try {
      // First check if user exists
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me?email=${encodeURIComponent(
          session.user.email || ""
        )}`
      );

      if (emailResponse.ok) {
        // User exists, update it
        const existingUser = await emailResponse.json();

        // Call backend API using centralized API client
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${existingUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          return NextResponse.json(
            { error: error.message || "Failed to update user data" },
            { status: response.status }
          );
        }

        const updatedUser = await response.json();
        return NextResponse.json(updatedUser);
      } else if (emailResponse.status === 404) {
        // User doesn't exist, create it
        const createUserData = {
          ...userData,
          email: session.user.email,
          name: userData.name || session.user.name,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(createUserData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          return NextResponse.json(
            { error: error.message || "Failed to create user data" },
            { status: response.status }
          );
        }

        const newUser = await response.json();
        return NextResponse.json(newUser);
      } else {
        // Some other error
        return NextResponse.json(
          { error: "Failed to fetch user data" },
          { status: emailResponse.status }
        );
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
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

// GET /api/user - Get user data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call backend API to get the user data based on email
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me?email=${encodeURIComponent(
          session.user.email || ""
        )}`
      );

      if (response.ok) {
        const userData = await response.json();
        return NextResponse.json(userData);
      } else if (response.status === 404) {
        // User doesn't exist yet in the backend, return basic data from session
        return NextResponse.json({
          email: session.user.email,
          name: session.user.name,
          hasCompletedOnboarding: false,
        });
      } else {
        // Some other error
        return NextResponse.json(
          { error: "Failed to fetch user data" },
          { status: response.status }
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Return basic data from session as fallback
      return NextResponse.json({
        email: session.user.email,
        name: session.user.name,
        hasCompletedOnboarding: false,
      });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
