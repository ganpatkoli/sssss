const Loyalty = require('../models/Loyalty');
const User = require('../models/User');

exports.awardPoints = async (userId, value, type, note = '') => {
  let loyalty = await Loyalty.findOne({ userId });
  if (!loyalty) loyalty = new Loyalty({ userId, points: 0, history: [] });
  loyalty.points += value;
  loyalty.history.push({ type, value, note });
  await loyalty.save();
  return loyalty.points;
};


// New user signup with optional referral code
exports.handleReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;
  const referrer = await Loyalty.findOne({ referralCode });
  if (referrer) {
    // Give points to both (referrer and new user)
    await exports.awardPoints(referrer.userId, 50, 'referral', 'Invited new user');
    await exports.awardPoints(newUserId, 25, 'referral', 'Registered via referral');
  }
};



// New user signup with optional referral code
exports.handleReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;
  const referrer = await Loyalty.findOne({ referralCode });
  if (referrer) {
    // Give points to both (referrer and new user)
    await exports.awardPoints(referrer.userId, 50, 'referral', 'Invited new user');
    await exports.awardPoints(newUserId, 25, 'referral', 'Registered via referral');
  }
};



exports.getMyLoyalty = async (req, res) => {
  try {
    const loyalty = await Loyalty.findOne({ userId: req.user.id });
    res.json(loyalty || { points: 0, history: [], referralCode: null });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

exports.redeemPoints = async (req, res) => {
  try {
    const { value } = req.body; // e.g. 100 points per coupon
    let loyalty = await Loyalty.findOne({ userId: req.user.id });
    if (!loyalty || loyalty.points < value)
      return res.status(400).json({ message: "Insufficient loyalty points" });
    loyalty.points -= value;
    loyalty.history.push({ type: 'redeem', value: -value, note: 'Points redeemed' });
    await loyalty.save();
    // Apply discount to next booking logic goes here
    res.json({ message: 'Points redeemed', remaining: loyalty.points });
  } catch (err) {
    res.status(500).json({ message: 'Redemption failed', error: err.message });
  }
};
