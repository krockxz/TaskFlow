/**
 * HTTP status code constants.
 * Centralizes HTTP status codes to eliminate magic numbers in API routes.
 */

export const HTTP_STATUS = {
  /** 200 OK - Request succeeded */
  OK: 200,
  /** 201 Created - Resource created successfully */
  CREATED: 201,
  /** 400 Bad Request - Invalid request data */
  BAD_REQUEST: 400,
  /** 401 Unauthorized - Authentication required */
  UNAUTHORIZED: 401,
  /** 403 Forbidden - Insufficient permissions */
  FORBIDDEN: 403,
  /** 404 Not Found - Resource not found */
  NOT_FOUND: 404,
  /** 500 Internal Server Error - Server error occurred */
  INTERNAL_SERVER_ERROR: 500,
} as const;
