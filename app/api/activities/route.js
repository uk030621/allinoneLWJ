import { connectMongoDB } from "@/lib/mongodb";
import UserActivity from "@/models/useractivity";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

async function handleUnauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}

async function handleNotFound(message = "Resource not found") {
  return new Response(JSON.stringify({ error: message }), { status: 404 });
}

async function handleServerError(error) {
  console.error(error);
  return new Response(JSON.stringify({ error: "Internal Server Error" }), {
    status: 500,
  });
}

// GET Method: Fetch user activities
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return handleUnauthorized();

    await connectMongoDB();

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("search") || "";

    let query = { userId: session.user.id };

    if (searchQuery.toLowerCase() === "#completed") {
      query.completed = true;
    } else if (searchQuery.toLowerCase() === "#active") {
      query.completed = false;
    } else if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" }; // Case-insensitive search in titles
    }

    const activities = await UserActivity.find(query);
    return new Response(JSON.stringify(activities), { status: 200 });
  } catch (error) {
    return handleServerError(error);
  }
}

// POST Method: Add a new activity
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return handleUnauthorized();

    await connectMongoDB();

    const { title, description, date, completed } = await req.json();

    // Validate required fields
    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: "Title and description are required" }),
        { status: 400 }
      );
    }

    const activity = await UserActivity.create({
      userId: session.user.id,
      title,
      description,
      date: date || new Date(), // Default to current date if not provided
      completed: completed || false,
    });

    return new Response(JSON.stringify(activity), { status: 201 });
  } catch (error) {
    return handleServerError(error);
  }
}

// PUT Method: Update an existing activity
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return handleUnauthorized();

    await connectMongoDB();

    const { id, title, description, date, completed } = await req.json();

    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Activity ID is required" }),
        { status: 400 }
      );
    }

    const updatedActivity = await UserActivity.findByIdAndUpdate(
      id,
      {
        ...(title && { title }), // Only update if provided
        ...(description && { description }),
        ...(date && { date }),
        ...(typeof completed !== "undefined" && { completed }),
        updatedAt: new Date(), // Automatically update the timestamp
      },
      { new: true } // Return the updated document
    );

    if (!updatedActivity) return handleNotFound("Activity not found");

    return new Response(JSON.stringify(updatedActivity), { status: 200 });
  } catch (error) {
    return handleServerError(error);
  }
}

// DELETE Method: Remove an activity
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return handleUnauthorized();

    await connectMongoDB();

    const { id } = await req.json();

    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Activity ID is required" }),
        { status: 400 }
      );
    }

    const deletedActivity = await UserActivity.findByIdAndDelete(id);

    if (!deletedActivity) return handleNotFound("Activity not found");

    return new Response(
      JSON.stringify({ message: "Activity deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleServerError(error);
  }
}
