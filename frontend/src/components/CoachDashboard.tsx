import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import * as FingerprintJS from "@fingerprintjs/fingerprintjs";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "../utils/BaseUrl";

interface TrainingSession {
  id: string;
  training_title: string;
  happy_count: number;
  sad_count: number;
  neutral_count: number;
  has_interacted: boolean;
  user_mood: string | null;
}

interface ApiError {
  error?: string;
}

const CoachDashboard = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  // Initialize fingerprint
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (err) {
        console.error("Error getting fingerprint:", err);
        toast.error("Failed to initialize user identification");
        setError("Failed to initialize user identification");
      }
    };
    getFingerprint();
  }, []);

  const fetchSessions = useCallback(async () => {
    if (!fingerprint) return;

    try {
      setLoading(true);
      const response = await axios.get<TrainingSession[]>(
        `${BASE_URL}/get_training_mood.php`,
        { params: { user: fingerprint } }
      );
      setSessions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast.error("Failed to load training sessions");
      setError("Failed to load training sessions");
    } finally {
      setLoading(false);
    }
  }, [fingerprint]);

  // Fetch sessions initially and every 60 seconds
  useEffect(() => {
    if (!fingerprint) return;

    fetchSessions();
    const interval = setInterval(fetchSessions, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fingerprint, fetchSessions]);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post<{ id: string }>(
        `${BASE_URL}/post_training.php`,
        { title: newSessionTitle }
      );

      const newSession: TrainingSession = {
        id: response.data.id,
        training_title: newSessionTitle,
        happy_count: 0,
        sad_count: 0,
        neutral_count: 0,
        has_interacted: false,
        user_mood: null,
      };

      setSessions((prev) => [newSession, ...prev]);
      setNewSessionTitle("");
      setShowModal(false);
      toast.success("Training Session Created");
      setPostError(null);
      setError(null);
    } catch (err) {
      const errorMessage = axios.isAxiosError<ApiError>(err)
        ? err.response?.data?.error || "Error creating session"
        : "Error creating session";

      console.error("Error creating session:", errorMessage);
      toast.error(errorMessage);
      setPostError(errorMessage);
      setError("Failed to create new session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this session?"
    );
    if (!confirm) return;

    setDeletingId(id);

    try {
      const deleteData = await axios.delete(`${BASE_URL}/delete_section.php`, {
        data: { id },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (deleteData.data.success) {
        setSessions((prev) => prev.filter((session) => session.id !== id));
        setError(null);
        toast.success("Session deleted successfully");
      } else {
        setError(null);
        toast.error(deleteData.data.message);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      setError("Failed to delete session");
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  const getMoodEmoji = (mood: string | null) => {
    switch (mood) {
      case "happy":
        return "😃";
      case "sad":
        return "😞";
      case "neutral":
        return "😐";
      default:
        return null;
    }
  };

  const renderSessionCard = (session: TrainingSession) => (
    <motion.div
      key={session.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        session.has_interacted ? "border-l-4 border-blue-500" : ""
      }`}
    >
      <button
        onClick={() => handleDeleteSession(session.id)}
        disabled={deletingId === session.id}
        className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 transition-colors"
        aria-label="Delete session"
      >
        {deletingId === session.id ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
        ) : (
          <FiTrash2 className="text-lg" />
        )}
      </button>
      <div className="p-5 pt-10">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {session.training_title}
          </h2>
          {session.has_interacted && session.user_mood && (
            <span className="text-2xl">{getMoodEmoji(session.user_mood)}</span>
          )}
        </div>

        {session.has_interacted && (
          <div className="mb-3">
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full ${
                session.user_mood === "happy"
                  ? "bg-green-100 text-green-800"
                  : session.user_mood === "sad"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              You reacted: {session.user_mood}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          {[
            {
              emoji: "😃",
              count: session.happy_count,
              color: "text-green-600",
            },
            {
              emoji: "😐",
              count: session.neutral_count,
              color: "text-yellow-600",
            },
            { emoji: "😞", count: session.sad_count, color: "text-blue-600" },
          ].map((item) => (
            <div key={item.emoji} className="flex flex-col items-center">
              <span className="text-2xl">{item.emoji}</span>
              <span className={`font-medium ${item.color}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen w-screen bg-gray-50 flex p-4 pb-20 relative">
      <Toaster />
      <div className="w-full h-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Training Sessions
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {!fingerprint ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center h-full flex gap-5 items-center justify-center flex-col py-10 text-gray-500">
            <embed
              src="https://lottie.host/embed/0a630515-b19c-423f-b87f-0869d36d1e8b/opvrWzw3Fg.lottie"
              className="w-[400px] h-auto"
            />
            <p>No training sessions found. Create your first one!</p>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 cursor-pointer rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <FiPlus className="text-xl" />
              Create Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(renderSessionCard)}
          </div>
        )}
      </div>

      {/* Sticky Create Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        aria-label="Create new session"
      >
        <FiPlus className="text-xl" />
      </button>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Create New Training Session
                </h2>

                <div className="mb-4">
                  <label
                    htmlFor="sessionTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Session Title
                  </label>
                  <input
                    type="text"
                    id="sessionTitle"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      postError
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={newSessionTitle}
                    onChange={(e) => {
                      setNewSessionTitle(e.target.value);
                      setPostError(null);
                    }}
                    placeholder="E.g. Pre-match warmup"
                  />
                  {postError && (
                    <p className="text-red-400 italic">{postError}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSession}
                    disabled={!newSessionTitle.trim() || isSubmitting}
                    className={`px-4 py-2 text-white rounded-md transition-colors ${
                      !newSessionTitle.trim() || isSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting ? "Creating..." : "Create Session"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachDashboard;
