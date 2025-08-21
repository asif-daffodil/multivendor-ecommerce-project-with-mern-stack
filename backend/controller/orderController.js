const Order = require('../model/order');
const Product = require('../model/product');

const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, billingAddress, shippingAddress } = req.body;
    // shippingAddress is explicit; deliveryAddress kept for backward compatibility
    const deliveryAddress = shippingAddress || req.body.deliveryAddress || null;
    if (!items || !items.length) return res.status(400).json({ message: 'Cart is empty' });

    if (!deliveryAddress || !deliveryAddress.addressLine || !deliveryAddress.city || !deliveryAddress.phone) {
      return res.status(400).json({ message: 'Delivery address is required (addressLine, city, phone)' });
    }

    // Resolve items: ensure vendor and product refs
    const resolved = await Promise.all(items.map(async (it) => {
      if (it.product) {
        const p = await Product.findById(it.product);
        if (p) {
          return {
            product: p._id,
            name: p.name,
            qty: it.qty || 1,
            price: Number(it.price ?? p.salePrice ?? p.regularPrice ?? 0),
            vendor: p.owner || null,
          };
        }
      }
      return {
        product: it.product || null,
        name: it.name || '',
        qty: it.qty || 1,
        price: Number(it.price || 0),
        vendor: it.vendor || null,
      };
    }));

    const order = new Order({
      user: req.user._id,
      items: resolved,
      total: Number(total || resolved.reduce((s, r) => s + (r.price * (r.qty || 1)), 0)),
      paymentMethod: paymentMethod || 'cod',
      deliveryAddress,
      billingAddress: billingAddress || null,
      shippingAddress: shippingAddress || deliveryAddress || null,
    });

    await order.save();
    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

const getOrdersForUser = async (req, res) => {
  try {
    // support pagination for users: ?page=1&limit=20
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter).populate('items.product').sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    res.json({ orders, total, page, limit, totalPages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // support pagination via query params: ?page=1&limit=20
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments(),
      Order.find().populate('user').populate('items.product').sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);

    const totalPages = Math.ceil(total / limit);
    res.json({ orders, total, page, limit, totalPages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error });
  }
};

const getOrdersForVendor = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const orders = await Order.find({ 'items.vendor': vendorId }).populate('user').populate('items.product').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor orders', error });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If requester is vendor, ensure they have items in this order
    if (req.user.role === 'vendor') {
      const vendorId = req.user._id.toString();
      const has = order.items.some(it => it.vendor && it.vendor.toString() === vendorId);
      if (!has) return res.status(403).json({ message: 'Forbidden' });
    }

    // Only admin and vendor (with ownership) can update; users cannot change status
    if (req.user.role === 'user') return res.status(403).json({ message: 'Forbidden' });

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();
    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const o = await Order.findByIdAndDelete(id);
    if (!o) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};

module.exports = {
  createOrder,
  getOrdersForUser,
  getAllOrders,
  getOrdersForVendor,
  updateOrderStatus,
  deleteOrder,
};
