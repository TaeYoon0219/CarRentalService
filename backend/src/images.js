// to handle images --------------------

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cars/') // Save to uploads/cars folder
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + original name
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload single image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return the URL path to access the image
  const imageUrl = `/uploads/cars/${req.file.filename}`;
  
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: imageUrl,
    filename: req.file.filename
  });
});

// Upload multiple images
router.post('/upload-multiple', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const imageUrls = req.files.map(file => `/uploads/cars/${file.filename}`);
  
  res.json({
    message: 'Images uploaded successfully',
    imageUrls: imageUrls
  });
});

// Delete image
router.delete('/delete/:filename', (req, res) => {
  const fs = require('fs');
  const filePath = path.join(__dirname, '../../uploads/cars/', req.params.filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  });
});

module.exports = router;