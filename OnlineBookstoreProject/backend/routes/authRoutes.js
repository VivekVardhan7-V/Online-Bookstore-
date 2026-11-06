import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.post('/logout', (req, res) => res.json({ message: 'Logged out successfully' }));

export default router;
