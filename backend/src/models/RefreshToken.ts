import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
    {
        jti: { type: String, required: true, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

RefreshTokenSchema.index({ jti: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: remove expired

export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
