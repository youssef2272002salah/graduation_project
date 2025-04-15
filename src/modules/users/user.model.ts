import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import crypto from 'crypto';

// Define TypeScript interface for the User document
export interface IUser extends Document {
  _id: string;
  fullname: string;
  email: string;
  password?: string;
  passwordConfirm?: string;
  photo?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  providerId?: string;
  provider?: 'google' | 'facebook';
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  cvs: string[];

  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

// Define Mongoose schema
const UserSchema = new Schema<IUser>(
  {
    providerId:{
      type: String,
      unique: true,
      sparse: true
    },
    provider:{
      type: String,
      enum: ['google', 'facebook'],
      sparse: true
    },
    fullname: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.provider; // Only required if not using Google/Facebook
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    cvs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CV',
      }
    ],
    verificationToken: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Index email for faster queries
// UserSchema.index({ email: 1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);  
  this.password = await bcrypt.hash(this.password as string, salt);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Method to compare passwords
UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to create a password reset token
UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Static method to find user by email
UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email }).select('+password');
  };

// Remove sensitive data before returning user object
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
  };
  
// Create and export User model
export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
