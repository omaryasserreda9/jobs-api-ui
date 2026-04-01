const jwt = require("jsonwebtoken");

const requireWebUser = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, name: payload.name };
    return next();
  } catch (_err) {
    res.clearCookie("token", { path: "/" });
    return res.redirect("/login");
  }
};

module.exports = requireWebUser;
