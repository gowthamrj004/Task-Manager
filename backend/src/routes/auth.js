import express from "express";
import { 
  registerUserAccount, 
  authenticateUser, 
  terminateUserSession, 
  getCurrentUserProfile 
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { wrapAsync } from "../middleware/errorHandling.js";

const router = express.Router();

router.post("/register", wrapAsync(registerUserAccount));
router.post("/login", wrapAsync(authenticateUser));
router.post("/logout", authenticate, terminateUserSession);
router.get("/me", authenticate, wrapAsync(getCurrentUserProfile));

export default router;
