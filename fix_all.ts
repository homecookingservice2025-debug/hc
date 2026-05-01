import fs from 'fs';

// Fix AdminPanel.tsx duplicate imports and types
let adminContent = fs.readFileSync('./src/panels/AdminPanel.tsx', 'utf-8');
adminContent = adminContent.replace(/import \{ Bell, ShoppingBag, Eye \} from 'lucide-react';/g, '');
adminContent = adminContent.replace(/const \[orders, setOrders\] = useState<Order\[\]>\(\[\]\);/g, 'const [orders, setOrders] = useState<any[]>([]);');
fs.writeFileSync('./src/panels/AdminPanel.tsx', adminContent);

// Fix UserPanel.tsx OrderType import and loop
let userContent = fs.readFileSync('./src/panels/UserPanel.tsx', 'utf-8');
if (!userContent.includes('OrderType')) {
  userContent = userContent.replace(/import \{ User, Order, AppConfig, MenuItem, OrderStatus \} from '\.\.\/types';/, "import { User, Order, AppConfig, MenuItem, OrderStatus, OrderType } from '../types';");
}
fs.writeFileSync('./src/panels/UserPanel.tsx', userContent);

console.log('Post-processing complete');
