1. Add null checks before accessing user properties in the resetPassword function.
2. Ensure the reset token validation properly returns a valid user object or throws an appropriate error.
3. Validate the reset token exists and is valid before proceeding with password reset.
4. Return a 401 Unauthorized or 400 Bad Request response if the user is not found or token is invalid.