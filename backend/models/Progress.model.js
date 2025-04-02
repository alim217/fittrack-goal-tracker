const mongoose = require('mongoose');

/**
 * @typedef {import('mongoose').SchemaDefinition} SchemaDefinition
 * @typedef {import('mongoose').SchemaOptions} SchemaOptions
 * @typedef {import('mongoose').Model<ProgressDocument>} ProgressModel
 * @typedef {import('mongoose').Types.ObjectId} ObjectId
 * @typedef {import('mongoose').Document & ProgressSchemaFields} ProgressDocument
 */

/**
 * @typedef {object} ProgressSchemaFields
 * @property {ObjectId} goalId - Reference to the Goal this progress entry belongs to.
 * @property {ObjectId} userId - Reference to the User who owns this progress entry.
 * @property {Date} date - The date the progress was logged.
 * @property {string} [notes] - Optional descriptive notes about the progress.
 * @property {number} [value] - Optional simple numerical metric for the progress (MVP).
 * @property {Date} createdAt - Timestamp of document creation.
 * @property {Date} updatedAt - Timestamp of last document update.
 */

/**
 * Mongoose schema definition for the Progress model.
 * Defines the structure, types, validation, and indexes for progress log documents.
 * @type {SchemaDefinition<ProgressSchemaFields>}
 */
const progressSchemaDefinition = {
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal', // Link to the Goal model
    required: [true, 'Goal reference (goalId) is required for a progress entry'],
    index: true, // Optimize queries filtering progress by goal
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Link to the User model
    required: [true, 'User reference (userId) is required for a progress entry'],
    index: true, // Optimize queries filtering progress by user
  },
  date: {
    type: Date,
    required: [true, 'Progress entry date cannot be empty'],
    default: Date.now, // Default to the current date and time
  },
  notes: {
    type: String,
    trim: true, // Remove leading/trailing whitespace
    maxlength: [500, 'Progress notes cannot exceed 500 characters'],
    required: false, // Explicitly optional
  },
  value: {
    type: Number,
    required: false, // Explicitly optional for MVP
    // Represents a simple numerical metric. Could be expanded (e.g., object) later.
  },
};

/**
 * Mongoose schema options.
 * Enables automatic management of 'createdAt' and 'updatedAt' fields.
 * @type {SchemaOptions}
 */
const progressSchemaOptions = {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
};

/**
 * Mongoose Schema for Progress entries.
 * Represents the structure of documents in the 'progresses' collection.
 * (Note: Mongoose automatically pluralizes 'Progress' to 'progresses' for the collection name)
 * @type {mongoose.Schema<ProgressDocument, ProgressModel>}
 */
const progressSchema = new mongoose.Schema(progressSchemaDefinition, progressSchemaOptions);

// No custom instance methods or middleware are required for the Progress model in this MVP phase.

/**
 * Progress Model compiled from the progressSchema.
 * Represents the 'progresses' collection in MongoDB.
 * Provides an interface for CRUD operations on progress documents.
 * @type {ProgressModel}
 */
const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;