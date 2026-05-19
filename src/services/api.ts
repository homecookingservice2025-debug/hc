import { User, Order, UserRole, OrderStatus, AppConfig, MenuItem, WithdrawalRequest, OrderType } from '../types';

// Storage keys
const USERS_KEY = 'hc_users';
const ORDERS_KEY = 'hc_orders';
const CONFIG_KEY = 'hc_config';
const MENU_KEY = 'hc_menu';

// Initial Data
const initialUsers: User[] = [
  { id: 'admin', role: UserRole.ADMIN, name: 'HC', surname: 'Admin', email: 'admin@cook.com', phone: '1234567890', isVerified: true },
  { id: 'chef', role: UserRole.CHEF, name: 'Chef', surname: 'HC', email: 'chef@hc.com', phone: '12345', isVerified: true, isOnline: true },
  { id: 'chef12', role: UserRole.CHEF, name: 'Vikram', surname: 'Singh', email: 'chef@hc.com', phone: '1112223334', isVerified: true, isOnline: true },
  { id: 'm1', role: UserRole.MANAGER, name: 'Raj', surname: 'Mehta', email: 'manager@hc.com', phone: '9123456789', isVerified: true },
  { id: 'user', role: UserRole.USER, name: 'Amit', surname: 'Kumar', email: 'user@gmail.com', phone: '7123456789', whatsapp: '7123456789', customerCode: 'CUST001', addresses: [{ id: '1', label: 'Home', address: '123 Main St' }], isVerified: true },
];

const initialMenu: MenuItem[] = [
  { id: '1', name: 'Dal Tadka', price: 150, category: 'Lentils', type: 'DAILY' as OrderType },
  { id: '2', name: 'Paneer Butter Masala', price: 250, category: 'Main Course', type: 'DAILY' as OrderType },
  { id: '3', name: 'Jeera Rice', price: 120, category: 'Rice', type: 'DAILY' as OrderType },
  { id: '4', name: 'Gulab Jamun', price: 60, category: 'Dessert', type: 'DAILY' as OrderType },
  { id: 'p1', name: 'Coffee', price: 555, category: 'Welcome Drinks', type: 'PARTY' as OrderType },
  { id: 'p2', name: 'Jaljeera', price: 555, category: 'Welcome Drinks', type: 'PARTY' as OrderType },
  { id: 'p3', name: 'Shikanji', price: 555, category: 'Welcome Drinks', type: 'PARTY' as OrderType },
  { id: 'p4', name: 'Cold Drink', price: 555, category: 'Welcome Drinks', type: 'PARTY' as OrderType },
  { id: 'p5', name: 'Hot n Sour Soup', price: 555, category: 'Soup', type: 'PARTY' as OrderType },
  { id: 'p18', name: 'Paneer Butter Masala', price: 555, category: 'Paneer Ka Swad', type: 'PARTY' as OrderType },
  { id: 'p31', name: 'Dal Fry (Arhar)', price: 555, category: 'Dal Ki Rasoi', type: 'PARTY' as OrderType },
  { id: 'p40', name: 'Baby Naan', price: 555, category: 'Breads', type: 'PARTY' as OrderType },
];

const initialConfig: AppConfig = {
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
  dailyVegImageUrl: '',
  cookingRatePerMin: 3
};

// Helper functions for LocalStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Mock API Class
class MockApiService {
  private users: User[] = getFromStorage(USERS_KEY, initialUsers);
  private orders: Order[] = getFromStorage(ORDERS_KEY, []);
  private config: AppConfig = getFromStorage(CONFIG_KEY, initialConfig);
  private menu = getFromStorage(MENU_KEY, initialMenu);

  private credentials: Record<string, string> = {
    'admin': '123456',
    'chef': '12345',
    'm1': '12345',
    'user': '12345',
    'chef12': '12345',
  };

