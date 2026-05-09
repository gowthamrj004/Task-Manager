import prisma from '../utils/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { 
  ValidationError, 
  ResourceNotFoundError,
  ApplicationError 
} from '../utils/errors.js';

/**
 * Authentication Service
 * Handles user account lifecycle: registration, authentication, and session management.
 * Separation of concerns allows this logic to be reused across different endpoints/contexts.
 */

class AuthenticationService {
  /**
   * Register a new user account
   * Validates email uniqueness, hashes password, and returns JWT token
   */
  async registerNewUser({ emailAddress, rawPassword, fullName }) {
    // Guard clause: check for email duplication before processing
    const existingMember = await prisma.user.findUnique({
      where: { email: emailAddress },
    });

    if (existingMember) {
      throw new ValidationError('This email address is already registered');
    }

    // Hash password before storage - security best practice
    const encryptedPassword = await hashPassword(rawPassword);

    const createdUser = await prisma.user.create({
      data: {
        email: emailAddress,
        password: encryptedPassword,
        fullName: fullName,
        role: 'MEMBER', // Default role for new users
      },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true,
        createdAt: true 
      },
    });

    // Generate session token immediately after creation
    const sessionToken = generateToken(createdUser.id);

    return { 
      accountData: createdUser, 
      accessToken: sessionToken 
    };
  }

  /**
   * Authenticate user with email and password
   * Returns user data and JWT token if credentials are valid
   */
  async authenticateUserByCredentials({ emailAddress, rawPassword }) {
    // Guard clause: require email to exist before checking password
    const existingMember = await prisma.user.findUnique({
      where: { email: emailAddress },
    });

    if (!existingMember) {
      // Intentionally vague error message for security (doesn't reveal if email exists)
      throw new ValidationError('Invalid email or password');
    }

    // Verify the provided password matches stored hash
    const isPasswordCorrect = await comparePassword(
      rawPassword, 
      existingMember.password
    );

    if (!isPasswordCorrect) {
      throw new ValidationError('Invalid email or password');
    }

    // Generate fresh token for this login session
    const sessionToken = generateToken(existingMember.id);

    const { password: _, ...userWithoutPassword } = existingMember;
    return { 
      accountData: userWithoutPassword, 
      accessToken: sessionToken 
    };
  }

  /**
   * Retrieve current authenticated user's profile
   */
  async getCurrentUserProfile(userId) {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true,
        createdAt: true,
        updatedAt: true
      },
    });

    if (!userProfile) {
      throw new ResourceNotFoundError('User', userId);
    }

    return userProfile;
  }
}

export default new AuthenticationService();
