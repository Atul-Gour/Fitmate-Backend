import mongoose, { Schema } from "mongoose";

mongoose.set("strictQuery", true);
mongoose.Schema.Types.String.cast(false);

const UserDataSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  profileImage: String,
  height: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  address: {
    fullAddress: {
      type: String,
    },
    houseNo: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
      },
      lon: {
        type: Number,
      },
      mapLink: {
        type: String,
      },
    },
  },
  sports: {
    type: [String], 
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "At least one sport must be specified.",
    },
    required: true,
  },
  matchHistory: [
    {
      matchId: {
        type: Schema.Types.ObjectId,
        ref: "MatchData",
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
});

export const UserData = mongoose.model("UserData", UserDataSchema);