  constructor() {
    // Ensure the requested chef is in the users list
    const hasChef = this.users.some(u => u.id === 'chef');
    if (!hasChef) {
      this.users.push({ id: 'chef', role: UserRole.CHEF, name: 'Chef', surname: 'HC', email: 'chef@hc.com', phone: '12345', isVerified: true, isOnline: true });
    }
    
    // Ensure the requested user is in the users list
    const hasUser = this.users.some(u => u.id === 'user');
    if (!hasUser) {
      this.users.push({ id: 'user', role: UserRole.USER, name: 'Amit', surname: 'Kumar', email: 'user@gmail.com', phone: '7123456789', whatsapp: '7123456789', customerCode: 'CUST001', addresses: [{ id: '1', label: 'Home', address: '123 Main St' }], isVerified: true });
    }
    
    saveToStorage(USERS_KEY, this.users);
  }

  async login(email: string, password: string, role: UserRole): Promise<User> {
    const user = this.users.find(u => (u.id === email || u.email === email) && u.role === role);
    if (user) {
      const storedPass = this.credentials[user.id] || (user as any).password;
      if (storedPass === password) return user;
    }
    throw new Error("Invalid ID/Email or Password");
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
    } else {
      // Create new user if not found (Upsert)
      const newUser = { id, ...updates } as User;
      this.users.push(newUser);
      if ((updates as any).password) {
        this.credentials[id] = (updates as any).password;
      }
      saveToStorage(USERS_KEY, this.users);
      return newUser;
    }
    saveToStorage(USERS_KEY, this.users);
    return this.users[index];
  }

  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const total = orderData.totalAmount || 0;
    const newOrder: Order = {
      id: Date.now().toString(),
      bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      commissionChef: total * 0.7,
      commissionAdmin: total * 0.3,
      createdAt: new Date(),
      status: OrderStatus.PENDING,
      ...orderData as any
    };
    this.orders.push(newOrder);
    saveToStorage(ORDERS_KEY, this.orders);
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      saveToStorage(ORDERS_KEY, this.orders);
      return this.orders[index];
    }
    throw new Error("Order not found");
  }

  async getConfig(): Promise<AppConfig> {
    return this.config;
  }

  async updateConfig(updates: Partial<AppConfig>): Promise<AppConfig> {
    this.config = { ...this.config, ...updates };
    saveToStorage(CONFIG_KEY, this.config);
    return this.config;
  }

  async getMenu(): Promise<MenuItem[]> {
    return this.menu;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const index = this.menu.findIndex(m => m.id === id);
    if (index !== -1) {
      this.menu[index] = { ...this.menu[index], ...updates };
      saveToStorage(MENU_KEY, this.menu);
      return this.menu[index];
    }
    throw new Error("Menu item not found");
  }

  async createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      category: '',
      type: 'DAILY',
      ...item as any
    };
    this.menu.push(newItem);
    saveToStorage(MENU_KEY, this.menu);
    return newItem;
  }

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    return getFromStorage('hc_withdrawals', []);
  }

  async updateWithdrawal(id: string, updates: any): Promise<any> {
    const withdrawals = await this.getWithdrawals();
    const index = withdrawals.findIndex(w => w.id === id);
    if (index !== -1) {
      withdrawals[index] = { ...withdrawals[index], ...updates };
      saveToStorage('hc_withdrawals', withdrawals);
      return withdrawals[index];
    }
    throw new Error("Withdrawal not found");
  }

  async createWithdrawal(data: any): Promise<any> {
    const withdrawals = await this.getWithdrawals();
    const newW = {
        id: Date.now().toString(),
        ...data
    };
    withdrawals.push(newW);
    saveToStorage('hc_withdrawals', withdrawals);
    return newW;
  }

  async processPayment(amount: number, orderId: string, redirectUrl?: string): Promise<any> {
    // Simulate successful payment
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      this.orders[index].status = OrderStatus.PAID;
      saveToStorage(ORDERS_KEY, this.orders);
    }
    return {
      success: true,
      redirectUrl: redirectUrl || "/orders",
      orderId: "MOCK_" + orderId
    };
  }
}

export const api = new MockApiService();
