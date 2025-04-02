const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

/**
 * @typedef {import('mongoose').SchemaDefinition} SchemaDefinition
 * @typedef {import('mongoose').SchemaOptions} SchemaOptions
 * @typedef {import('mongoose').Model<UserDocument>} UserModel
 * @typedef {import('mongoose').Document & UserSchemaFields & UserSchemaMethods} UserDocument
 */

/**
 * @typedef {object} UserSchemaFields
 * @property {string} email - User's email address (unique identifier)
 * @property {string} password - User's hashed password
 * @property {Date} createdAt - Timestamp of document creation
 * @property {Date} updatedAt - Timestamp of last document update
 */

/**
 * @typedef {object} UserSchemaMethods
 * @property {(candidatePassword: string) => Promise<boolean>} comparePassword - Compares a candidate password against the stored hash.
 */

/**
 * Mongoose schema definition for the User model.
 * @type {SchemaDefinition<UserSchemaFields>}
 */
const userSchemaDefinition = {
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Creates a unique index in MongoDB
    lowercase: true, // Ensures email is stored in lowercase
    trim: true, // Removes leading/trailing whitespace
    match: [
      /^\S+@\S+\.\S+$/, // Simple regex for basic email format validation
      'Please provide a valid email address',
    ],
    // Consider adding more robust email validation if needed, potentially using a library
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Prevents password field from being returned in queries by default
  },
};

/**
 * Mongoose schema options.
 * Enables automatic creation of 'createdAt' and 'updatedAt' timestamps.
 * @type {SchemaOptions}
 */
const userSchemaOptions = {
  timestamps: true,
};

/**
 * Mongoose Schema for Users.
 * Includes schema definition, options, middleware, and instance methods.
 * @type {mongoose.Schema<UserDocument, UserModel, UserSchemaMethods>}
 */
const userSchema = new mongoose.Schema(userSchemaDefinition, userSchemaOptions);

/**
 * Mongoose pre-save middleware to hash the password before saving a user document.
 * Only runs if the password field has been modified.
 * Uses bcryptjs with a salt factor of 12.
 */
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt with a cost factor of 12
    const salt = await bcryptjs.genSalt(12);
    // Hash the password using the generated salt
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    // Pass any error occurred during hashing to the next middleware/error handler
    next(error);
  }
});

/**
 * Compares a candidate password with the user's stored hashed password.
 * @param {string} candidatePassword The plain text password to compare.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 * @this {UserDocument}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // 'this.password' refers to the hashed password stored in the document.
    // Note: Ensure the query fetching this user document explicitly selects the password field
    // as it's set to `select: false` in the schema.
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    // Log the error or handle it appropriately. Rethrowing or returning false might be options.
    console.error('Error comparing password:', error);
    // Depending on security policy, you might want to just return false
    // throw error; // Or rethrow the error to be handled upstream
    return false; // Safest approach might be to return false on error
  }
};

/**
 * User Model compiled from the userSchema.
 * Represents the 'users' collection in MongoDB.
 * Provides an interface for querying and manipulating user documents.
 * @type {UserModel}
 */
const User = mongoose.model('User', userSchema);

module.exports = User;