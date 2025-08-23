
import { model, Schema } from 'mongoose';

export const userSchema = new Schema(
    {
        name: { type:String, required: true },
        email: { type:String, required: true, unique: true},
        password: {type:String, required:true },
        address: { type:String, required: true },
        isAdmin: { type:Boolean, default:false },
        cart: { type: Schema.Types.ObjectId, ref: 'Cart' },      // optional
    },
    {
        timestamps: true,
        toJSON: {
            virtuals:true,
        },
        toObject: {
            virtuals: true,
        },
    },
);

export const userModel = model('user', userSchema);