const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequestError } = require("../errors");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  const { name, password, email } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  const tempUser = { name, email, password: hashPassword };
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide a name, email, password");
  }
  const user = await User.create({ ...tempUser });
  res.status(StatusCodes.CREATED).json({ user });
};
const login = async (req, res) => {
  res.send("Login User");
};

module.exports = {
  register,
  login,
};
