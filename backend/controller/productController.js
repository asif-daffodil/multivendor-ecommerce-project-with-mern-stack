const Product = require('../model/product');
const path = require('path');
const fs = require('fs').promises;

async function deleteFileSafe(filePath) {
  if (!filePath) return;
  try {
    // only handle local uploaded files
    if (typeof filePath === 'string' && filePath.startsWith('/uploads/')) {
      const rel = filePath.replace(/^\//, ''); // strip leading '/'
      const abs = path.join(__dirname, '..', 'public', rel);
      await fs.unlink(abs);
    }
  } catch (e) {
    // ignore missing files or fs errors to not block deletion
  }
}

async function deleteManyFilesSafe(paths) {
  if (!Array.isArray(paths)) return;
  await Promise.allSettled(paths.map(p => deleteFileSafe(p)));
}

function parseMaybeArray(val) {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // fallthrough to comma-split
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return undefined;
}

exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      shortDescription,
      description,
      regularPrice,
      salePrice,
      category,
      subcategory,
      brand,
      colors = [],
      sizes = [],
      inventoryCount = 0,
      isCompanyProduct = false,
    } = req.body;

  // normalize optional fields: treat empty string as undefined
  const normalizeOpt = (v) => (v === '' || v === 'null' || v === 'undefined' ? undefined : v);
  brand = normalizeOpt(brand);
  subcategory = normalizeOpt(subcategory);
  salePrice = normalizeOpt(salePrice);
  if (inventoryCount === '' || inventoryCount == null) inventoryCount = 0;

  if (!name || regularPrice == null || category === '' || !category) {
      return res.status(400).json({ message: 'name, regularPrice, and category are required' });
    }

    // media from multer (optional)
    // featured image
    let featuredImage;
    if (req.files?.featuredImage?.[0]) {
      const f = req.files.featuredImage[0];
      featuredImage = `/uploads/products/${f.filename}`;
    }
    // gallery images
    let images = [];
    if (req.files?.images) {
      images = req.files.images.map((f) => `/uploads/products/${f.filename}`);
    }

    // normalize arrays if they came as strings
    const normColors = parseMaybeArray(colors) ?? colors;
    const normSizes = parseMaybeArray(sizes) ?? sizes;

    const product = await Product.create({
      name,
      shortDescription,
      description,
      regularPrice,
      salePrice,
      category,
      subcategory,
      brand,
      colors: normColors,
      sizes: normSizes,
      inventoryCount,
      outOfStock: Number(inventoryCount) <= 0,
      featuredImage,
      images,
      owner: isCompanyProduct ? null : req.user?._id || null,
      isCompanyProduct: !!isCompanyProduct,
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getProducts = async (_req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('owner', 'name role');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user?._id })
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('owner', 'name role');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Product.findById(id)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('subcategory', 'name')
      .populate('owner', 'name role');
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    const user = req.user;
    const isAdmin = user?.role === 'admin';
    if (!isAdmin && String(prod.owner) !== String(user?._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let {
      name,
      shortDescription,
      description,
      regularPrice,
      salePrice,
      category,
      subcategory,
      brand,
      colors,
      sizes,
      inventoryCount,
      isCompanyProduct,
    } = req.body;

  const normalizeOpt = (v) => (v === '' || v === 'null' || v === 'undefined' ? null : v);
  // normalize optional references
  brand = normalizeOpt(brand);
  subcategory = normalizeOpt(subcategory);
  if (salePrice === '') salePrice = null;

    // handle media updates if provided
    let featuredImage;
    if (req.files?.featuredImage?.[0]) {
      featuredImage = `/uploads/products/${req.files.featuredImage[0].filename}`;
    }
    let images;
    if (req.files?.images) {
      images = req.files.images.map((f) => `/uploads/products/${f.filename}`);
    }

    const update = {};
    if (name != null) update.name = name;
    if (shortDescription != null) update.shortDescription = shortDescription;
    if (description != null) update.description = description;
    if (regularPrice != null) update.RegularPrice = undefined, update.regularPrice = regularPrice; // ensure correct casing
    if (salePrice != null) update.salePrice = salePrice;
  if (category != null && category !== '') update.category = category;
  if (subcategory !== undefined) update.subcategory = subcategory; // can be null to clear
  if (brand !== undefined) update.brand = brand; // can be null to clear
    const normColors = parseMaybeArray(colors);
    if (normColors !== undefined) update.colors = normColors;
    const normSizes = parseMaybeArray(sizes);
    if (normSizes !== undefined) update.sizes = normSizes;
    if (inventoryCount != null && inventoryCount !== '') {
      update.inventoryCount = inventoryCount;
      update.outOfStock = Number(inventoryCount) <= 0;
    }
    if (typeof isCompanyProduct !== 'undefined' && isAdmin) {
      update.isCompanyProduct = !!isCompanyProduct;
      if (update.isCompanyProduct) update.owner = null; // detach owner if company
    }
    if (featuredImage) update.featuredImage = featuredImage;
    if (images) update.images = images;

    const updated = await Product.findByIdAndUpdate(id, update, { new: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('owner', 'name role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    const user = req.user;
    const isAdmin = user?.role === 'admin';
    if (!isAdmin && String(prod.owner) !== String(user?._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  // try to remove related images from disk
  const filePaths = [];
  if (prod.featuredImage) filePaths.push(prod.featuredImage);
  if (Array.isArray(prod.images)) filePaths.push(...prod.images);
  await deleteManyFilesSafe(filePaths);
  // remove product document
  await prod.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
