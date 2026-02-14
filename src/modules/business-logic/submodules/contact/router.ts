import { Router } from "express";
import { handleContact } from "./handler";
const cors = require('cors');
const corsOptions = {
    origin: "https://www.mossodor.com", // Replace with your frontend's URL
   //  origin: "http://localhost:3000/", // Replace with your frontend's URL
    methods: 'POST',
    allowedHeaders: 'Content-Type, x-connection-key',
  };
  

export const concactRouter = Router();
concactRouter.use(cors(corsOptions));
concactRouter.post("/", handleContact);
// concactRouter.get("/visitors", handleGetVisitors);
