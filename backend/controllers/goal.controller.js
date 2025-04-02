const mongoose = require('mongoose');
const Goal = require('../models/Goal.model.js');
const Progress = require('../models/Progress.model.js');

/**
 * Utility function to check if a string is a valid MongoDB ObjectId.
 * @param {string} id - The ID string to validate.
 * @returns {boolean} True if the ID is a valid ObjectId, false otherwise.
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Handles Mongoose ValidationErrors by creating a formatted error object.
 * @param {Error & { errors: Record<string, { message: string }>}} validationError - The Mongoose ValidationError.
 * @returns {Error & { statusCode: number }} A formatted error object with statusCode 400.
 */
const handleValidationError = (validationError) => {
    const messages = Object.values(validationError.errors).map(el => el.message);
    const formattedError = new Error(`Validation Failed: ${messages.join(', ')}`);
    formattedError.statusCode = 400;
    return formattedError;
};

/**
 * Creates a new fitness goal for the authenticated user.
 * @param {import('express').Request} req - Express request object. Expected body: { title, description?, status?, targetDate? }
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const createGoal = async (req, res, next) => {
    const { title, description, status, targetDate } = req.body;
    const userId = req.user.id; // Assumed to be attached by auth middleware

    try {
        // Basic validation
        if (!title) {
            const error = new Error('Goal title is required.');
            error.statusCode = 400;
            return next(error);
        }

        // Construct goal data, only including fields provided in the request
        const goalData = {
            userId,
            title,
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            ...(targetDate !== undefined && { targetDate }),
        };

        const newGoal = await Goal.create(goalData);

        res.status(201).json({ goal: newGoal });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(handleValidationError(error));
        }
        // Pass other errors (DB connection, unexpected) to global handler
        next(error);
    }
};

/**
 * Retrieves all fitness goals for the authenticated user.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const getGoals = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const userGoals = await Goal.find({ userId }).sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({ goals: userGoals });

    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a specific fitness goal by its ID, ensuring it belongs to the authenticated user.
 * @param {import('express').Request} req - Express request object. Expected param: { id }
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const getGoalById = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            const error = new Error('Invalid Goal ID format.');
            error.statusCode = 400;
            return next(error);
        }

        const foundGoal = await Goal.findOne({ _id: id, userId });

        if (!foundGoal) {
            // Treat non-existent and non-owned goals the same (404)
            const error = new Error('Goal not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({ goal: foundGoal });

    } catch (error) {
        next(error);
    }
};

/**
 * Updates a specific fitness goal by its ID, ensuring it belongs to the authenticated user.
 * @param {import('express').Request} req - Express request object. Expected param: { id }, Expected body: { title?, description?, status?, targetDate? }
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const updateGoal = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status, targetDate } = req.body;

    try {
        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            const error = new Error('Invalid Goal ID format.');
            error.statusCode = 400;
            return next(error);
        }

        // Construct update object with only the fields provided
        const updateData = {};
        if (title !== undefined) {
            // If title is provided, ensure it's not empty after potential trimming
            if (typeof title === 'string' && title.trim() === '') {
                const error = new Error('Goal title cannot be empty.');
                error.statusCode = 400;
                return next(error);
            }
            updateData.title = title;
        }
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (targetDate !== undefined) updateData.targetDate = targetDate;

        // Ensure there's something to update
        if (Object.keys(updateData).length === 0) {
             const error = new Error('No update fields provided.');
             error.statusCode = 400;
             return next(error);
        }

        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: id, userId }, // Filter: Must match ID and belong to user
            { $set: updateData }, // Update operation
            { new: true, runValidators: true } // Options: return updated doc, run schema validators
        );

        if (!updatedGoal) {
            // Goal not found or doesn't belong to the user
            const error = new Error('Goal not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({ goal: updatedGoal });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(handleValidationError(error));
        }
        next(error);
    }
};

/**
 * Deletes a specific fitness goal by its ID and all associated progress logs,
 * ensuring the goal belongs to the authenticated user.
 * @param {import('express').Request} req - Express request object. Expected param: { id }
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const deleteGoal = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Validate ObjectId format
        if (!isValidObjectId(id)) {
            const error = new Error('Invalid Goal ID format.');
            error.statusCode = 400;
            return next(error);
        }

        // 1. Find and delete the goal owned by the user
        const deletedGoal = await Goal.findOneAndDelete({ _id: id, userId });

        if (!deletedGoal) {
            // Goal not found or doesn't belong to the user
            const error = new Error('Goal not found.');
            error.statusCode = 404;
            return next(error);
        }

        // 2. If goal deletion was successful, delete associated progress logs
        // Ensure we only delete progress logs belonging to the same user for safety, though goalId should suffice
        await Progress.deleteMany({ goalId: id, userId });

        // Respond with 204 No Content upon successful deletion
        res.status(204).send();

    } catch (error) {
        // Handle potential errors during Progress.deleteMany as well
        next(error);
    }
};

/**
 * Logs a progress entry for a specific goal, verifying goal ownership first.
 * @param {import('express').Request} req - Express request object. Expected param: { goalId }, Expected body: { date?, notes?, value? }
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const logProgress = async (req, res, next) => {
    const { goalId } = req.params;
    const userId = req.user.id;
    const { date, notes, value } = req.body;

    try {
        // Validate ObjectId format for goalId
        if (!isValidObjectId(goalId)) {
            const error = new Error('Invalid Goal ID format.');
            error.statusCode = 400;
            return next(error);
        }

        // 1. Verify the target goal exists and belongs to the user
        const targetGoal = await Goal.findOne({ _id: goalId, userId });
        if (!targetGoal) {
            const error = new Error('Target goal not found.');
            error.statusCode = 404;
            return next(error);
        }

        // 2. Construct progress data
        const progressData = {
            userId,
            goalId,
            ...(date !== undefined && { date }), // Model has default for date if not provided
            ...(notes !== undefined && { notes }),
            ...(value !== undefined && { value }),
        };

        // 3. Create the progress log
        const newProgressLog = await Progress.create(progressData);

        res.status(201).json({ progress: newProgressLog });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(handleValidationError(error));
        }
        next(error);
    }
};

/**
 * Retrieves all progress log entries for a specific goal, verifying goal ownership first.
 * @param {import('express').Request} req - Express request object. Expected param: { goalId }
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const getGoalProgress = async (req, res, next) => {
    const { goalId } = req.params;
    const userId = req.user.id;

    try {
        // Validate ObjectId format for goalId
        if (!isValidObjectId(goalId)) {
            const error = new Error('Invalid Goal ID format.');
            error.statusCode = 400;
            return next(error);
        }

        // 1. Verify the target goal exists and belongs to the user (prevents leaking progress data)
        const targetGoal = await Goal.findOne({ _id: goalId, userId });
        if (!targetGoal) {
            const error = new Error('Target goal not found.');
            error.statusCode = 404;
            return next(error);
        }

        // 2. Fetch progress logs for that goal and user
        const goalProgressEntries = await Progress.find({ goalId, userId }).sort({ date: -1, createdAt: -1 }); // Sort by logged date desc, then creation desc

        res.status(200).json({ progressLogs: goalProgressEntries });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal,
    logProgress,
    getGoalProgress,
};