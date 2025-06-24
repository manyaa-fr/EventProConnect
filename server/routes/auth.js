// File: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth'); 

// Make sure ALL handlers are properly imported functions
router.post('/register', register); // ← Error likely here if register isn't a function
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;