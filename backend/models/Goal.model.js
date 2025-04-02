const mongoose = require('mongoose');

/**
 * @typedef {import('mongoose').SchemaDefinition} SchemaDefinition
 * @typedef {import('mongoose').SchemaOptions} SchemaOptions
 * @typedef {import('mongoose').Model<GoalDocument>} GoalModel
 * @typedef {import('mongoose').Types.ObjectId} ObjectId
 * @typedef {import('mongoose').Document & GoalSchemaFields} GoalDocument
 */

/**
 * @typedef {object} GoalSchemaFields
 * @property {ObjectId} userId - Reference to the User who owns this goal.
 * @property {string} title - The main title or name of the fitness goal.
 * @property {string} [description] - A detailed description of the goal (optional).
 * @property {'active' | 'completed'} status - The current status of the goal.
 * @property {Date} [targetDate] - An optional target date for achieving the goal.
 * @property {Date} createdAt - Timestamp of document creation.
 * @property {Date} updatedAt - Timestamp of last document update.
 */

/**
 * Mongoose schema definition for the Goal model.
 * Defines the structure, types, validation, and indexes for goal documents.
 * @type {SchemaDefinition<GoalSchemaFields>}
 */
const goalSchemaDefinition = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Essential link to the User model
    required: [true, 'User reference is required for a goal'],
    index: true, // Optimize queries filtering goals by user
  },
  title: {
    type: String,
    required: [true, 'Goal title cannot be empty'],
    trim: true, // Remove extraneous whitespace
    maxlength: [150, 'Goal title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Goal description cannot exceed 500 characters'],
    // Not required
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['active', 'completed'],
      message: '{VALUE} is not a supported goal status. Please use \'active\' or \'completed\'.', // User-friendly enum validation message
    },
    default: 'active', // Default status for new goals
  },
  targetDate: {
    type: Date,
    // Not required
    // Consider adding validation to ensure targetDate is in the future if set
  },
};

/**
 * Mongoose schema options.
 * Enables automatic management of 'createdAt' and 'updatedAt' fields.
 * @type {SchemaOptions}
 */
const goalSchemaOptions = {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
};

/**
 * Mongoose Schema for Goals.
 * Represents the structure of documents in the 'goals' collection.
 * @type {mongoose.Schema<GoalDocument, GoalModel>}
 */
const goalSchema = new mongoose.Schema(goalSchemaDefinition, goalSchemaOptions);

// No middleware or instance methods defined for Goal model in this MVP phase.

/**
 * Goal Model compiled from the goalSchema.
 * Represents the 'goals' collection in MongoDB.
 * Provides an interface for CRUD operations on goal documents.
 * @type {GoalModel}
 */
const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;