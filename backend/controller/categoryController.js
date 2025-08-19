const Category = require('../model/category');

// Add new category (admin only)
exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(409).json({ message: 'Category already exists.' });
        }
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json({ message: 'Category created successfully.', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (name && name !== category.name) {
            const exists = await Category.findOne({ name });
            if (exists && exists._id.toString() !== id) {
                return res.status(409).json({ message: 'Category name already in use.' });
            }
            category.name = name;
        }
        if (typeof description !== 'undefined') category.description = description;

        await category.save();
        res.json({ message: 'Category updated', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
