const Category = require('../model/category');
const SubCategory = require('../model/subcategory');
const Product = require('../model/product');

// Add new category (admin only)
exports.addCategory = async (req, res) => {
    try {
    const { name, description, serviceCharge } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(409).json({ message: 'Category already exists.' });
        }
    const category = new Category({ name, description, serviceCharge: typeof serviceCharge === 'number' ? serviceCharge : undefined });
        await category.save();
        res.status(201).json({ message: 'Category created successfully.', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
        const q = (req.query.q || '').trim();

        const filter = {};
        if (q) filter.name = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        const total = await Category.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const results = await Category.find(filter).skip((page - 1) * limit).limit(limit).sort({ name: 1 });

        res.json({ results, page, pageSize: limit, total, totalPages });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
    const { name, description, serviceCharge } = req.body;
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
    if (typeof serviceCharge !== 'undefined') category.serviceCharge = serviceCharge;

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

    // remove subcategories under this category
    await SubCategory.deleteMany({ parent: deleted._id });

    // clear category and subcategory references from products
    await Product.updateMany({ category: deleted._id }, { $unset: { category: '', subcategory: '' } });

    res.json({ message: 'Category deleted and related subcategories/products updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
