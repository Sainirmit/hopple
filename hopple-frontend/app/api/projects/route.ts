import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/projects - Get user's projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info to get the backend user ID
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me?email=${encodeURIComponent(
        session.user.email || ""
      )}`
    );

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        // User doesn't exist yet, return empty projects
        return NextResponse.json([]);
      }

      const error = await userResponse.json();
      return NextResponse.json(
        { error: error.message || "Failed to fetch user data" },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Call backend API to get the user's projects
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/?userId=${userId}`
      );

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || "Failed to fetch projects" },
          { status: response.status }
        );
      }

      const projects = await response.json();
      return NextResponse.json(projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
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

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectData = await request.json();

    // Get user info to get the backend user ID
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me?email=${encodeURIComponent(
        session.user.email || ""
      )}`
    );

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        // User doesn't exist yet, we should create the user first
        return NextResponse.json(
          {
            error: "User profile not found. Please complete onboarding first.",
          },
          { status: 400 }
        );
      }

      const error = await userResponse.json();
      return NextResponse.json(
        { error: error.message || "Failed to fetch user data" },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Add the user ID to the project data
    const projectWithUser = {
      ...projectData,
      userId: userId,
    };

    // Call backend API to create the project
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectWithUser),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.message || "Failed to create project" },
          { status: response.status }
        );
      }

      const newProject = await response.json();
      return NextResponse.json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
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
