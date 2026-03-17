const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  res.status(StatusCodes.CREATED).json({ user });
};
const login = async (req, res) => {
  res.send("Login User");
};

module.exports = {
  register,
  login,
};
