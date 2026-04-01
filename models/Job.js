const mongoose = require("mongoose");
const User = require("./User");

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide a company"],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide a position"],
      maxlength: 100,
    },
    jobLocation: {
      type: String,
      required: [true, "Please provide a job location"],
    },
    roleDescription: {
      type: String,
      required: [true, "Please provide a role description"],
    },
    roleRequirements: {
      type: String,
      required: [true, "Please provide a role requirements"],
    },
    salary: {
      type: Number,
      required: [true, "Please provide a salary"],
    },
    status: {
      type: String,
      enum: ["interview", "pending", "declined"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, " please provide a user"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", JobSchema);
