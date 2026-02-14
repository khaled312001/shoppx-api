import { NextFunction, Request, Response } from "express";

export const bindConnectionKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extracting the connection key from the headers
  const connectionKey = req.headers["x-connection-key"]; // connecion key decides which tenant database to connect to
  const connectionFrom =
    req.headers["x-connection-from"] == "super" ? "super" : connectionKey; // connecion key decides which tenant database to connect to

  if (!connectionKey) {
    return res.status(400).send("Bad Request.");
  }

  // @ts-ignore
  req.connectionKey = connectionKey;
  // @ts-ignore
  req.connectionFrom = connectionFrom;

  next();
};
