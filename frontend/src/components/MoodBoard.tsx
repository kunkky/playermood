import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayOrNight } from "../utils/getDayOrNight";
import axios from "axios";
import * as FingerprintJS from "@fingerprintjs/fingerprintjs";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "../utils/BaseUrl";
import { Link } from "react-router-dom";

const MoodBoard = () => {
  type Mood = {
    emoji: string;
    label: string;
    value: string;
    animatedEmoji: string;
  };

  type TrainingSession = {
    title: string;
  };

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dayOrNight, setDayOrNight] = useState<"day" | "night">(
    getDayOrNight()
  );
  const [trainingSession, setTrainingSession] =
    useState<TrainingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  // Initialize fingerprint
  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    getFingerprint();
  }, []);

  // Fetch latest training session
  useEffect(() => {
    const fetchLatestTraining = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/get_latest_training.php`);
        if (response.data && response.data.title) {
          setTrainingSession(response.data);
        } else {
          setError("No training sessions found");
        }
      } catch (err) {
        setError("Failed to fetch training session");
        console.error("Error fetching training session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestTraining();
  }, []);

  // Check user's preferred color scheme
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Auto-set darkMode based on time of day
  useEffect(() => {
    const isNight = dayOrNight === "night";
    setDarkMode(isNight);
  }, [dayOrNight]);

  // Optional: update time-based theme every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDayOrNight(getDayOrNight());
    }, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, []);

  const moods: Mood[] = [
    {
      animatedEmoji: "/images/happy.gif",
      emoji: "😃",
      label: "Happy",
      value: "happy",
    },
    {
      animatedEmoji: "/images/neutral1.gif",
      emoji: "😐",
      label: "Neutral",
      value: "neutral",
    },
    {
      animatedEmoji: "/images/sad.gif",
      emoji: "😞",
      label: "Sad",
      value: "sad",
    },
  ];

  const handleMoodSelection = async (mood: Mood) => {
    if (!trainingSession || !fingerprint) return;

    setSelectedMood(mood);
    setIsLoading(true);

    try {
      const postMood = await axios.post(`${BASE_URL}/post_mood.php`, {
        user: fingerprint,
        mood: mood.value,
        title: trainingSession.title,
      });

      if (postMood.data) {
        toast.success(postMood.data.message);
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit mood. Please try again.");
      setError("Failed to submit mood. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMood(null);
    setSubmitted(false);
    setError(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-5 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800"
      }`}
    >
      <Toaster position="top-right" />
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full focus:outline-none"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <span className="text-yellow-300 text-2xl">☀️</span>
        ) : (
          <span className="text-blue-800 text-2xl">🌙</span>
        )}
      </button>
      <AnimatePresence>
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {error}
            </h2>
            <Link to="/coach" className="text-blue-400 hover:underline">
              {" "}
              Create one if you are a coach{" "}
            </Link>
            <p
              className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Or Please check back later.
            </p>
          </motion.div>
        ) : submitted ? (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <embed src="https://lottie.host/embed/efd02ae8-49a7-497e-bed1-0bd716c9df5b/ZRMLaNgxJz.lottie" />

            <h2
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Thanks for sharing your mood!
            </h2>
            <p
              className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Your feedback helps the team.
            </p>
            <button
              onClick={resetForm}
              className={`px-6 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Submit another mood
            </button>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
              Loading...
            </p>
          </motion.div>
        ) : trainingSession ? (
          <motion.div
            key="mood-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <h1
              className={`text-2xl md:text-3xl font-bold text-center mb-2 ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              How was "{trainingSession.title}" training?
            </h1>
            <p
              className={`text-center mb-8 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Tap your mood below
            </p>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {moods.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelection(mood)}
                  disabled={isLoading}
                  className={`group flex flex-col items-center justify-center w-full aspect-square rounded-xl shadow-md transition-all ${
                    selectedMood?.value === mood.value
                      ? darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-100"
                      : "bg-white text-gray-800"
                  } ${
                    isLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  aria-label={mood.label}
                >
                  {mood.animatedEmoji ? (
                    <div>
                      <img
                        src={mood.animatedEmoji}
                        className="w-20 h-20"
                        alt={mood.label}
                      />
                    </div>
                  ) : (
                    <span className="text-4xl">{mood.emoji}</span>
                  )}

                  <span
                    className={`text-sm mt-1 group-hover:font-bold ${
                      mood.label === "Happy" && "group-hover:text-amber-400"
                    } ${
                      mood.label === "Neutral" && "group-hover:text-green-400"
                    } ${mood.label === "Sad" && "group-hover:text-blue-300"}`}
                  >
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 flex items-center flex-col cursor-pointer">
        <Link
          to="/coach"
          className=" bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
          aria-label="Go to admin or coach page "
        >
          <iframe
            src="https://lottie.host/embed/167016d9-2e0a-418d-8957-a208056e2594/LSrUb4B7hE.lottie"
            className="w-14 h-14"
          ></iframe>
        </Link>
        <p className="text-xs font-bold">Coach</p>
      </div>
    </div>
  );
};

export default MoodBoard;
