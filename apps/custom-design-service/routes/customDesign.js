const express = require('express');
const router = express.Router();
const {
  createCustomDesign,
  getUserCustomDesigns,
  getCustomDesignById,
  updateCustomDesign,
  deleteCustomDesign,
  getAllCustomDesigns,
  updateDesignStatus,
  getDesignStatistics
} = require('../controllers/customDesignController');
const { auth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateCustomDesign, validateStatusUpdate } = require('../middleware/validation');

// Public routes (no authentication required)
// Health check is handled in server.js

// User routes (require authentication)
router.use(auth); // Apply authentication to all routes below this line

// Create a new custom design - Available to all authenticated users
router.post('/', 
  upload.single('referenceImage'), 
  validateCustomDesign,
  createCustomDesign
);

// Get user's custom designs - Available to all authenticated users
router.get('/my-designs', getUserCustomDesigns);

// Get specific custom design by ID - Available to all authenticated users (own designs only)
router.get('/:id', getCustomDesignById);

// Update custom design - Available to all authenticated users (own designs only)
router.put('/:id', 
  upload.single('referenceImage'),
  validateCustomDesign,
  updateCustomDesign
);

// Delete custom design - Available to all authenticated users (own designs only)
router.delete('/:id', deleteCustomDesign);

// Admin routes (require admin role) - Optional for advanced features
// Uncomment these if you need admin functionality later

// Get all custom designs (admin only)
// router.get('/admin/all', requireAdmin, getAllCustomDesigns);

// Update design status (admin only)
// router.patch('/admin/:id/status', 
//   requireAdmin,
//   validateStatusUpdate,
//   updateDesignStatus
// );

// Get design statistics (admin only)
// router.get('/admin/statistics', requireAdmin, getDesignStatistics);

module.exports = router;