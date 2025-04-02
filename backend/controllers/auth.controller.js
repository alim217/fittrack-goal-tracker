const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');

// --- Environment Variable Checks ---
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default expiry if not set

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  // In a real production scenario, you might have a more robust config validation startup phase.
  // Exiting here prevents the app from running in an insecure state.
  process.exit(1);
}

// --- Helper Function for Token Generation ---

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param {mongoose.Types.ObjectId | string} userId - The ID of the user to include in the token payload.
 * @returns {string} The generated JWT string.
 * @throws {Error} If JWT signing fails.
 */
const generateToken = (userId) => {
  try {
    const payload = { userId };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return token;
  } catch (error) {
    // Log the specific JWT signing error for debugging
    console.error('JWT Signing Error:', error);
    // Throw a more generic error upstream
    throw new Error('Failed to generate authentication token.');
  }
};

// --- Controller Functions ---

/**
 * Handles user registration. Creates a new user if the email is unique,
 * hashes the password, and returns a JWT upon successful registration.
 * Passes errors to the global error handler via next().
 *
 * @param {import('express').Request} req - The Express request object, expecting { email, password } in body.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Input Validation (Basic Presence Check)
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      return next(error);
    }

    // Convert email to lowercase consistently for checks and storage
    const lowerCaseEmail = email.toLowerCase();

    // 2. Check Existing User
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      const error = new Error('Email already in use.');
      error.statusCode = 409; // 409 Conflict
      return next(error);
    }

    // 3. Create User (Password hashing handled by Mongoose pre-save hook)
    // Mongoose model validation (email format, password length) will run here
    const newUser = await User.create({
        email: lowerCaseEmail, // Store lowercase email
        password: password,
     });

    // 4. Generate JWT
    // We need the user ID to generate the token. Mongoose provides _id after creation.
    const token = generateToken(newUser._id);

    // 5. Send Response
    res.status(201).json({ token });

  } catch (error) {
    // Handle potential Mongoose validation errors specifically if needed
    if (error.name === 'ValidationError') {
        // Extract a more user-friendly message from Mongoose validation errors
        const messages = Object.values(error.errors).map(el => el.message);
        const validationError = new Error(`Validation Failed: ${messages.join(', ')}`);
        validationError.statusCode = 400;
        return next(validationError);
    }
    // Pass any other errors (e.g., DB connection issues, bcrypt errors from hook)
    // to the global error handler in server.js
    next(error);
  }
};

/**
 * Handles user login. Finds the user by email, verifies the password,
 * and returns a JWT upon successful authentication.
 * Passes errors to the global error handler via next().
 *
 * @param {import('express').Request} req - The Express request object, expecting { email, password } in body.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Input Validation (Basic Presence Check)
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      return next(error);
    }

     // Convert email to lowercase consistently for lookup
    const lowerCaseEmail = email.toLowerCase();

    // 2. Find User by Email
    // IMPORTANT: Explicitly select the password field as it's excluded by default in the schema
    const user = await User.findOne({ email: lowerCaseEmail }).select('+password');

    // 3. Verify User Existence
    if (!user) {
      // Use a generic error message to avoid revealing if an email is registered
      const error = new Error('Invalid credentials.');
      error.statusCode = 401; // 401 Unauthorized
      return next(error);
    }

    // 4. Compare Password using the model's instance method
    const isMatch = await user.comparePassword(password);

    // 5. Verify Password Match
    if (!isMatch) {
      // Use the same generic error message
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      return next(error);
    }

    // 6. Generate JWT
    const token = generateToken(user._id);

    // 7. Send Response
    res.status(200).json({ token });

  } catch (error) {
    // Pass any errors (DB issues, bcrypt compare errors)
    // to the global error handler in server.js
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};