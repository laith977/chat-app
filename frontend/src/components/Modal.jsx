// components/Modal.js
import React from "react";

const Modal = ({ onClose, onExtend, onEnd }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold">Your session is about to expire</h2>
        <p className="mt-2">Would you like to extend your session?</p>
        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={onExtend}
          >
            Extend Session
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md"
            onClick={onEnd}
          >
            End Session
          </button>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
