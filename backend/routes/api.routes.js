const express = require('express');
const { registerUser, loginUser } = require('../controllers/auth.controller.js');
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  logProgress,
  getGoalProgress,
} = require('../controllers/goal.controller.js');
// Assuming auth.middleware.js exports the middleware function as 'protect' as per instructions
const { protect } = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- Authentication Routes (Public) ---
// POST /api/auth/register
router.post('/auth/register', registerUser);

// POST /api/auth/login
router.post('/auth/login', loginUser);

// --- Goal Routes (Protected) ---
// Apply the 'protect' middleware to all subsequent routes in this chain related to goals

// POST /api/goals - Create a new goal
router.post('/goals', protect, createGoal);

// GET /api/goals - Get all goals for the authenticated user
router.get('/goals', protect, getGoals);

// GET /api/goals/:id - Get a specific goal by ID
router.get('/goals/:id', protect, getGoalById);

// PUT /api/goals/:id - Update a specific goal by ID
router.put('/goals/:id', protect, updateGoal);

// DELETE /api/goals/:id - Delete a specific goal by ID
router.delete('/goals/:id', protect, deleteGoal);


// --- Progress Routes (Protected - Nested under Goals) ---
// Apply the 'protect' middleware to all subsequent routes in this chain related to progress

// POST /api/goals/:goalId/progress - Log progress for a specific goal
router.post('/goals/:goalId/progress', protect, logProgress);

// GET /api/goals/:goalId/progress - Get all progress logs for a specific goal
router.get('/goals/:goalId/progress', protect, getGoalProgress);

// Export the router instance to be mounted in server.js
module.exports = router;