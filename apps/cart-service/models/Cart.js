const { model, Schema } = require('mongoose');

const CartItemSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Food', 
    required: false 
  },  // For regular cake item
  customDesignId: { 
    type: Schema.Types.ObjectId, 
    ref: 'CustomDesign', 
    required: false 
  },  // For custom design
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1,
    min: 1
  },
  imageUrl: { 
    type: String 
  }, // Food or Custom design image URL
}, {
  _id: true // Ensure each cart item has an _id
});

const CartSchema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: false 
    }, // For logged-in users
    sessionId: { 
      type: String, 
      required: false 
    }, // For guest users
    items: [CartItemSchema],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Ensure at least one identifier exists
CartSchema.pre('validate', function() {
  if (!this.userId && !this.sessionId) {
    this.invalidate('userId', 'Either userId or sessionId must be provided');
  }
});

// Virtual for total price
CartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for item count
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Index for better performance
CartSchema.index({ userId: 1 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ userId: 1, sessionId: 1 });

const CartModel = model('Cart', CartSchema);
module.exports = CartModel;