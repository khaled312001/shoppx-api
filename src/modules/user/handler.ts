import { Response } from "express";
import { UserRepository } from "./User/user.repository";
import { checkStatusAndRole } from "./helper";
import { signJwt } from "../../utils/jwt";
import { Server as SocketIOServer, Socket } from "socket.io";

// createing user accounts is managed in the auth module
export const handleGetUserFromRequest = async (req: any, res: Response) => {
  try {
    const userRepository = new UserRepository(req.connectionKey);
    const user = await userRepository.findUser(req.user._id, "profile");
    const token = signJwt(user);

    return res.status(200).json({ user, token });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
export const handleGetAllUsersProfiles = async (req: any, res: Response) => {
  try {
    const { page, pageSize } = req.query;
    const userRepository = new UserRepository(req.connectionKey);
    const { totalCount, users } = await userRepository.findAcitveUsersProfiles(
      Number(page),
      Number(pageSize)
    );
    return res.status(200).json({ count: totalCount, users });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};
export const handleGetSingleUserProfile = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    const userRepository = new UserRepository(req.connectionKey);
    const user = await userRepository.findUser(user_id, "profile");
    return res.status(200).json({ user });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};
export const handleGetSingleUserAccount = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    const userRepository = new UserRepository(req.connectionKey);
    const user = await userRepository.findUser(user_id, "account");
    return res.status(200).json({ user });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};
export const handleDeleteUserAccount = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    const userRepository = new UserRepository(req.connectionKey);
    const result = await userRepository.deleteUser(user_id);
    if (!result.deletedCount) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User account deleted" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};

export const handleSoftDeleteUserAccount = async (req: any, res: Response) => {
  try {
    const { user_id } = req.params;
    const userRepository = new UserRepository(req.connectionKey);

    const user = await userRepository.findUser(user_id, "account");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRepository.updateUserAccount({
      _id: user_id,
      status: "deleted",
    });
    return res.status(200).json({ message: "User account deleted." });
  } catch (e: any) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
};
export const handleUpdateUserAccount = async (req: any, res: Response) => {
  try {
    const { body, connectionKey } = req;
    const { user_id } = req.params;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: "User data is required" });
    }

    if (!user_id) return res.status(400).json({ error: "user id is a must" });

    const { status, role, ...updateFields } = body;

    if (status !== undefined || role !== undefined) {
      return res.status(400).json({ error: "Cannot update status or role" });
    }

    const userRepository = new UserRepository(connectionKey);
    const user = await userRepository.updateUserAccount({
      ...updateFields,
      _id: user_id,
    });

    if (user) {
      const token = signJwt(user);
      return res.status(200).json({ user, token });
    }

    return res.status(404).json({ error: "User not found" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};

// only use this from the super dashboard
export const handleUpdateUserAuthorization = async (
  req: any,
  res: Response
) => {
  try {
    const { user } = req.body;

    // Validate user input
    if (!user || !user._id) {
      return res.status(400).json({ error: "User ID and data are required" });
    }

    const { status, role } = user;

    // Validate status and role
    if (!checkStatusAndRole(status, role)) {
      return res
        .status(400)
        .json({ error: "Valid role and status are required" });
    }

    const userRepository = new UserRepository(req.connectionFrom);

    // Update the user document
    const result = await userRepository.updateUserAccount(user);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found or no changes made" });
    }

    // Fetch updated user data
    const updatedUser = await userRepository.findUser(
      req.params.user_id,
      "profile"
    );

    // Return updated user data
    return res.status(200).json({ userData: updatedUser });
  } catch (e: any) {
    console.error("Error updating user authorization:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetTenantAdmins = async (req: any, res: Response) => {
  try {
    const { tenantName } = req.params;
    // use the connection from because admins are in super database.
    const userRepository = new UserRepository(req.connectionFrom);
    const users = await userRepository.findTenantUsers(tenantName);

    return res.status(200).json({ users });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};

