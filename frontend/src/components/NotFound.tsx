import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col lg:flex-row items-center justify-center p-8 gap-12">
      <div className="w-full max-w-md lg:max-w-xl">
        <iframe src="https://lottie.host/embed/8c51b384-c87a-4c62-9644-e399e75c5e92/qVf6XRRvzu.lottie"></iframe>
      </div>

      <div className="text-center lg:text-left max-w-md">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Return Home
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>
            Still lost? Try our{" "}
            <a href="/search" className="text-indigo-600 hover:underline">
              search
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
