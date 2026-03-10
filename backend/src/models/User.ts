import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends mongoose.Document {
    email: string;
    password: string;
    role: 'staff' | 'admin';
    mfaSecret?: string;
    mfaEnabled: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: 'staff', enum: ['staff', 'admin'] },
        mfaSecret: { type: String, required: false },
        mfaEnabled: { type: Boolean, default: false }
    }, 
    { timestamps: true }
);

// Hash password before saving (only when password is new or modified)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Helper: check password (for login)
UserSchema.methods.comparePassword = function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
