import { model,Schema } from 'mongoose';


export const foodSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageData: { type: Buffer, required: false },
    category: { type: String },
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
    },
    {
        toJSON: {
            virtuals:true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

export const foodModel = model('new_food', foodSchema);
