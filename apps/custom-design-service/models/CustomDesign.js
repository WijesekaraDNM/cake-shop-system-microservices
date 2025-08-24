const { model, Schema } = require('mongoose');

const CustomDesignSchema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    occasion: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    flavor: { 
      type: String, 
      required: true,
      enum: ['vanilla', 'chocolate', 'red-velvet', 'fruit', 'cheesecake', 'carrot'],
      default: 'vanilla'
    },
    size: { 
      type: String, 
      required: true,
      enum: ['small', 'medium', 'large', 'x-large'],
      default: 'medium'
    },
    colorScheme: { 
      type: String,
      trim: true,
      maxlength: 200
    },
    deliveryDate: { 
      type: Date, 
      required: true,
      validate: {
        validator: function(date) {
          return date > new Date();
        },
        message: 'Delivery date must be in the future'
      }
    },
    budget: { 
      type: String, 
      required: true,
      enum: ['5000-10000', '10000-20000', '20000-30000', '30000+']
    },
    specialRequests: { 
      type: String,
      maxlength: 1000
    },
    referenceImageUrl: { 
      type: String
    },
    price: { 
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      maxlength: 500
    },
    estimatedPrice: {
      type: Number,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CustomDesignSchema.index({ userId: 1, createdAt: -1 });
CustomDesignSchema.index({ status: 1 });
CustomDesignSchema.index({ deliveryDate: 1 });

// Virtual for days until delivery
CustomDesignSchema.virtual('daysUntilDelivery').get(function() {
  const now = new Date();
  const delivery = new Date(this.deliveryDate);
  const diffTime = delivery - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Transform JSON output
CustomDesignSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
  virtuals: true
});

// Pre-save middleware
CustomDesignSchema.pre('save', function(next) {
  // Auto-calculate estimated price based on size and budget if not set
  if (!this.estimatedPrice) {
    const sizeMultipliers = {
      'small': 0.7,
      'medium': 1.0,
      'large': 1.5,
      'x-large': 2.0
    };
    
    const budgetRanges = {
      '5000-10000': 7500,
      '10000-20000': 15000,
      '20000-30000': 25000,
      '30000+': 35000
    };
    
    const basePrice = budgetRanges[this.budget] || 10000;
    this.estimatedPrice = Math.round(basePrice * sizeMultipliers[this.size]);
  }
  next();
});

// Static methods
CustomDesignSchema.statics.getByUserId = function(userId, options = {}) {
  const query = { userId, isActive: true };
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

CustomDesignSchema.statics.getByStatus = function(status, options = {}) {
  return this.find({ status, isActive: true })
    .populate('userId', 'name email phone')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Instance methods
CustomDesignSchema.methods.updateStatus = function(newStatus, adminNotes = '') {
  this.status = newStatus;
  if (adminNotes) {
    this.adminNotes = adminNotes;
  }
  return this.save();
};

CustomDesignSchema.methods.isEditable = function() {
  return ['pending', 'reviewing'].includes(this.status);
};

const CustomDesignModel = model('CustomDesign', CustomDesignSchema);

module.exports = CustomDesignModel;