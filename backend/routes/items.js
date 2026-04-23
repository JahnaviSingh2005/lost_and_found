const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

// All routes below are protected
router.use(authMiddleware);

// GET /api/items/search?name=xyz — Search items by name or category
// NOTE: This route MUST be defined before /:id to avoid "search" being treated as an ID
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a search query (?name=...)' });
    }

    const items = await Item.find({
      $or: [
        { itemName: { $regex: name, $options: 'i' } },
        { type: { $regex: name, $options: 'i' } },
        { description: { $regex: name, $options: 'i' } },
        { location: { $regex: name, $options: 'i' } },
      ],
    })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Server error while searching items.' });
  }
});

// POST /api/items — Add a new item
router.post('/', async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    if (!itemName || !type || !location || !contactInfo) {
      return res.status(400).json({ message: 'Please provide itemName, type, location, and contactInfo.' });
    }

    const item = await Item.create({
      itemName,
      description,
      type,
      location,
      date: date || Date.now(),
      contactInfo,
      postedBy: req.user._id,
    });

    const populatedItem = await item.populate('postedBy', 'name email');
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Create item error:', error.message);
    res.status(500).json({ message: 'Server error while creating item.' });
  }
});

// GET /api/items — Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error.message);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
});

// GET /api/items/:id — Get single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error.message);
    res.status(500).json({ message: 'Server error while fetching item.' });
  }
});

// PUT /api/items/:id — Update item (only by owner)
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only update your own items.' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;

    item.itemName = itemName || item.itemName;
    item.description = description !== undefined ? description : item.description;
    item.type = type || item.type;
    item.location = location || item.location;
    item.date = date || item.date;
    item.contactInfo = contactInfo || item.contactInfo;

    const updatedItem = await item.save();
    const populatedItem = await updatedItem.populate('postedBy', 'name email');

    res.json(populatedItem);
  } catch (error) {
    console.error('Update item error:', error.message);
    res.status(500).json({ message: 'Server error while updating item.' });
  }
});

// DELETE /api/items/:id — Delete item (only by owner)
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own items.' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error.message);
    res.status(500).json({ message: 'Server error while deleting item.' });
  }
});

module.exports = router;
