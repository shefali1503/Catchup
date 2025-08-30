import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "catchup-app" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      let username = email_addresses[0].email_address.split('@')[0];
      let userExists = await User.findOne({ username });
      if (userExists) username += Math.floor(Math.random() * 10000);

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: [first_name, last_name].filter(Boolean).join(" "),
        profile_picture: image_url,
        username
      };

      await User.create(userData);
      return { status: "success", user: userData };
    } catch (err) {
      console.error("Error creating user:", err);
      return { status: "error", message: err.message };
    }
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const updateUserData = {
        email: email_addresses[0].email_address,
        full_name: [first_name, last_name].filter(Boolean).join(" "),
        profile_picture: image_url
      };

      await User.findByIdAndUpdate(id, updateUserData, { new: true });
      return { status: "success", userId: id };
    } catch (err) {
      console.error("Error updating user:", err);
      return { status: "error", message: err.message };
    }
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      return { status: "deleted", userId: id };
    } catch (err) {
      console.error("Error deleting user:", err);
      return { status: "error", message: err.message };
    }
  }
);

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
