//app/activities/page.jsx
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
    completed: false, // New field for completion status
  });
  const [editActivity, setEditActivity] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const now = new Date();
    setDateTime(now); // Set initial consistent value
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (status === "authenticated") {
      fetchActivities();
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, fetchActivities, router]);

  const handleLogout = async () => {
    setIsExiting(true);
    await signOut({ redirect: false });
    router.push("/api/auth/signin");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredActivities(activities);
      } else if (searchQuery.toLowerCase() === "#completed") {
        setFilteredActivities(
          activities.filter((activity) => activity.completed)
        );
      } else if (searchQuery.toLowerCase() === "#active") {
        setFilteredActivities(
          activities.filter((activity) => !activity.completed)
        );
      } else {
        setFilteredActivities(
          activities.filter(
            (activity) =>
              activity.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              activity.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
        );
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery, activities]);

  const addActivity = async () => {
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to add activity: ${res.statusText}`);
      }

      setNewActivity({ title: "", description: "", completed: false });
      fetchActivities();
    } catch (error) {
      console.error("Error adding activity:", error);
      setErrorMessage(error.message);
    }
  };

  const updateActivity = async (id, updatedData) => {
    try {
      const res = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedData }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to update activity: ${res.statusText}`);
      }

      alert("Activity updated successfully!");
      setEditActivity(null);
      fetchActivities();
    } catch (error) {
      console.error("Error updating activity:", error);
      setErrorMessage(error.message);
    }
  };

  const deleteActivity = async (id) => {
    try {
      const res = await fetch("/api/activities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete activity: ${res.statusText}`);
      }

      alert("Activity deleted successfully!");
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      setErrorMessage(error.message);
    }
  };

  const toggleCompletion = async (id, currentStatus) => {
    updateActivity(id, { completed: !currentStatus });
  };

  const clearInputs = async () => {
    setSearchQuery("");
    setNewActivity({
      title: "",
      description: "",
      completed: false,
    });
  };

  return (
    <div className="bg-black h-screen">
      <div className="container mx-auto pt-0 p-4 max-w-screen-lg flex flex-col h-full">
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-white font-bold text-left mt-4 break-words">
              Hello {session ? session.user?.name?.split(" ")[0] : "Exiting..."}
              !
            </h1>
            {errorMessage ? (
              <div className="bg-red-100 text-red-600 p-2 rounded mt-2">
                <p>{errorMessage}</p>
              </div>
            ) : null}
            <button
              onClick={handleLogout}
              className="bg-slate-100 text-black text-base px-3 py-1 mt-3 ml-2 rounded hover:bg-slate-300"
            >
              Logout
            </button>
          </div>

          <div className="text-left text-white mb-1">
            <p>
              Email:{" "}
              <span className="font-bold text-white">
                {session?.user?.email}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            {dateTime ? (
              <>
                <p className=" text-sm text-white">
                  {dateTime.toLocaleDateString()}
                </p>
                <p className=" text-sm text-white">
                  {dateTime.toLocaleTimeString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-white">Loading time...</p>
            )}
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Search reminders... " //(e.g., #completed or #active)
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 w-full mb-4 break-words"
            />
          </div>

          <div className="flex items-center justify-start gap-4 text-xs mt-1 mb-5 text-white">
            {/* Active Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active-checkbox"
                checked={searchQuery === "#active"}
                onChange={() =>
                  setSearchQuery(searchQuery === "#active" ? "" : "#active")
                }
                className="w-4 h-4 m-0 p-0"
              />
              <label
                htmlFor="active-checkbox"
                className="ml-1 leading-none text-white"
              >
                Active
              </label>
            </div>

            {/* Done Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="done-checkbox"
                checked={searchQuery === "#completed"}
                onChange={() =>
                  setSearchQuery(
                    searchQuery === "#completed" ? "" : "#completed"
                  )
                }
                className="w-4 h-4 m-0 p-0"
              />
              <label
                htmlFor="done-checkbox"
                className="ml-1 leading-none text-white"
              >
                Done
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl text-white font-bold mb-2">Add Reminder</h2>
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
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={addActivity}
                disabled={
                  !newActivity.title.trim() || !newActivity.description.trim()
                }
                className={`px-3 py-1 text-base text-black rounded-md ${
                  !newActivity.title.trim() || !newActivity.description.trim()
                    ? "bg-gray-100 cursor-not-allowed text-gray-400"
                    : "bg-green-500 text-black hover:bg-green-600"
                }`}
              >
                Add reminder
              </button>
              <button
                onClick={clearInputs}
                className="bg-slate-100 text-black w-fit px-3 py-1 rounded-md ml-3 text-base hover:bg-slate-300"
              >
                Refresh
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-100 text-red-600 p-2 rounded mt-2">
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

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
                        completed: e.target.completed.checked,
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
                    <div className="flex items-center justify-start mt-1 mb-5">
                      <input
                        name="completed"
                        type="checkbox"
                        defaultChecked={activity.completed}
                        className="w-4 h-4 m-0 p-0"
                      />
                      <label
                        htmlFor="completed"
                        className="text-xs ml-1 leading-none"
                        style={{ marginLeft: "4px", lineHeight: "1rem" }}
                      >
                        Completed
                      </label>
                    </div>

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
                    <p className="whitespace-pre-wrap break-words">
                      {activity.description}
                    </p>
                    <p>
                      <div className="flex items-center justify-start text-xs mt-6">
                        <input
                          name="completed"
                          type="checkbox"
                          checked={activity.completed}
                          onChange={() =>
                            toggleCompletion(activity._id, activity.completed)
                          }
                          className="w-4 h-4 m-0 p-0"
                        />
                        <label
                          htmlFor="completed"
                          className="text-xs ml-1 leading-none"
                          style={{ marginLeft: "4px", lineHeight: "1rem" }}
                        >
                          <span>Completed</span>
                        </label>
                      </div>
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
