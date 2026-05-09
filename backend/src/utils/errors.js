/**
 * Custom Application Error Class
 * Enables consistent error handling with HTTP status codes and error tracking.
 * This allows us to distinguish application errors from unexpected runtime errors.
 */
export class ApplicationError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validation Error - for when incoming data doesn't meet schema requirements
 */
export class ValidationError extends ApplicationError {
  constructor(message, validationDetails = {}) {
    super(message, 400, 'VALIDATION_FAILED');
    this.validationDetails = validationDetails;
  }
}

/**
 * Authorization Error - for when user lacks required permissions
 */
export class AuthorizationError extends ApplicationError {
  constructor(message = 'Insufficient permissions for this action') {
    super(message, 403, 'UNAUTHORIZED_ACCESS');
  }
}

/**
 * Resource Not Found Error - for when requested entity doesn't exist
 */
export class ResourceNotFoundError extends ApplicationError {
  constructor(resourceType = 'Resource', resourceId = null) {
    const message = resourceId 
      ? `${resourceType} with ID ${resourceId} not found` 
      : `${resourceType} not found`;
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}
