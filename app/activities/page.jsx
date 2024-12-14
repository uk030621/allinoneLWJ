//app/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ActivitiesDashboard() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
  });
  const [editActivity, setEditActivity] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    // Update the date and time every second
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch activities with useCallback
  const fetchActivities = useCallback(async () => {
    if (status === "authenticated" && !isExiting) {
      try {
        const res = await fetch("/api/activities", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            setIsExiting(true);
            signOut();
          }
          throw new Error(`Failed to fetch activities: ${res.statusText}`);
        }
        const data = await res.json();
        setActivities(data);
        setFilteredActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setErrorMessage(error.message);
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
    setIsExiting(true);
    await signOut({ redirect: false });
    router.push("/api/auth/signin");
  };

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(
        activities.filter(
          (activity) =>
            activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, activities]);

  // Early returns after hooks have been initialized
  if (isExiting) {
    return (
      <div className="container mx-auto flex justify-center bg-blue-200 items-center h-screen">
        <h1 className="text-2xl font-bold">Signing Out...</h1>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto flex justify-center bg-blue-200 items-center h-screen">
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
        throw new Error(`Failed to add activity: ${res.statusText}`);
      }

      setNewActivity({ title: "", description: "" });
      fetchActivities(); // Refresh the list
    } catch (error) {
      console.error("Error adding activity:", error);
      setErrorMessage(error.message);
    }
  };

  // Update activity
  const updateActivity = async (id, updatedData) => {
    try {
      const res = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedData }),
        credentials: "include", // Ensure cookies are sent
      });

      if (!res.ok) {
        throw new Error(`Failed to update activity: ${res.statusText}`);
      }

      alert("Activity updated successfully!");
      setEditActivity(null); // Reset the edit state
      fetchActivities(); // Refresh the activities list
    } catch (error) {
      console.error("Error updating activity:", error);
      setErrorMessage(error.message);
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
        throw new Error(`Failed to delete activity: ${res.statusText}`);
      }

      alert("Activity deleted successfully!");
      fetchActivities(); // Refresh the list of activities
    } catch (error) {
      console.error("Error deleting activity:", error);
      setErrorMessage(error.message);
    }
  };

  // Clear form inputs
  const clearInputs = async () => {
    setSearchQuery("");
    setNewActivity({
      title: "",
      description: "",
    });
  };

  return (
    <div className="bg-blue-200 h-screen">
      <div className="container mx-auto pt-0 p-4 max-w-screen-lg flex flex-col h-full">
        {/* Fixed Form Section */}
        <div className="flex-shrink-0">
          {/* Navigation Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-left mt-4 break-words">
              Hello {session?.user?.name?.split(" ")[0] || "Guest"}!
            </h1>
            <button
              onClick={handleLogout}
              className="bg-slate-600 text-white text-base px-3 py-1 mt-3 ml-2 rounded hover:bg-slate-900"
            >
              Exit
            </button>
          </div>

          <div className="text-left mb-4">
            <p>
              Email:{" "}
              <span className="font-bold text-gray-700">
                {session?.user?.email}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <p className=" text-base text-gray-700">
              {dateTime.toLocaleDateString()} {/* Format: e.g., 12/14/2024 */}
            </p>
            <p className=" text-base text-gray-700">
              {dateTime.toLocaleTimeString()} {/* Format: e.g., 10:30:15 AM */}
            </p>
          </div>

          {/* Search Section */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 w-full mb-4 break-words"
            />
          </div>

          {/* Add Action Form */}
          <div>
            <h2 className="text-xl font-bold mb-2">Add Reminder</h2>
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
            <div className="flex justify-between items-center">
              <button
                onClick={addActivity}
                disabled={
                  !newActivity.title.trim() || !newActivity.description.trim()
                }
                className={`px-3 py-1 text-base rounded-md ${
                  !newActivity.title.trim() || !newActivity.description.trim()
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Add action
              </button>
              <button
                onClick={clearInputs}
                className="bg-slate-600 text-white w-fit px-3 py-1 rounded-md ml-3 text-base hover:bg-slate-900"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message Section */}
          {errorMessage && (
            <div className="bg-red-100 text-red-600 p-2 rounded mt-2">
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Scrollable Activities Section */}
        <div className="flex-grow overflow-y-auto mt-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity._id}
                className="shadow-lg p-4 bg-slate-300 border rounded flex flex-col break-words"
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
                    {/* Updated description rendering */}
                    <p className="whitespace-pre-wrap break-words">
                      {activity.description}
                    </p>
                    <p className="italic text-xs mt-4">
                      Created: {new Date(activity.createdAt).toLocaleString()}
                    </p>
                    {activity.createdAt !== activity.updatedAt && (
                      <p className="italic mt-1 text-xs text-slate-600">
                        Updated: {new Date(activity.updatedAt).toLocaleString()}
                      </p>
                    )}
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => setEditActivity(activity._id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteActivity(activity._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
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
    </div>
  );
}
