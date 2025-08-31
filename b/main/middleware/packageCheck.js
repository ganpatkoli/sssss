// middleware/packageCheck.js
module.exports = (req, res, next) => {
  const { packageId, packageValidTill } = req.user;
  if (!packageId || !packageValidTill || new Date() > packageValidTill) {
    return res.status(403).json({ message: "Your package is inactive or expired." });
  }
  next();
};
