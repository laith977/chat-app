import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const accessToken = useAuthStore.getState().accessToken;

      const res = await axiosInstance.get("/messages/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`, // from store
        },
      });
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    const accessToken = useAuthStore.getState().accessToken;

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // from store
        },
      });
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const accessToken = useAuthStore.getState().accessToken;

    const { selectedUser, messages } = get();

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // from store
          },
        }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const accessToken = useAuthStore.getState().accessToken;

    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const accessToken = useAuthStore.getState().accessToken;

    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
