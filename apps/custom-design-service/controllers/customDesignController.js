const CustomDesign = require('../models/CustomDesign');
const { success, error } = require('../utils/responseHelper');
const fs = require('fs').promises;
const path = require('path');

// Create a new custom design request
const createCustomDesign = async (req, res) => {
  try {
    const designData = {
      ...req.body,
      userId: req.user.id, // Assuming user ID comes from auth middleware
    };

    // Handle reference image if uploaded
    if (req.file) {
      designData.referenceImageUrl = `/uploads/reference-images/${req.file.filename}`;
    }

    const customDesign = new CustomDesign(designData);
    await customDesign.save();

    // TODO: Send notification to admin about new design request
    // await sendNotificationToAdmin(customDesign);

    return success(res, customDesign, 'Custom design request created successfully', 201);
  } catch (err) {
    // Clean up uploaded file if design creation fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    return error(res, err.message, 400);
  }
};

// Get all custom designs for a user
const getUserCustomDesigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id, isActive: true };
    if (status) {
      query.status = status;
    }

    const customDesigns = await CustomDesign.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CustomDesign.countDocuments(query);

    return success(res, {
      designs: customDesigns,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Custom designs retrieved successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// Get a specific custom design by ID
const getCustomDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const customDesign = await CustomDesign.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!customDesign) {
      return error(res, 'Custom design not found', 404);
    }

    return success(res, customDesign, 'Custom design retrieved successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// Update a custom design (only if status allows)
const updateCustomDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customDesign = await CustomDesign.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!customDesign) {
      return error(res, 'Custom design not found', 404);
    }

    // Allow users to edit their designs if status is pending or reviewing
    if (!customDesign.isEditable()) {
      return error(res, `Design cannot be edited when status is '${customDesign.status}'. You can only edit designs that are pending or under review.`, 400);
    }

    // Handle new reference image
    if (req.file) {
      // Delete old image if exists
      if (customDesign.referenceImageUrl) {
        const oldImagePath = path.join(__dirname, '..', customDesign.referenceImageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (unlinkError) {
          console.error('Error deleting old image:', unlinkError);
        }
      }
      updateData.referenceImageUrl = `/uploads/reference-images/${req.file.filename}`;
    }

    // Update the design
    Object.assign(customDesign, updateData);
    await customDesign.save();

    return success(res, customDesign, 'Custom design updated successfully');
  } catch (err) {
    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    return error(res, err.message);
  }
};

// Delete (soft delete) a custom design
const deleteCustomDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const customDesign = await CustomDesign.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!customDesign) {
      return error(res, 'Custom design not found', 404);
    }

    // Allow users to delete their designs if status is pending or reviewing
    if (!customDesign.isEditable()) {
      return error(res, `Design cannot be deleted when status is '${customDesign.status}'. You can only delete designs that are pending or under review.`, 400);
    }

    customDesign.isActive = false;
    await customDesign.save();

    return success(res, null, 'Custom design deleted successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// ADMIN ENDPOINTS

// Get all custom designs (admin only)
const getAllCustomDesigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const customDesigns = await CustomDesign.find(query)
      .populate('userId', 'name email phone')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CustomDesign.countDocuments(query);

    return success(res, {
      designs: customDesigns,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }, 'All custom designs retrieved successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// Update design status (admin only)
const updateDesignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedPrice } = req.body;

    const customDesign = await CustomDesign.findById(id);
    if (!customDesign) {
      return error(res, 'Custom design not found', 404);
    }

    customDesign.status = status;
    if (adminNotes) customDesign.adminNotes = adminNotes;
    if (estimatedPrice) customDesign.estimatedPrice = estimatedPrice;

    await customDesign.save();

    // TODO: Send notification to user about status update
    // await sendStatusUpdateNotification(customDesign);

    return success(res, customDesign, 'Design status updated successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// Get design statistics (admin only)
const getDesignStatistics = async (req, res) => {
  try {
    const stats = await CustomDesign.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averagePrice: { $avg: '$estimatedPrice' }
        }
      }
    ]);

    const totalDesigns = await CustomDesign.countDocuments({ isActive: true });
    const recentDesigns = await CustomDesign.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    return success(res, {
      totalDesigns,
      recentDesigns,
      statusBreakdown: stats
    }, 'Design statistics retrieved successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  createCustomDesign,
  getUserCustomDesigns,
  getCustomDesignById,
  updateCustomDesign,
  deleteCustomDesign,
  getAllCustomDesigns,
  updateDesignStatus,
  getDesignStatistics
};