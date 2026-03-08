const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

module.exports = router;
