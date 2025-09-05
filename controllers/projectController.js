const Project = require('../models/Project');
const Employee = require('../models/Employee');

exports.createProject = async (req, res) => {
  try {
    const {
      name,
      client,
      startDate,
      deadline,
      team,
      progress,
      status,
      description,
      budget,
      priority,
    } = req.body;

    // Validate required fields
    if (!name || !client || !startDate || !deadline || !team || team.length === 0) {
      return res.status(400).json({ message: 'Name, client, start date, deadline, and team are required' });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(deadline)) {
      return res.status(400).json({ message: 'Deadline must be after start date' });
    }

    // Validate team members exist
    const teamMembers = await Employee.find({ _id: { $in: team } });
    if (teamMembers.length !== team.length) {
      return res.status(400).json({ message: 'Some team members not found' });
    }

    const project = new Project({
      name,
      client,
      startDate,
      deadline,
      team,
      progress: progress || 0,
      status: status || 'Not Started',
      description,
      budget,
      priority: priority || 'Medium',
    });

    await project.save();

    // Populate team details for response
    await project.populate('team', 'name email department');

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status && status !== 'All Projects') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('team', 'name email department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Project.countDocuments(query),
    ]);

    res.json({
      projects,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('team', 'name email department role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate dates if both are provided
    if (updateData.startDate && updateData.deadline) {
      if (new Date(updateData.startDate) >= new Date(updateData.deadline)) {
        return res.status(400).json({ message: 'Deadline must be after start date' });
      }
    }

    // Validate team members if team is updated
    if (updateData.team && updateData.team.length > 0) {
      const teamMembers = await Employee.find({ _id: { $in: updateData.team } });
      if (teamMembers.length !== updateData.team.length) {
        return res.status(400).json({ message: 'Some team members not found' });
      }
    }

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('team', 'name email department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('team', 'name email department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project status updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ message: 'Server error while updating project status' });
  }
};

exports.updateProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { progress },
      { new: true, runValidators: true }
    ).populate('team', 'name email department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project progress updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update project progress error:', error);
    res.status(500).json({ message: 'Server error while updating project progress' });
  }
};
