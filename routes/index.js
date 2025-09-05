var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const departmentController = require('../controllers/departmentController');
const attendanceController = require('../controllers/attendanceController');
const projectController = require('../controllers/projectController');
const payrollController = require('../controllers/payrollController');
const { protectAdmin } = require('../middleware/authMiddleware');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Employee Management System - Admin' });
});

// Admin register and login
router.post('/admin/register', authController.adminRegister);
router.post('/admin/login', authController.adminLogin);

// Departments routes
router.get('/admin/departments', protectAdmin, departmentController.getDepartments);
router.post('/admin/departments', protectAdmin, departmentController.createDepartment);
router.put('/admin/departments/:id', protectAdmin, departmentController.updateDepartment);
router.delete('/admin/departments/:id', protectAdmin, departmentController.deleteDepartment);

// Employees routes
router.get('/admin/employees', protectAdmin, adminController.getEmployees);
router.post('/admin/employees', protectAdmin, adminController.createEmployee);
router.put('/admin/employees/:id', protectAdmin, adminController.updateEmployee);
router.delete('/admin/employees/:id', protectAdmin, adminController.deleteEmployee);

// Attendance routes (Admin)
router.get('/admin/attendance', protectAdmin, attendanceController.list);
router.post('/admin/attendance/checkin', protectAdmin, attendanceController.checkIn);
router.post('/admin/attendance/checkout', protectAdmin, attendanceController.checkOut);
router.post('/admin/attendance/upsert', protectAdmin, attendanceController.upsert);

// Projects routes (Admin)
router.get('/admin/projects', protectAdmin, projectController.getProjects);
router.post('/admin/projects', protectAdmin, projectController.createProject);
router.get('/admin/projects/:id', protectAdmin, projectController.getProjectById);
router.put('/admin/projects/:id', protectAdmin, projectController.updateProject);
router.delete('/admin/projects/:id', protectAdmin, projectController.deleteProject);
router.patch('/admin/projects/:id/status', protectAdmin, projectController.updateProjectStatus);
router.patch('/admin/projects/:id/progress', protectAdmin, projectController.updateProjectProgress);

// Payroll routes
router.use('/admin/payrolls', require('./payroll'));

// Leave routes
router.use('/admin/leaves', require('./leaves'));
module.exports = router;