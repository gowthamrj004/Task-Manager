import { validateData, registerSchema, loginSchema } from "../utils/validation.js";
import authService from "../services/authService.js";

/**
 * User Registration Handler
 * Validates input, creates new user account, and issues JWT token
 */
export const registerUserAccount = async (req, res, next) => {
  try {
    // Schema validation with Zod ensures type safety
    const validatedInput = validateData(registerSchema, req.body);

    // Delegate business logic to service layer
    const { accountData, accessToken } = await authService.registerNewUser({
      emailAddress: validatedInput.email,
      rawPassword: validatedInput.password,
      fullName: validatedInput.fullName,   // Ensure this key exists in validatedInput
    });

    // Set HTTP-only cookie for automatic token transmission
    // This prevents XSS attacks by keeping token inaccessible to JavaScript
    res.cookie("sessionToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Return both cookie and token for client-side storage as fallback
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      accountData,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login Handler
 * Authenticates credentials and establishes session
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const validatedInput = validateData(loginSchema, req.body);

    // Service handles credential verification and token generation
    const { accountData, accessToken } = await authService.authenticateUserByCredentials({
      emailAddress: validatedInput.email,
      rawPassword: validatedInput.password,
    });

    res.cookie("sessionToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accountData,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout Handler
 * Invalidates session by clearing token
 */
export const terminateUserSession = (req, res) => {
  // Clear both possible token storage locations
  res.clearCookie("sessionToken", { path: "/" });
  res.clearCookie("token", { path: "/" });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Current User Profile Handler
 * Returns authenticated user's profile information
 */
export const getCurrentUserProfile = async (req, res, next) => {
  try {
    // User already attached to request by auth middleware
    // Only return non-sensitive fields
    const userProfile = {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      createdAt: req.user.createdAt,
    };

    return res.status(200).json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    next(error);
  }
};
