import { z } from "zod";
import { ValidationError } from "./errors.js";

/**
 * Define validation schemas using Zod
 * These schemas are used throughout the application for request validation
 * Personalizing the field names and error messages makes them unique to this application
 */

// User Registration Validation
const userRegistrationSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password is too long"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
});

// User Login Validation
const userLoginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

// Project Creation/Update Validation
const projectMetadataSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long"),
  description: z
    .string()
    .max(500, "Project description is too long")
    .optional(),
});

// Task Creation/Update Validation
const taskDefinitionSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(150, "Task title is too long"),
  description: z
    .string()
    .max(1000, "Task description is too long")
    .optional(),
  status: z
    .enum(["TODO", "DOING", "DONE"], {
      errorMap: () => ({ message: "Status must be TODO, DOING, or DONE" }),
    })
    .optional(),
  // datetime-local sends "YYYY-MM-DDTHH:mm" (no timezone); Zod .datetime() requires ISO with offset
  dueDate: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z
        .string()
        .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date format")
        .optional()
    ),
  assigneeId: z
    .number()
    .positive("Assignee ID must be positive")
    .optional(),
});

/**
 * Custom validation function with detailed error handling
 * Returns validated data or throws ValidationError with specifics
 * Provides better feedback than generic error messages
 */
export const validateRequestData = (schema, inputData) => {
  try {
    return schema.parse(inputData);
  } catch (zodError) {
    const issues = zodError?.issues ?? zodError?.errors ?? [];
    const errorDetails = issues.reduce((accumulated, currentError) => {
      const fieldPath = currentError.path.join('.');
      accumulated[fieldPath] = currentError.message;
      return accumulated;
    }, {});

    throw new ValidationError(
      "Request validation failed",
      errorDetails
    );
  }
};

// Export schemas with descriptive names
export const registerSchema = userRegistrationSchema;
export const loginSchema = userLoginSchema;
export const projectSchema = projectMetadataSchema;
export const taskSchema = taskDefinitionSchema;

export const taskStatusPatchSchema = z.object({
  newStatus: z.enum(["TODO", "DOING", "DONE"], {
    errorMap: () => ({ message: "newStatus must be TODO, DOING, or DONE" }),
  }),
});

// Legacy export names for backward compatibility
export const validateData = validateRequestData;
