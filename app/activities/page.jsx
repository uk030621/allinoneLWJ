"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ActivitiesDashboard() {
  const { data: session, status } = useSession(); // Add session handling with status
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
  });
  const [editActivity, setEditActivity] = useState(null); // State for editing
  const [isExiting, setIsExiting] = useState(false); // State for "Exiting" message
  const router = useRouter();

  // Fetch activities with useCallback
  const fetchActivities = useCallback(async () => {
    if (status === "authenticated" && !isExiting) {
      try {
        const res = await fetch("/api/activities", { credentials: "include" });

        if (!res.ok) {
          if (res.status === 401) {
            setIsExiting(true); // Show "Exiting" message if unauthorized
            signOut(); // Automatically log out if session expired
          }
          console.error("Failed to fetch activities:", res.statusText);
          return;
        }

        const data = await res.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    }
  }, [status, isExiting]);

  // Ensure session management and fetch activities
  useEffect(() => {
    if (status === "authenticated") {
      fetchActivities();
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, fetchActivities, router]);

  // Handle logout process
  const handleLogout = async () => {
    setIsExiting(true); // Display "Exiting" message
    await signOut({ redirect: false }); // Prevent automatic redirect
    router.push("/api/auth/signin"); // Explicitly redirect to login
  };

  if (isExiting) {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Signing Out...</h1>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  // Add activity
  const addActivity = async () => {
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
        credentials: "include", // Ensure cookies are sent
      });

      if (!res.ok) {
        console.error("Failed to add activity:", res.statusText);
        return;
      }

      setNewActivity({ title: "", description: "" });
      fetchActivities(); // Refresh the list
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  // Update activity
  const updateActivity = async (id, updatedData) => {
    try {
      const res = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedData }), // Include ID and updated fields
        credentials: "include", // Ensure cookies are sent
      });

      if (!res.ok) {
        console.error("Failed to update activity:", res.statusText);
        return;
      }

      alert("Activity updated successfully!");
      setEditActivity(null); // Reset the edit state
      fetchActivities(); // Refresh the activities list
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  // Delete activity
  const deleteActivity = async (id) => {
    try {
      const res = await fetch("/api/activities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), // Send the ID of the activity to delete
        credentials: "include", // Ensure cookies are sent
      });

      if (!res.ok) {
        console.error("Failed to delete activity:", res.statusText);
        return;
      }

      alert("Activity deleted successfully!");
      fetchActivities(); // Refresh the list of activities
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return (
    <div className="container mx-auto pt-0 p-4 max-w-screen-lg">
      {/* Navigation Button */}
      <div className="flex justify-end">
        {/*<Link href="/dashboard">
          <button className="bg-green-500 text-white font-bold px-4 py-1 mt-3 rounded hover:bg-green-600">
            Go to Dashboard
          </button>
        </Link>*/}
        <button
          onClick={handleLogout}
          className="bg-slate-600 text-white font-bold px-4 py-1 mt-3 ml-2 rounded hover:bg-slate-900"
        >
          Log Out
        </button>
      </div>

      {/* Welcome Section */}
      <h1 className="text-2xl font-bold text-left mt-4 break-words">
        Hello {session?.user?.name?.split(" ")[0] || "Guest"}!
      </h1>
      <div className="text-left mb-4">
        <p>
          Email:{" "}
          <span className="font-bold text-gray-700">
            {session?.user?.email}
          </span>
        </p>
      </div>

      {/* Activities Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">
          Add a task for {session?.user?.name}
        </h2>
        <input
          type="text"
          placeholder="Title"
          value={newActivity.title}
          onChange={(e) =>
            setNewActivity({ ...newActivity, title: e.target.value })
          }
          className="border p-2 w-full mb-2 break-words"
        />
        <textarea
          placeholder="Description"
          value={newActivity.description}
          onChange={(e) =>
            setNewActivity({ ...newActivity, description: e.target.value })
          }
          className="border p-2 w-full mb-2 break-words"
        />
        <div className="flex">
          <button
            onClick={addActivity}
            disabled={
              !newActivity.title.trim() || !newActivity.description.trim()
            } // Disable if fields are empty
            className={`px-4 py-2 rounded ${
              !newActivity.title.trim() || !newActivity.description.trim()
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Add Activity
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-6">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="p-4 border rounded shadow-md flex flex-col break-words"
            >
              {editActivity === activity._id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const updatedData = {
                      title: e.target.title.value,
                      description: e.target.description.value,
                      date: e.target.date.value,
                    };
                    updateActivity(activity._id, updatedData);
                  }}
                >
                  <input
                    name="title"
                    defaultValue={activity.title}
                    placeholder="Title"
                    className="border p-2 w-full mb-2 break-words truncate"
                    required
                  />
                  <textarea
                    name="description"
                    defaultValue={activity.description}
                    placeholder="Description"
                    className="border p-2 w-full mb-2 break-words"
                    required
                  />
                  <input
                    name="date"
                    type="date"
                    defaultValue={activity.date?.slice(0, 10)}
                    className="border p-2 w-full mb-2 break-words"
                  />
                  <div className="flex">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditActivity(null)}
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2 className="text-lg font-bold truncate">
                    {activity.title}
                  </h2>
                  <p className="break-words">{activity.description}</p>
                  <p className="text-xs mt-4">
                    Created: {new Date(activity.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    Updated: {new Date(activity.updatedAt).toLocaleString()}
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setEditActivity(activity._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteActivity(activity._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
