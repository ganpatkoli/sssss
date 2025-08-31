const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    knowpassword: String,
    phone: {
      type: String,
      unique: true, // अगर लॉगिन या सतत संपर्क चाहिए तो
      required: true, // अपनी आवश्यकता अनुसार
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    packageValidTill: Date,
    verified: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    preferredLanguage: { type: String, default: "en" },
    kyc: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      idProofUrl: String, // S3/Firebase/cloud upload link
      addressProofUrl: String,
      licenseUrl: String,
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      adminNote: String, // Why approved/rejected
    },

    packageHistory: [
      {
        package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
        features: [String],
        name: { type: String },
        assignedAt: Date, // When assigned/activated
        validTill: Date,
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: admin/superadmin who assigned
        price: Number, // What price paid
        packagestatus: {
          type: String,
          enum: ["active", "expired", "cancelled"],
          default: "active",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    twitterId: { type: String, unique: true, sparse: true },
    socialProfile: {
      photoUrl: String,
      locale: String,
      gender: String,
    },
    region: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
