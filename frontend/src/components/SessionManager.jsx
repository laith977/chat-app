import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

const SessionManager = ({ authUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const modalTimerRef = useRef(null);
  const autoEndTimerRef = useRef(null);

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { logout,accessToken } = useAuthStore();

  useEffect(() => {
    if (!authUser || sessionEnded) return;

    startSessionTimers();

    return () => clearTimers();
  }, [authUser, sessionEnded]);

  const startSessionTimers = () => {
    clearTimers();

    // Show modal after 30s
    modalTimerRef.current = setTimeout(() => {
      setShowModal(true);

      // Auto-end session if user does nothing after another 30s
      autoEndTimerRef.current = setTimeout(() => {
        if (!sessionEnded) {
          handleSessionEnd();
          toast("Session expired due to inactivity.", { icon: "⏳" });
        }
      }, 30 * 1000);
    }, 30 * 1000);
  };

  const clearTimers = () => {
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    if (autoEndTimerRef.current) clearTimeout(autoEndTimerRef.current);
  };

  const handleSessionExtend = async () => {
    setShowModal(false);

    try {
      const res = await fetch("http://localhost:5001/api/auth/refresh-token", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.accessToken) {
        setAccessToken(data.accessToken);
        toast.success("Session extended!");
        setSessionEnded(false);
        startSessionTimers(); // Restart timers
      } else {
        toast("Session expired, please log in again.", { icon: "⚠️" });
        handleSessionEnd();
      }
    } catch (err) {
      console.log("Error refreshing token:", err);
      toast.error("Could not extend session");
      handleSessionEnd();
    }
  };

  const handleSessionEnd = () => {
    setSessionEnded(true);
    setShowModal(false);
    clearTimers();
    logout();
  };

  return (
    <>
      {showModal && !sessionEnded && (
        <Modal
          onClose={() => setShowModal(false)}
          onExtend={handleSessionExtend}
          onEnd={handleSessionEnd}
        />
      )}
    </>
  );
};

export default SessionManager;
