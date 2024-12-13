import { connectMongoDB } from "@/lib/mongodb";
import UserActivity from "@/models/useractivity";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET Method: Fetch user activities with search
export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();

  const url = new URL(req.url);
  const searchQuery = url.searchParams.get("search") || "";

  // Fetch activities filtered by the search query
  const activities = await UserActivity.find({
    userId: session.user.id,
    title: { $regex: searchQuery, $options: "i" }, // Case-insensitive search in titles
  });

  return new Response(JSON.stringify(activities), { status: 200 });
}

// POST Method: Add a new activity
export async function POST(req) {
  //console.log("[POST /api/activities] Request received");
  const session = await getServerSession(authOptions);
  //console.log("[POST /api/activities] Session:", session);

  if (!session) {
    //console.error("[POST /api/activities] Unauthorized access attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();
  //console.log("[POST /api/activities] Connected to MongoDB");

  try {
    const { title, description, date } = await req.json();
    {
      /*console.log("[POST /api/activities] Data received:", {
      title,
      description,
      date,
    });*/
    }

    const activity = await UserActivity.create({
      userId: session.user.id,
      title,
      description,
      date: date || new Date(),
    });

    //console.log("[POST /api/activities] Activity created:", activity);

    return new Response(JSON.stringify(activity), { status: 201 });
  } catch (error) {
    //console.error("[POST /api/activities] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// PUT Method: Update an existing activity
export async function PUT(req) {
  //console.log("[PUT /api/activities] Request received");
  const session = await getServerSession(authOptions);
  //console.log("[PUT /api/activities] Session:", session);

  if (!session) {
    //console.error("[PUT /api/activities] Unauthorized access attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();
  //console.log("[PUT /api/activities] Connected to MongoDB");

  try {
    const { id, title, description, date } = await req.json();
    {
      /*console.log("[PUT /api/activities] Data received:", {
      id,
      title,
      description,
      date,
    });*/
    }

    const updatedActivity = await UserActivity.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date,
        updatedAt: new Date(), // Automatically update the timestamp
      },
      { new: true } // Return the updated document
    );

    if (!updatedActivity) {
      //console.error("[PUT /api/activities] Activity not found");
      return new Response("Activity not found", { status: 404 });
    }

    //console.log("[PUT /api/activities] Activity updated:", updatedActivity);

    return new Response(JSON.stringify(updatedActivity), { status: 200 });
  } catch (error) {
    //console.error("[PUT /api/activities] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// DELETE Method: Remove an activity
export async function DELETE(req) {
  //console.log("[DELETE /api/activities] Request received");
  const session = await getServerSession(authOptions);
  //console.log("[DELETE /api/activities] Session:", session);

  if (!session) {
    //console.error("[DELETE /api/activities] Unauthorized access attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();
  //console.log("[DELETE /api/activities] Connected to MongoDB");

  try {
    const { id } = await req.json(); // Expecting the ID in the request body
    //console.log("[DELETE /api/activities] Activity ID received:", id);

    const deletedActivity = await UserActivity.findByIdAndDelete(id);

    if (!deletedActivity) {
      //console.error("[DELETE /api/activities] Activity not found");
      return new Response("Activity not found", { status: 404 });
    }

    //console.log("[DELETE /api/activities] Activity deleted:", deletedActivity);

    return new Response("Activity deleted successfully", { status: 200 });
  } catch (error) {
    //console.error("[DELETE /api/activities] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
