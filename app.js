require("dotenv").config();
require("express-async-errors");

// Security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const path = require("path");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const AUTH_COOKIE_NAME = "token";
const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//connectDB
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");
const requireWebUser = require("./middleware/webAuth");
const User = require("./models/User");
const Job = require("./models/Job"); 
const { StatusCodes } = require("http-status-codes");

//routers

const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
const chatRoutes = require("./routes/chat");

function formatRegisterPageError(err) {
  if (err.name === "ValidationError") {
    return Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }
  if (err.code && err.code === 11000) {
    return `Duplicate value entered for ${Object.keys(err.keyValue)} field. Please enter another Value`;
  }
  return err.message || "Something went wrong try again later..";
}

function normalizeJobPayload(body) {
  const next = { ...body };
  if (next.salary !== undefined && next.salary !== "") {
    next.salary = Number(next.salary);
  }
  delete next.createdBy;
  return next;
}
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(xss());
// routes
app.get("/", (req, res) => {
  res.send("Jobs API is running 🚀");
});
app.get("/register", (req, res) => {
  res.render("register", {
    error: null,
    success: false,
    message: "",
    token: null,
    form: {},
  });
});
app.post("/register", async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body });
    const token = user.createToken();
    setAuthCookie(res, token);
    return res.redirect("/jobs");
  } catch (err) {
    if (err.name === "ValidationError" || (err.code && err.code === 11000)) {
      return res.status(StatusCodes.BAD_REQUEST).render("register", {
        error: formatRegisterPageError(err),
        success: false,
        message: "",
        token: null,
        form: {
          name: req.body.name || "",
          email: req.body.email || "",
          age: req.body.age || "",
          phone: req.body.phone || "",
        },
      });
    }
    return next(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    success: false,
    message: "",
    token: null,
    form: {},
  });
});

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render("login", {
      error: "Please provide an email and a password",
      success: false,
      message: "",
      token: null,
      form: { email: (req.body && req.body.email) || "" },
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).render("login", {
      error: "Invalid Credentials",
      success: false,
      message: "",
      token: null,
      form: { email: email || "" },
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.UNAUTHORIZED).render("login", {
      error: "Invalid Password",
      success: false,
      message: "",
      token: null,
      form: { email: email || "" },
    });
  }

  const token = user.createToken();
  setAuthCookie(res, token);
  return res.redirect("/jobs");
});

app.get("/logout", (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  res.redirect("/login");
});

app.get("/jobs", requireWebUser, async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
    return res.render("jobs", {
      jobs,
      user: req.user,
      error: null,
      addForm: {},
      addPanelOpen: false,
    });
  } catch (err) {
    return next(err);
  }
});

app.post("/jobs", requireWebUser, async (req, res, next) => {
  try {
    const body = normalizeJobPayload(req.body);
    body.createdBy = req.user.userId;
    await Job.create(body);
    return res.redirect("/jobs");
  } catch (err) {
    if (err.name === "ValidationError") {
      const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
      return res.status(StatusCodes.BAD_REQUEST).render("jobs", {
        jobs,
        user: req.user,
        error: formatRegisterPageError(err),
        addForm: {
          company: req.body.company || "",
          position: req.body.position || "",
          jobLocation: req.body.jobLocation || "",
          roleDescription: req.body.roleDescription || "",
          roleRequirements: req.body.roleRequirements || "",
          salary: req.body.salary || "",
          status: req.body.status || "pending",
        },
        addPanelOpen: true,
      });
    }
    return next(err);
  }
});

app.get("/jobs/:id/edit", requireWebUser, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });
    if (!job) {
      return res.redirect("/jobs");
    }
    return res.render("job-edit", { job, user: req.user, error: null });
  } catch (_err) {
    return res.redirect("/jobs");
  }
});

app.post("/jobs/:id/delete", requireWebUser, async (req, res) => {
  try {
    await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });
  } catch (_err) {
    /* invalid id */
  }
  return res.redirect("/jobs");
});

app.post("/jobs/:id", requireWebUser, async (req, res, next) => {
  try {
    const { company, position } = req.body;
    if (company === "" || position === "") {
      let job = await Job.findOne({
        _id: req.params.id,
        createdBy: req.user.userId,
      }).catch(() => null);
      if (!job) {
        return res.redirect("/jobs");
      }
      return res.status(StatusCodes.BAD_REQUEST).render("job-edit", {
        job,
        user: req.user,
        error: "Company field and position cannot be empty..",
      });
    }
    const update = normalizeJobPayload(req.body);
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      update,
      { new: true, runValidators: true },
    );
    if (!job) {
      return res.redirect("/jobs");
    }
    return res.redirect("/jobs");
  } catch (err) {
    if (err.name === "ValidationError") {
      let job = await Job.findOne({
        _id: req.params.id,
        createdBy: req.user.userId,
      }).catch(() => null);
      if (!job) {
        return res.redirect("/jobs");
      }
      return res.status(StatusCodes.BAD_REQUEST).render("job-edit", {
        job,
        user: req.user,
        error: formatRegisterPageError(err),
      });
    }
    return next(err);
  }
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);
app.use("/api/v1/chat", chatRoutes);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
