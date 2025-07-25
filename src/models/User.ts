import mongoose from 'mongoose';

export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  address: {
     type: String,
    required: false,
  },
  phone: String,
  age: Number,
  role: {
    type: String,
    enum: UserType,
    default: 'user',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
