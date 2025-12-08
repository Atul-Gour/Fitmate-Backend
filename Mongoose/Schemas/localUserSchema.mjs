import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.Schema.Types.String.cast(false); 

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required:true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

export const User = mongoose.model("User", userSchema);
