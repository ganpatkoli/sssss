const Package = require("../models/Package");
const User = require("../models/User");
const { generateInvoicePDF } = require("../scripts/invoiceGenerator");
const nodemailer = require("nodemailer");

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const { name, price, durationDays, features } = req.body;

    if (!name || !price || !durationDays) {
      return res
        .status(400)
        .json({ message: "Name, price and durationDays are required" });
    }

    const pkg = new Package({ name, price, durationDays, features });
    await pkg.save();

    res
      .status(201)
      .json({ message: "Package created successfully", package: pkg });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Package creation failed", error: err.message });
  }
};

// Edit/Update a package
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package updated successfully", package: pkg });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Package update failed", error: err.message });
  }
};

// Deactivate (soft delete) a package
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package deactivated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Package deactivation failed", error: err.message });
  }
};

exports.listPackages = async (req, res) => {
  try {
    // Find active packages sorted by createdAt descending (latest first)
    const packages = await Package.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch packages. Please try again later.",
      error: error.message,
    });
  }
};

// Assign package to user (admin or superadmin action)
exports.assignPackage = async (req, res) => {
  try {
    const { userId, packageId } = req.body;

    if (!userId || !packageId) {
      return res
        .status(400)
        .json({ message: "UserId and packageId are required" });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ message: "Package not found or inactive" });
    }

    const validTill = new Date();
    validTill.setDate(validTill.getDate() + pkg.durationDays);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Expire all previously active package histories which validity is over
    if (user.packageHistory && user.packageHistory.length > 0) {
      user.packageHistory = user.packageHistory.map((entry) => {
        const isExpired =
          entry.status === "active" && entry.validTill <= new Date();
        return {
          ...entry.toObject(),
          status: isExpired ? "expired" : entry.status,
        };
      });
    }

    user.packageId = pkg._id;
    user.packageValidTill = validTill;

    // Add new package assignment in history
    user.packageHistory.push({
      package: pkg._id,
      features: pkg.features,
      name: pkg.name,
      assignedAt: new Date(),
      validTill,
      assignedBy: req.user._id, // Make sure req.user is set with auth middleware
      price: pkg.price,
      status: "active",
    });

    await user.save();

    res.json({
      message: "Package assigned successfully and history updated",
      package: pkg,
      validTill,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to assign package", error: err.message });
  }
};

// Get package assignment history for a user
exports.getUserPackageHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("packageHistory.package", "name price durationDays")
      .populate("packageHistory.assignedBy", "name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.packageHistory);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch package history", error: err.message });
  }
};

// Send invoice PDF after package assignment
exports.sendPackageInvoice = async (req, res) => {
  try {
    const { userId, historyEntryId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find particular package history entry
    const packageHistoryEntry = user.packageHistory.id(historyEntryId);
    if (!packageHistoryEntry) {
      return res
        .status(404)
        .json({ message: "Package history entry not found" });
    }

    // Fetch package details
    const packageDetails = await Package.findById(packageHistoryEntry.package);
    if (!packageDetails) {
      return res.status(404).json({ message: "Package details not found" });
    }

    // Generate PDF buffer using your custom script
    const pdfBuffer = await generateInvoicePDF(
      user,
      packageHistoryEntry,
      packageDetails
    );

    // Setup nodemailer transport - make sure EMAIL_USER and EMAIL_PASS are in .env
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with invoice PDF attachment
    await transporter.sendMail({
      from: '"Travel Platform" <no-reply@yourdomain.com>',
      to: user.email,
      subject: "Your Package Purchase Invoice",
      text: "Please find attached your invoice for the recent package purchase.",
      attachments: [
        {
          filename: `Invoice_${packageDetails.name}_${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.json({ message: "Invoice sent successfully." });
  } catch (error) {
    console.error("Send invoice error:", error);
    res
      .status(500)
      .json({ message: "Error sending invoice", error: error.message });
  }
};
