export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  CHEF = 'CHEF',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type OrderType = 'DAILY' | 'PARTY' | 'CUSTOM';

export interface UserAddress {
  id: string;
  label: string;
  address: string;
  location?: string;
  googleLocation?: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  surname: string;
  email: string;
  phone: string;
  whatsapp?: string;
  customerCode?: string;
  address?: string;
  addresses?: UserAddress[];
  location?: {
    lat: number;
    lng: number;
  };
  googleLocation?: string;
  photo?: string;
  documents?: string[];
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
    upiPhoto?: string;
  };
  isVerified?: boolean;
  isOnline?: boolean;
  password?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: OrderType;
}

export interface Order {
  id: string;
  bookingId?: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  chefId?: string;
  chefName?: string;
  chefPhone?: string;
  type: OrderType;
  items: MenuItem[];
  status: OrderStatus;
  otp: string;
  address?: string;
  googleLocation?: string;
  startTime?: Date;
  endTime?: Date;
  totalAmount?: number;
  commissionChef?: number;
  commissionAdmin?: number;
  rating?: number;
  review?: string;
  createdAt: Date;
}

export interface WithdrawalRequest {
  id: string;
  chefId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

export interface AppConfig {
  logo?: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  upiId: string;
  mission?: string;
  vision?:string;
  aboutUs?: string;
  directorMessage?: string;
  directorName?: string;
  directorPhoto?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  homeBannerUrl?: string;
  homeBannerType?: 'image' | 'video' | 'gif';
  partyMenuImageUrl?: string;
  dailyVegImageUrl?: string;
  cookingRatePerMin?: number;
}
