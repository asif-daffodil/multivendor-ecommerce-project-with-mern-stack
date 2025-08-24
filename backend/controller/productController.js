const Product = require('../model/product');
const User = require('../model/user');
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

exports.getProducts = async (req, res) => {
  try {
    // support optional search and pagination for server-side search
    const { search, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const lim = Math.max(1, Math.min(100, parseInt(limit || '1000', 10)));

  const filter = {};
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      // case-insensitive partial match on name or shortDescription
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } }
      ];
    }

    // Do not show products belonging to banned vendors on public/frontend requests.
    // Admin users may still retrieve them (useful for moderation UI).
    const excludeBanned = !(req.user && req.user.role === 'admin');
    if (excludeBanned) {
      const bannedVendors = await User.find({ role: 'vendor', banned: true }).select('_id');
      if (bannedVendors && bannedVendors.length) {
        filter.owner = { $nin: bannedVendors.map(b => b._id) };
      }
    }

    // If pagination requested (page param present) return paginated object
    if (req.query.page) {
      const skip = (pageNum - 1) * lim;
      const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter)
          .populate('category', 'name')
          .populate('brand', 'name')
          .populate('owner', 'name role banned')
          .skip(skip)
          .limit(lim)
          .sort({ createdAt: -1 })
      ]);
      const totalPages = Math.max(1, Math.ceil(total / lim));
      return res.json({ products, total, page: pageNum, limit: lim, totalPages });
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('owner', 'name role banned')
      .sort({ createdAt: -1 });
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
      .populate('owner', 'name role banned');
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
      .populate('owner', 'name role banned');
    if (!p) return res.status(404).json({ message: 'Product not found' });
    // Hide product if owner is a banned vendor for non-admin requests
    if (p.owner && p.owner.banned && !(req.user && req.user.role === 'admin')) {
      return res.status(404).json({ message: 'Product not found' });
    }
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
      .populate('owner', 'name role banned');
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
