const Brand = require('../model/brand');

exports.addBrand = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const exists = await Brand.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: 'Brand already exists' });

    const brand = await Brand.create({ name: name.trim(), description });
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add brand' });
  }
};

exports.getBrands = async (_req, res) => {
  try {
    const items = await Brand.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const exists = await Brand.findOne({ name: name.trim(), _id: { $ne: id } });
    if (exists) return res.status(409).json({ message: 'Brand name already used' });
    const updated = await Brand.findByIdAndUpdate(id, { name: name?.trim(), description }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Brand not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update brand' });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Brand.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete brand' });
  }
};
