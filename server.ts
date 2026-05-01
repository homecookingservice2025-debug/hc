import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import { UserRole, OrderStatus, User, Order } from "./src/types";
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from '@phonepe-pg/pg-sdk-node';
import { v4 as uuidv4 } from 'uuid';

// Initialize PhonePe Client
const phonepeClientId = process.env.VITE_PHONEPE_CLIENT_ID || "MOCK_CLIENT_ID";
const phonepeClientSecret = process.env.VITE_PHONEPE_CLIENT_SECRET || "MOCK_SECRET";
const phonepeClientVersion = parseInt(process.env.VITE_PHONEPE_CLIENT_VERSION || "1", 10);
const phonepeEnv = process.env.VITE_PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

let phonepeClient: any = null;
try {
  if (process.env.VITE_PHONEPE_CLIENT_ID) {
    phonepeClient = StandardCheckoutClient.getInstance(phonepeClientId, phonepeClientSecret, phonepeClientVersion, phonepeEnv);
  }
} catch (e) {
  console.error("PhonePe Initialization Error:", e);
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Mock Database
  let users: User[] = [
    { id: 'admin', role: UserRole.ADMIN, name: 'HC', surname: 'Admin', email: 'admin@hc.com', phone: '1234567890', isVerified: true },
    { id: 'chef12', role: UserRole.CHEF, name: 'Vikram', surname: 'Singh', email: 'chef@hc.com', phone: '1112223334', isVerified: true, isOnline: true },
    { id: 'm1', role: UserRole.MANAGER, name: 'Raj', surname: 'Mehta', email: 'manager@hc.com', phone: '9123456789', isVerified: true },
    { id: 'user', role: UserRole.USER, name: 'Amit', surname: 'Kumar', email: 'user@gmail.com', phone: '7123456789', whatsapp: '7123456789', customerCode: 'CUST001', addresses: [{ id: '1', label: 'Home', address: '123 Main St' }], isVerified: true },
  ];
  let orders: Order[] = [
    { 
      id: 'ord1', 
      bookingId: 'BK-1001',
      userId: 'user1', 
      userEmail: 'amit@gmail.com', 
      type: 'DAILY', 
      items: [{ id: '1', name: 'Dal Tadka', price: 150, type: 'DAILY', category: 'Lentils' }],
      totalAmount: 150,
      commissionChef: 105,
      commissionAdmin: 45,
      status: OrderStatus.COMPLETED,
      otp: '4582',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];
  let menu: any[] = [
    { id: '1', name: 'Dal Tadka', price: 150, category: 'Lentils', type: 'DAILY' },
    { id: '2', name: 'Paneer Butter Masala', price: 250, category: 'Main Course', type: 'DAILY' },
    { id: '3', name: 'Jeera Rice', price: 120, category: 'Rice', type: 'DAILY' },
    { id: '4', name: 'Gulab Jamun', price: 60, category: 'Dessert', type: 'DAILY' },
    
    // Welcome Drinks
    { id: 'p1', name: 'Coffee', price: 555, category: 'Welcome Drinks', type: 'PARTY' },
    { id: 'p2', name: 'Jaljeera', price: 555, category: 'Welcome Drinks', type: 'PARTY' },
    { id: 'p3', name: 'Shikanji', price: 555, category: 'Welcome Drinks', type: 'PARTY' },
    { id: 'p4', name: 'Cold Drink', price: 555, category: 'Welcome Drinks', type: 'PARTY' },
    
    // Soup
    { id: 'p5', name: 'Hot n Sour Soup', price: 555, category: 'Soup', type: 'PARTY' },
    { id: 'p6', name: 'Peaking Soup', price: 555, category: 'Soup', type: 'PARTY' },
    { id: 'p7', name: 'Manchow Soup', price: 555, category: 'Soup', type: 'PARTY' },
    { id: 'p8', name: 'Cream Tomato Soup', price: 555, category: 'Soup', type: 'PARTY' },
    { id: 'p9', name: 'Sweet Corn Soup', price: 555, category: 'Soup', type: 'PARTY' },

    // Snacks
    { id: 'p10', name: 'Paneer Stick', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p11', name: 'Paneer Pakora', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p12', name: 'Paneer 65', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p13', name: 'Paneer Chilli', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p14', name: 'Ginger Garlic Noodles', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p15', name: 'Spring Roll', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p16', name: 'Salted Pepper', price: 555, category: 'Snacks', type: 'PARTY' },
    { id: 'p17', name: 'Potato Stuff', price: 555, category: 'Snacks', type: 'PARTY' },

    // Paneer Ka Swad
    { id: 'p18', name: 'Paneer Butter Masala', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },
    { id: 'p19', name: 'Matar Paneer', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },
    { id: 'p20', name: 'Handi Paneer', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },
    { id: 'p21', name: 'Kadhai Paneer', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },
    { id: 'p22', name: 'Paneer Lababdar', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },
    { id: 'p23', name: 'Paneer Do Pyaza', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },
    { id: 'p24', name: 'Palak Paneer', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' },

    // Vegetable Gravy
    { id: 'p25', name: 'Veg Kofta', price: 555, category: 'Vegetable Gravy', type: 'PARTY' },
    { id: 'p26', name: 'Veg Manchurian', price: 555, category: 'Vegetable Gravy', type: 'PARTY' },
    { id: 'p27', name: 'Aloo Dum Kashmiri', price: 555, category: 'Vegetable Gravy', type: 'PARTY' },
    { id: 'p28', name: 'Chola Masala', price: 555, category: 'Vegetable Gravy', type: 'PARTY' },
    { id: 'p29', name: 'Chola Punjabi', price: 555, category: 'Vegetable Gravy', type: 'PARTY' },
    { id: 'p30', name: 'Aloo Dum Banani', price: 555, category: 'Vegetable Gravy', type: 'PARTY' },

    // Dal Ki Rasoi
    { id: 'p31', name: 'Dal Fry (Arhar)', price: 555, category: 'Dal Ki Rasoi', type: 'PARTY' },
    { id: 'p32', name: 'Dal Makhani', price: 555, category: 'Dal Ki Rasoi', type: 'PARTY' },
    { id: 'p33', name: 'Dal Handi', price: 555, category: 'Dal Ki Rasoi', type: 'PARTY' },
    { id: 'p34', name: 'Rajma Masala', price: 555, category: 'Dal Ki Rasoi', type: 'PARTY' },

    // Sugandhit Basmati
    { id: 'p35', name: 'Plain Rice', price: 555, category: 'Sugandhit Basmati', type: 'PARTY' },
    { id: 'p36', name: 'Jeera Rice', price: 555, category: 'Sugandhit Basmati', type: 'PARTY' },
    { id: 'p37', name: 'Fried Rice', price: 555, category: 'Sugandhit Basmati', type: 'PARTY' },
    { id: 'p38', name: 'Vegetable Biryani', price: 555, category: 'Sugandhit Basmati', type: 'PARTY' },
    { id: 'p39', name: 'Matar Pulao', price: 555, category: 'Sugandhit Basmati', type: 'PARTY' },

    // Breads
    { id: 'p40', name: 'Baby Naan', price: 555, category: 'Breads', type: 'PARTY' },
    { id: 'p41', name: 'Butter Naan', price: 555, category: 'Breads', type: 'PARTY' },
    { id: 'p42', name: 'Poori / Dal Kachori', price: 555, category: 'Breads', type: 'PARTY' },
    { id: 'p43', name: 'Missi Roti', price: 555, category: 'Breads', type: 'PARTY' },
    { id: 'p44', name: 'Tandoori Roti', price: 555, category: 'Breads', type: 'PARTY' },
    { id: 'p45', name: 'Lachha Paratha', price: 555, category: 'Breads', type: 'PARTY' },

    // Curd
    { id: 'p46', name: 'Dahi Bada', price: 555, category: 'Curd', type: 'PARTY' },
    { id: 'p47', name: 'Mix Raita', price: 555, category: 'Curd', type: 'PARTY' },
    { id: 'p48', name: 'Pudina Raita', price: 555, category: 'Curd', type: 'PARTY' },
    { id: 'p49', name: 'Boondi Raita', price: 555, category: 'Curd', type: 'PARTY' },
    { id: 'p50', name: 'Pine Apple Raita', price: 555, category: 'Curd', type: 'PARTY' },
  ];
  let withdrawals: any[] = [];
  let config = {
    logo: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=200',
    address: 'E Flat/Door/Block No. GENERAL S.No. 1, HOME COOKING, 356/K C 337, ALAM NAGAR, KANAK CITY, AVAS VIKAS COLONY, Lucknow, Uttar Pradesh - 226017',
    contactEmail: 'hchomecookingservices@gmail.com',
    contactPhone: '+91 85438 98295',
    upiId: 'hc@upi',
    aboutUs: 'We are HC Home Cooking, Lucknow\'s premier professional chef service. We connect you with elite Indian chefs who bring the heart of traditional and modern Indian cuisine directly to your kitchen. Be it daily healthy meals or extravagant party spreads, we ensure every dish is prepared with fresh ingredients, minimal oil, and authentic spices.',
    mission: '“To provide healthy, hygienic, and affordable home-style Indian meals while making healthy living convenient for the residents of Lucknow.”',
    vision: '“To be the most trusted professional chef service in Uttar Pradesh, known for our authenticity, hygiene, and the skill of our Indian culinary experts.”',
    directorMessage: 'At HC Home Cooking, we understand that food is more than just sustenance; it\'s health and heritage. Our mission is to bring the expertise of professional Indian chefs into your homes in Lucknow. We focus on hygiene, authentic taste, and personal care.\n\nWe are committed to serving only Lucknow, ensuring that our local community receives the highest quality of service. Our chefs are handpicked for their expertise in traditional and contemporary Indian cooking, helping you maintain a healthy lifestyle without compromising on taste.',
    directorName: 'Mr. Amreesh Kumar Gupta',
    directorPhoto: 'https://images.unsplash.com/photo-1583394238182-6f3ad46881d8?auto=format&fit=crop&q=80&w=400',
    homeBannerUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc9?auto=format&fit=crop&q=80&w=1000',
    homeBannerType: 'image',
    partyMenuImageUrl: '',
    dailyVegImageUrl: ''
  };

  // Socket logic
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("setStatus", ({ userId, isOnline }) => {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.isOnline = isOnline;
        io.emit("userStatusChanged", { userId, isOnline });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // API Routes
  app.get("/api/config", (req, res) => res.json(config));
  app.post("/api/config", (req, res) => {
    config = { ...config, ...req.body };
    res.json(config);
  });

  app.get("/api/users", (req, res) => res.json(users));
  
  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body };
      res.json(users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
  
  app.post("/api/login", (req, res) => {
    const { email, password, role } = req.body;
    
    // Hardcoded credentials as requested by user
    const credentials: Record<string, { id: string, pass: string, role: UserRole }> = {
      'admin': { id: 'admin', pass: 'admin@hc', role: UserRole.ADMIN },
      'm1': { id: 'm1', pass: '12345', role: UserRole.MANAGER },
      'user': { id: 'user', pass: '12345', role: UserRole.USER },
      'chef12': { id: 'chef12', pass: '12345', role: UserRole.CHEF },
    };

    // Find the user by ID or Email and matching Role
    const user = users.find(u => (u.id === email || u.email === email) && u.role === role);

    if (user) {
      // Check if this is a hardcoded credential
      const cred = credentials[user.id];
      if (cred) {
        if (cred.pass === password) {
          return res.json(user);
        }
      } else if (user.password === password) {
        // Dynamic user check
        return res.json(user);
      }
    }

    res.status(401).json({ error: "Invalid ID/Email or Password for the selected role" });
  });

  app.post("/api/users", (req, res) => {
    const newUser = { id: Date.now().toString(), ...req.body };
    users.push(newUser);
    res.json(newUser);
  });

  app.get("/api/orders", (req, res) => res.json(orders));
  app.post("/api/orders", (req, res) => {
    const total = req.body.totalAmount || 0;
    const newOrder = { 
      id: Date.now().toString(), 
      bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      commissionChef: total * 0.7,
      commissionAdmin: total * 0.3,
      ...req.body, 
      createdAt: new Date() 
    };
    orders.push(newOrder);
    
    // Notify online chefs for new orders
    io.emit("newOrderNotification", newOrder);
    
    res.json(newOrder);
  });

  app.put("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...req.body };
      
      // If order is accepted, notify others to hide notification
      if (req.body.chefId && orders[index].status === OrderStatus.PENDING) {
        io.emit("orderAccepted", { orderId: id, chefId: req.body.chefId });
      }
      
      res.json(orders[index]);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.get("/api/menu", (req, res) => res.json(menu));
  
  // PhonePe Payment Routes
  app.post("/api/phonepe/pay", async (req, res) => {
    try {
      if (!phonepeClient) {
        return res.status(500).json({ error: "PhonePe Client not initialized. Please set VITE_PHONEPE_CLIENT_ID." });
      }

      const { amount, orderId, redirectUrl } = req.body;
      const merchantOrderId = orderId || uuidv4();
      
      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount * 100) // Convert to paise
        .redirectUrl(redirectUrl || "http://localhost:3000/orders")
        .build();

      const response = await phonepeClient.pay(request);
      res.json({
        success: true,
        redirectUrl: response.redirectUrl,
        orderId: response.orderId
      });
    } catch (error: any) {
      console.error("PhonePe Pay Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/phonepe/status/:orderId", async (req, res) => {
    try {
      if (!phonepeClient) return res.status(500).json({ error: "PhonePe not initialized" });
      const { orderId } = req.params;
      const response = await phonepeClient.getOrderStatus(orderId);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mobile SDK Token Route
  app.post("/api/phonepe/sdk-order", async (req, res) => {
    try {
      if (!phonepeClient) return res.status(500).json({ error: "PhonePe not initialized" });
      const { amount, orderId, redirectUrl } = req.body;
      const merchantOrderId = orderId || uuidv4();

      const request = {
        merchantOrderId,
        amount: amount * 100, // in paise
        disablePaymentRetry: true,
        redirectUrl: redirectUrl || "https://redirectUrl.com"
      };

      // Note: The SDK might use createSdkOrder according to user's prompt doc
      const response = await phonepeClient.createSdkOrder(request);
      res.json({
        token: response.token,
        orderId: response.orderId,
        state: response.state
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook for PhonePe
  app.post("/api/phonepe/webhook", (req, res) => {
    const authHeader = req.headers['authorization'] as string;
    const bodyString = JSON.stringify(req.body);
    
    // In a real app, you'd validate the callback here
    // const isValid = phonepeClient.validateCallback(username, password, authHeader, bodyString);
    
    console.log("PhonePe Webhook Received:", req.body);
    
    // Update order status in your DB/Socket
    const orderData = req.body.payload;
    if (orderData && orderData.state === 'COMPLETED') {
        const index = orders.findIndex(o => o.bookingId === orderData.merchantOrderId || o.id === orderData.merchantOrderId);
        if (index !== -1) {
            orders[index].status = OrderStatus.PAID;
            io.to(orders[index].userId).emit("orderUpdated", orders[index]);
        }
    }
    
    res.json({ success: true });
  });

  app.post("/api/menu", (req, res) => {
    const item = { id: Date.now().toString(), ...req.body };
    menu.push(item);
    res.json(item);
  });
  app.delete("/api/menu/:id", (req, res) => {
    const { id } = req.params;
    const index = menu.findIndex(m => m.id === id);
    if (index !== -1) {
      menu.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Menu item not found" });
    }
  });

  app.get("/api/withdrawals", (req, res) => res.json(withdrawals));
  app.post("/api/withdrawals", (req, res) => {
    const request = { id: Date.now().toString(), ...req.body, createdAt: new Date(), status: 'PENDING' };
    withdrawals.push(request);
    res.json(request);
  });

  app.put("/api/withdrawals/:id", (req, res) => {
    const { id } = req.params;
    const index = withdrawals.findIndex(w => w.id === id);
    if (index !== -1) {
      withdrawals[index] = { ...withdrawals[index], ...req.body };
      res.json(withdrawals[index]);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
