"use client";
import { useEffect, useState } from "react";

// Move defaultFunFacts outside the component as a constant
const defaultFunFacts = [
  "Did you know? The average cloud weighs 1.1 million pounds ☁️",
  "Fun Fact: Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs 🍯",
  "Did you know? Octopuses have three hearts 🐙",
  "Fun Fact: Bananas are berries, but strawberries aren’t 🍌🍓",
  "Did you know? The Eiffel Tower can grow by 6 inches during summer ☀️",
];

export default function Loading() {
  const [funFact, setFunFact] = useState("Fetching a fun fact...");

  useEffect(() => {
    const fetchFunFact = async () => {
      try {
        const response = await fetch(
          "https://uselessfacts.jsph.pl/random.json?language=en"
        );
        if (response.ok) {
          const data = await response.json();
          setFunFact(data.text);
        } else {
          throw new Error("Failed to fetch fun fact.");
        }
      } catch (error) {
        console.error("Error fetching fun fact:", error);
        const fallbackFact =
          defaultFunFacts[Math.floor(Math.random() * defaultFunFacts.length)];
        setFunFact(fallbackFact);
      }
    };

    fetchFunFact();
  }, []); // No need to include defaultFunFacts here because it's now outside the component

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-4">
      <div className="text-center max-w-lg w-full">
        {/* Spinning Loader */}
        <div className="relative w-24 h-24 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>

        {/* Loading Text */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-6 animate-bounce">
          Loading, please wait...
        </h1>

        {/* Animated Decorative Dots */}
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-200"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-400"></div>
        </div>

        {/* Fun Fact Section */}
        <p className="text-sm md:text-base text-white mt-6 italic opacity-80 px-4">
          {funFact}
        </p>
      </div>
    </div>
  );
}
