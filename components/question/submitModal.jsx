
const SubmitModal = ({ isOpen, onConfirm, onCancel }) => {

    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Submit Test?
          </h2>
  
          <p className="text-gray-600 text-center mt-2">
            Are you sure you want to submit your answers?
          </p>
  
          <div className="flex justify-between mt-6 gap-3">
            <button onClick={onCancel} className="w-1/2 py-2 rounded-lg border border-gray-400 text-gray-700">
              No
            </button>
  
            <button onClick={onConfirm} className="w-1/2 py-2 rounded-lg bg-blue-600 text-white" >
              Yes, Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default SubmitModal;
  