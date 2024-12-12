"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [age, setAge] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [bio, setBio] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch user data with useCallback
  const fetchUserData = useCallback(async () => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/user-data");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          setAge(data.age || "");
          setIsActive(data.isActive || false);
          setBio(data.bio || "");
        } else if (res.status === 401) {
          router.push("/api/auth/signin");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, fetchUserData, router]);

  // Update user data
  const updateUserData = async () => {
    const res = await fetch("/api/user-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age, isActive, bio }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUserData(updated);
    } else {
      console.error("Failed to update user data");
    }
  };

  // Delete user data
  const deleteUserData = async () => {
    const res = await fetch("/api/user-data", { method: "DELETE" });
    if (res.ok) {
      setUserData(null);
    } else {
      console.error("Failed to delete user data");
    }
  };

  // Render loading state if user data is not fetched yet
  if (!userData && status === "authenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen px-4 bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg mt-4">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-2 mt-4">
          Hello {session?.user?.name?.split(" ")[0] || "Guest"}!
        </h1>
        <div className="text-center mb-4">
          <p>
            Email:{" "}
            <span className="font-bold text-gray-700">
              {session?.user?.email}
            </span>
          </p>
          <div className="flex justify-center">
            <Link href="/activities">
              <button className="bg-green-500 text-white font-bold px-4 rounded-md py-1 mt-3">
                Go to Activities
              </button>
            </Link>
          </div>
          <h2 className="text-lg font-semibold mb-4 mt-6">User Profile</h2>
        </div>
        {/* Age Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Age:
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {/* Active Checkbox */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Active:
          </label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-green-500 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>
        {/* Bio Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Bio:
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {/* Buttons */}
        <div className="flex flex-wrap gap-2 justify-between">
          <button
            onClick={updateUserData}
            className="flex-grow bg-green-500 text-white py-1 px-2 rounded-md font-semibold hover:bg-green-600"
          >
            Update
          </button>
          <button
            onClick={deleteUserData}
            className="flex-grow bg-red-500 text-white py-1 px-2 rounded-md font-semibold hover:bg-red-600"
          >
            Delete Account
          </button>
          <button
            onClick={() => signOut()}
            className="flex-grow bg-gray-800 text-white py-1 px-2 rounded-md font-semibold hover:bg-gray-900"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
