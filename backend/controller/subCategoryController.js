const SubCategory = require('../model/subcategory');

exports.addSubCategory = async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    if (!name || !parent) return res.status(400).json({ message: 'name and parent are required' });
    // Optional: unique under same parent
    const existing = await SubCategory.findOne({ name, parent });
    if (existing) return res.status(409).json({ message: 'Subcategory already exists under this category' });
    const sub = await SubCategory.create({ name, description, parent });
    res.status(201).json({ message: 'Subcategory created', subCategory: sub });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const { parent } = req.query;
    const filter = parent ? { parent } : {};
    const subs = await SubCategory.find(filter).populate('parent', 'name');
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const sub = await SubCategory.findById(id);
    if (!sub) return res.status(404).json({ message: 'Subcategory not found' });
    if (name && name !== sub.name) {
      const exists = await SubCategory.findOne({ name, parent: sub.parent });
      if (exists && exists._id.toString() !== id) {
        return res.status(409).json({ message: 'Subcategory name already in use under this category' });
      }
      sub.name = name;
    }
    if (typeof description !== 'undefined') sub.description = description;
    await sub.save();
    res.json({ message: 'Subcategory updated', subCategory: sub });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubCategory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Subcategory not found' });
    res.json({ message: 'Subcategory deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
