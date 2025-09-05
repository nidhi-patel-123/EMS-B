const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Project = require("../models/Project");
const Payroll = require("../models/Payroll");
const bcrypt = require("bcryptjs");

// Get employee profile
exports.getProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id)
      .select("-password")
      .populate("department");
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Update employee profile
exports.updateProfile = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("department");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Get employee attendance
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employee: req.user._id })
      .sort({ attendanceDate: -1 })
      .limit(30); // Limit to last 30 days for performance
    res.json(
      attendance.map((record) => ({
        id: record._id,
        date: record.attendanceDate.toISOString().slice(0, 10),
        checkIn: record.checkIn ? record.checkIn.toISOString() : null,
        checkOut: record.checkOut ? record.checkOut.toISOString() : null,
        workingMinutes: record.workingMinutes,
        status: record.status,
      }))
    );
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching attendance", error: err.message });
  }
};

// Check-in
exports.checkIn = async (req, res) => {
  try {
    const today = new Date().setUTCHours(0, 0, 0, 0);
    let record = await Attendance.findOne({
      employee: req.user._id,
      attendanceDate: new Date(today),
    });
    if (record && record.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }
    if (!record) {
      record = new Attendance({
        employee: req.user._id,
        attendanceDate: new Date(today),
      });
    }
    record.checkIn = new Date();
    await record.save();
    res.json({
      id: record._id,
      date: record.attendanceDate.toISOString().slice(0, 10),
      checkIn: record.checkIn.toISOString(),
      checkOut: record.checkOut ? record.checkOut.toISOString() : null,
      workingMinutes: record.workingMinutes,
      status: record.status,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error during check-in", error: err.message });
  }
};

// Check-out
exports.checkOut = async (req, res) => {
  try {
    const today = new Date().setUTCHours(0, 0, 0, 0);
    let record = await Attendance.findOne({
      employee: req.user._id,
      attendanceDate: new Date(today),
    });
    if (!record || !record.checkIn) {
      return res.status(400).json({ message: "Check-in required first" });
    }
    if (record.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }
    record.checkOut = new Date();
    await record.save();
    res.json({
      id: record._id,
      date: record.attendanceDate.toISOString().slice(0, 10),
      checkIn: record.checkIn.toISOString(),
      checkOut: record.checkOut.toISOString(),
      workingMinutes: record.workingMinutes,
      status: record.status,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error during check-out", error: err.message });
  }
};

// Get employee leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({
      from: -1,
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const leave = new Leave({
      ...req.body,
      employee: req.user._id,
      status: "Pending",
    });
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: "Error applying for leave", error: err });
  }
};

// Get employee projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ team: req.user._id }).populate("team");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// Get employee payrolls
exports.getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.user._id }).sort({
      month: -1,
    });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payrolls" });
  }
};

// Change employee password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }
    const employee = await Employee.findById(req.user._id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    employee.password = newPassword;
    await employee.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
};
