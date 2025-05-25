// Controllers for user authentication
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../db/models/userModel');
const crypto = require('crypto');

// Generate an access JWT token (short duration)
const generateAccessToken = user => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Token valid for 15 minutes
  );
};

// Generate a refresh JWT token (long duration)
const generateRefreshToken = user => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );
};

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input data
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required',
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or email is already registered',
      });
    }

    // Create new user
    const newUser = await UserModel.create({
      id: uuidv4(),
      username,
      email,
      password, // Will be encrypted via pre-save middleware
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Save refresh token in database
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Set cookie with refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send successful response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error('❌ Error registering user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user',
      details: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input data
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    // Verify if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie with refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send successful response
    res.json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login',
      details: error.message,
    });
  }
};

// Verify current user token
const verifyToken = async (req, res) => {
  try {
    // Authentication middleware already verified the token
    // and added user information to req.user

    // Find updated user in database
    const user = await UserModel.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Successful response
    res.json({
      status: 'success',
      message: 'Valid token',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Error verifying token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying token',
      details: error.message,
    });
  }
};

// Generate a new access token using refresh token
const refreshAccessToken = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token not provided',
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
    }

    // Find user by ID and verify refresh token matches
    const user = await UserModel.findOne({
      id: decoded.id,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token revoked or user not found',
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // Send new access token
    res.json({
      status: 'success',
      message: 'Access token renewed',
      token: accessToken,
    });
  } catch (error) {
    console.error('❌ Error renewing token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error renewing access token',
      details: error.message,
    });
  }
};

// Logout - revoke refresh token
const logout = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find user by refresh token and remove it
      await UserModel.findOneAndUpdate({ refreshToken }, { refreshToken: null });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Error during logout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout',
      details: error.message,
    });
  }
};

// Function for password recovery - request link
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      // For security, we don't inform if the email exists or not
      return res.json({
        status: 'success',
        message: 'If the email exists, you will receive instructions to reset your password',
      });
    }

    // Generate token for password recovery
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the hashed token in the database
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    res.json({
      status: 'success',
      message: 'If the email exists, you will receive instructions to reset your password',
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    console.error('❌ Error requesting password recovery:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing the request',
      details: error.message,
    });
  }
};

// Function to reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Token and password are required',
      });
    }

    // Hash the token to compare with the stored one
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid and non-expired token
    const user = await UserModel.findOne({
      resetPasswordToken: hash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Update the password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
      details: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
