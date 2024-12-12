import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return new Response(JSON.stringify(user), { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  await connectMongoDB();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { ...body }, // Update or replace the user document
    { upsert: true, new: true }
  );

  return new Response(JSON.stringify(user), { status: 201 });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  await connectMongoDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: body },
    { new: true }
  );

  return new Response(JSON.stringify(updatedUser), { status: 200 });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();

  const user = await User.findOneAndDelete({ email: session.user.email });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return new Response("User deleted", { status: 200 });
}
