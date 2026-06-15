// utils/mockData.js
// Static sample data used by the mock API client (utils/axios.js).
// The backend has been removed — this is what powers the plain UI.

export const mockCategories = [
  { _id: "cat-1", name: "Biryani", image: "/biryani.jpg", description: "Aromatic, flavour-packed rice delicacies" },
  { _id: "cat-2", name: "Pickles", image: "/pickle1.png", description: "Traditional homemade pickles" },
  { _id: "cat-3", name: "Sweets", image: "/sweet.jpg", description: "Festive Indian sweets & mithai" },
  { _id: "cat-4", name: "Snacks", image: "/snaks.jpg", description: "Crispy, savoury tea-time snacks" },
  { _id: "cat-5", name: "Masala", image: "/masala1.png", description: "Freshly ground spice blends" },
  { _id: "cat-6", name: "South Indian", image: "/dosa.jpg", description: "Dosa, idli & southern classics" },
  { _id: "cat-7", name: "Paneer Special", image: "/paneer.jpg", description: "Rich paneer preparations" },
  { _id: "cat-8", name: "Desserts", image: "/desserts.jpg", description: "Cakes & sweet treats" },
];

const vendor = { _id: "vendor-1", name: "Ojain Home Kitchen", shopName: "Ojain Home Kitchen", email: "kitchen@ojain.com" };

export const mockProducts = [
  {
    _id: "prod-1", name: "Veg Biryani", category: "cat-1", vendor,
    description: "Fragrant basmati rice layered with fresh vegetables and house spices.",
    price: 180, images: ["/biryani.jpg"], isVeg: true, avgRating: 4.6, reviewCount: 128, stock: 25,
  },
  {
    _id: "prod-2", name: "Masala Dosa", category: "cat-6", vendor,
    description: "Crispy golden dosa stuffed with spiced potato masala, served with chutney.",
    price: 90, images: ["/dosa.jpg"], isVeg: true, avgRating: 4.7, reviewCount: 96, stock: 40,
  },
  {
    _id: "prod-3", name: "Paneer Tikka", category: "cat-7", vendor,
    description: "Marinated cottage cheese chargrilled to smoky perfection.",
    price: 220, images: ["/paneer.jpg"], isVeg: true, avgRating: 4.8, reviewCount: 64, stock: 18,
  },
  {
    _id: "prod-4", name: "Mango Pickle", category: "cat-2", vendor,
    description: "Tangy raw-mango pickle made the traditional way.",
    price: 150, images: ["/pickle1.png"], isVeg: true, avgRating: 4.5, reviewCount: 210, stock: 60,
  },
  {
    _id: "prod-5", name: "Gulab Jamun", category: "cat-3", vendor,
    description: "Soft milk-solid dumplings soaked in cardamom sugar syrup.",
    price: 120, images: ["/sweet.jpg"], isVeg: true, avgRating: 4.9, reviewCount: 150, stock: 35,
  },
  {
    _id: "prod-6", name: "Samosa (2 pcs)", category: "cat-4", vendor,
    description: "Flaky pastry filled with spiced peas and potato.",
    price: 40, images: ["/smosa.jpg"], isVeg: true, avgRating: 4.4, reviewCount: 305, stock: 100,
  },
  {
    _id: "prod-7", name: "Kitchen King Masala", category: "cat-5", vendor,
    description: "All-purpose spice blend for rich, restaurant-style gravies.",
    price: 99, images: ["/masala1.png"], isVeg: true, avgRating: 4.6, reviewCount: 88, stock: 75,
  },
  {
    _id: "prod-8", name: "Chocolate Cake", category: "cat-8", vendor,
    description: "Moist eggless chocolate cake topped with rich ganache.",
    price: 350, images: ["/cake.jpg"], isVeg: true, avgRating: 4.8, reviewCount: 42, stock: 12,
  },
];

export const mockVendors = [
  { _id: "vendor-1", name: "Ojain Home Kitchen", shopName: "Ojain Home Kitchen", email: "kitchen@ojain.com", phone: "9876543210", isApproved: true, isVerified: true },
  { _id: "vendor-2", name: "Spice Route", shopName: "Spice Route", email: "spice@ojain.com", phone: "9876500000", isApproved: false, isVerified: false },
  { _id: "vendor-3", name: "Sweet Treats Co.", shopName: "Sweet Treats Co.", email: "sweets@ojain.com", phone: "9870000000", isApproved: true, isVerified: true },
];

export const mockUsers = [
  { _id: "user-1", name: "Demo Customer", email: "demo@ojain.com", phone: "9999999999", role: "customer" },
  { _id: "user-2", name: "Riya Shah", email: "riya@ojain.com", phone: "9888888888", role: "customer" },
];

export const mockOrders = [
  {
    _id: "order-1", orderStatus: "Delivered", paymentMethod: "COD", totalAmount: 360,
    items: [{ product: mockProducts[0], quantity: 2 }],
    createdAt: "2026-05-20T10:30:00.000Z",
  },
  {
    _id: "order-2", orderStatus: "Placed", paymentMethod: "Razorpay", totalAmount: 220,
    items: [{ product: mockProducts[2], quantity: 1 }],
    createdAt: "2026-06-08T18:15:00.000Z",
  },
];

export const mockDashboard = {
  totalVendors: 3,
  totalProducts: mockProducts.length,
  totalOrders: mockOrders.length,
  totalRevenue: 580,
  pendingVendors: 1,
  pendingProducts: 0,
};

export const mockPayouts = [
  { _id: "payout-1", vendor: mockVendors[0], amount: 4200, status: "Pending" },
  { _id: "payout-2", vendor: mockVendors[2], amount: 1800, status: "Paid" },
];
