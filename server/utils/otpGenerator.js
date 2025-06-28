const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPExpiration = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
};

module.exports = { generateOTP, getOTPExpiration };