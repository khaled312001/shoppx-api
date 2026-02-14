import { UserRepository } from "../User/user.repository";
import { IUser } from "../User/user.schema";
import { signJwt } from "../../../utils/jwt";

export const createUserAndToken = async (
  connectionFrom: string,
  userData: Partial<IUser>
) => {
  const userRepository = new UserRepository(connectionFrom);
  const newUser = await userRepository.addUser({
    ...userData,
    status: "active",
  });

  const token = signJwt({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    tenant_names: newUser.tenant_names,
    status: newUser.status,
  });

  return { token, user: newUser };
};
