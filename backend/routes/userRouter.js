import express from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile, 
    updateUser, 
    deleteUser 
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected
router.post('/logout', authenticate, logoutUser);
router.get('/profile', authenticate, getUserProfile);
router.put('/update', authenticate, updateUser);
router.delete('/delete', authenticate, deleteUser);

export default router;
