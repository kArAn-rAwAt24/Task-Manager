const User = require('../modles/User');
const Note = require('../modles/Note');
const asynHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const getAllUsers = asynHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();
  if (!users?.length) {
    return res.status(400).json({ message: 'No User Found' });
  }
  res.json(users);
});

const createNewUser = asynHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  //confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate username' });
  }

  // hash password
  const hashedPwd = await bcrypt.hash(password, 10); //10 salt rounds

  const userObject = {
    username,
    password: hashedPwd,
    roles,
  };

  // Creae and store new user
  const user = await User.create(userObject);
  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
});

const updateUser = asynHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'user not found' });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username' });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.username} updated` });
});

const deleteUser = asynHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID Required' });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: ' User has assigned notes' });
  }
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const result = await User.deleteOne();
  const reply = `Username ${user.username} with ID ${user._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
