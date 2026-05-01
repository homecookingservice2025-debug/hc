import fs from 'fs';
let userContent = fs.readFileSync('./src/panels/UserPanel.tsx', 'utf-8');
const search = /\{myOrders\.map\(order => \(\s+<OrderCard key=\{order\.id\} order=\{order\} config=\{config\} \/>\s+\)\)\}/;
const replace = "{myOrders.map(order => (\n                    <div key={order.id}>\n                      <OrderCard order={order} config={config!} />\n                    </div>\n                  ))}";
userContent = userContent.replace(search, replace);
fs.writeFileSync('./src/panels/UserPanel.tsx', userContent);
console.log('UserPanel fixed');
