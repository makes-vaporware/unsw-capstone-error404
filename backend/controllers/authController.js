const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: 'Unauthorized' });

  const accessToken = createAccessToken(foundUser);

  const refreshToken = createRefreshToken(foundUser);

  // Create secure cookie with refresh token
  res.cookie('jwt', refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: 'None', // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match refresh token
  });

  res.json({ accessToken, id: foundUser._id });
};

// @desc Register
// @route POST /auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, university, password } = req.body;

  // confirm data
  if (!name || !email || !university || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check for duplicate email
  const duplicate = await User.findOne({ email })
    .collation({ locale: 'en', strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate email' });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  // if ()
  const isSiteAdmin = !(await User.find().exec()).length;
  const userObject = {
    name,
    email,
    university,
    password: hashedPwd,
    isSiteAdmin,
  };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: true, // https
      sameSite: 'None', // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match refresh token
    });

    res
      .status(201)
      .json({ message: `New user ${name} created`, accessToken, id: user._id }); //returns
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });

      const foundUser = await User.findOne({ _id: decoded._id }).exec();

      if (!foundUser) return res.status(401).json({ message: 'Unauthorized' });

      const accessToken = createAccessToken(foundUser);

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.json({ message: 'Cookie cleared' });
};

// === Helper Functions ===
// Access tokens are temporary credentials for gaining access to protected resources
const createAccessToken = (foundUser) => {
  return jwt.sign(
    {
      UserInfo: {
        _id: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

// Refresh tokens last longer and are used to obtain new access tokens
const createRefreshToken = (foundUser) => {
  return jwt.sign({ _id: foundUser._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = {
  login,
  register,
  refresh,
  logout,
};
