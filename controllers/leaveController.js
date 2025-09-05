const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee'); // Import Employee model

// Get all leave requests
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name email') // Populate employee details
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaves', error });
  }
};


// Create a new leave request
exports.createLeave = async (req, res) => {
  try {
    const { employee, type, from, to, days } = req.body;

    // Validate employee ID
    if (!mongoose.Types.ObjectId.isValid(employee)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }

    // Check if employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Calculate days if not provided
    const startDate = new Date(from);
    const endDate = new Date(to);
    const calculatedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee, // Now an ObjectId
      type,
      from,
      to,
      days: days || calculatedDays,
      status: 'Pending',
    });

    await leave.save();
    const populatedLeave = await Leave.findById(leave._id).populate('employee', 'name email');
    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(400).json({ message: 'Error creating leave', error });
  }
};

// Update leave status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('employee', 'name email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ message: 'Error updating leave', error });
  }
};

// Delete leave request
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.status(200).json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting leave', error });
  }
};