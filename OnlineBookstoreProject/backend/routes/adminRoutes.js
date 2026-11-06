import express from 'express';
import { getDashboardStats, getCustomers, getCustomerDetails, setCustomerActive, getSalesReport, getBestSellingBooks, getInventoryReport } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/customers', protect, adminOnly, getCustomers);
router.get('/customers/:id', protect, adminOnly, getCustomerDetails);
router.patch('/customers/:id/active', protect, adminOnly, setCustomerActive);
router.get('/reports/sales', protect, adminOnly, getSalesReport);
router.get('/reports/best-selling-books', protect, adminOnly, getBestSellingBooks);
router.get('/reports/inventory', protect, adminOnly, getInventoryReport);

export default router;
