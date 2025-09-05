// routes/employee.js
var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController');
const { protectEmployee } = require('../middleware/authMiddleware');
const employeeController = require('../controllers/employeeController');

// Employee login route
router.post('/login', authController.employeeLogin);

// Profile routes
router.get('/profile', protectEmployee, employeeController.getProfile);
router.put('/profile', protectEmployee, employeeController.updateProfile);

// Attendance routes
router.get('/attendance', protectEmployee, employeeController.getAttendance);
router.post('/attendance/checkin', protectEmployee, employeeController.checkIn);
router.post('/attendance/checkout', protectEmployee, employeeController.checkOut);

// Leave routes
router.get('/leaves', protectEmployee, employeeController.getLeaves);
router.post('/leaves', protectEmployee, employeeController.applyLeave);

// Projects routes
router.get('/projects', protectEmployee, employeeController.getProjects);

// Payroll routes
router.get('/payrolls', protectEmployee, employeeController.getPayrolls);

// Change password
router.put('/change-password', protectEmployee, employeeController.changePassword);

// Example protected employee route: Dashboard
router.get('/dashboard', protectEmployee, (req, res) => {
  res.status(200).json({
    message: 'Welcome to employee dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
    },
  });
});

// Add more employee routes here as needed

module.exports = router;