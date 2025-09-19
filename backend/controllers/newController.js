const User = require('../model/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};

// Add new user (with duplicate email/phone check)
const addUser = async (req, res) => {
  const { userName, userPhone, userGmail, userPassword, UserAgree } = req.body;

  try {
    // ✅ Check for existing email OR phone number
    const existingUser = await User.findOne({
      $or: [{ userGmail }, { userPhone }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or phone number already exists.'
      });
    }

    // ✅ Create new user
    const user = new User({
      userName,
      userPhone,
      userGmail,
      userPassword,
      UserAgree: Boolean(UserAgree),
      isActive: true, // default active
    });

    await user.save();
    return res.status(201).json({ message: 'User added successfully.', user });

  } catch (err) {
    console.error("Error adding user:", err);
    return res.status(500).json({ message: 'An error occurred while adding a user.' });
  }
};

// Get user by ID
const getById = async (req, res) => {
  const id = req.params.id.trim();

  if (!id || id.length !== 24) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ message: 'An error occurred while fetching the user.' });
  }
};

// Update user (with duplicate email/phone check except same user)
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { userName, userPhone, userGmail, userPassword, UserAgree, isActive } = req.body;

  try {
    // ✅ Check for duplicates except current user
    const duplicate = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ userGmail }, { userPhone }] }
      ]
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'Another user already uses this email or phone number.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        userName,
        userPhone,
        userGmail,
        userPassword,
        UserAgree: Boolean(UserAgree),
        isActive: isActive === true || isActive === 'true',
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully.', updatedUser });

  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: 'Failed to update user', error: err });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const id = req.params.id.trim();

  if (!id || id.length !== 24) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ message: 'User successfully deleted.' });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: 'An error occurred while deleting the user.' });
  }
};

// Toggle active/deactive status
const toggleUserStatus = async (req, res) => {
  const id = req.params.id.trim();

  if (!id || id.length !== 24) {
    return res.status(400).json({ message: 'Invalid user ID format.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      message: `User has been ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user,
    });
  } catch (err) {
    console.error("Error toggling user status:", err);
    return res.status(500).json({ message: 'An error occurred while updating user status.' });
  }
};

module.exports = {
  getAllUsers,
  addUser,
  getById,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
