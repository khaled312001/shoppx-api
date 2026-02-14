import { verifyJwtToken } from "../utils/jwt";

export const verifyUser = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await verifyJwtToken(token);
    req.user = decodedToken; //  Attach the decoded token to req.user
    console.log(req.user._id);
    if (req.user.status !== "active") {
      throw new Error("Unauthorized");
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
