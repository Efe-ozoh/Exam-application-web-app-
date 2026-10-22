import Link from "next/link";


const ScoreModal = ({
    open,
    onClose,
    result,
    saveError,
  }) => {
    
  
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
  
        {/* Modal */}
        <div className="relative z-10 bg-white w-[90%] max-w-md rounded-2xl p-6 md:p-8 shadow-xl animate-scaleIn">
          
          {/* Progress Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-pulse"></div>
              <div className="h-32 w-32 rounded-full border-4 border-blue-600 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-blue-700">
                  {result.percentage}%
                </span>
              </div>
            </div>
          </div>
  
          {/* Details */}
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 text-center">
            Your Score
          </h1>
  
          <p className="text-gray-600 text-sm md:text-base text-center">
            Your Estimated scored is <span className="font-semibold text-blue-600">{result.score}</span>
          </p>

          {saveError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {saveError}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition"
            >
              See Corrections
            </button>
  
            <button
              className="flex-1 py-3 rounded-xl border border-gray-400 text-gray-700 text-lg font-semibold hover:bg-gray-100 transition"
            >
              <Link href="/exam_option">
              Try Again
              </Link>

            </button>
          </div>
        </div>
      </div>
    );
  };


  export default ScoreModal;
  