import fs from 'fs';
const content = fs.readFileSync('./src/panels/AdminPanel.tsx', 'utf-8');
const fixed = content.replace(/<\/motion\.div>\s+\{activeTab === 'config' && \(/, "<\/motion.div>\n          )}\n\n          {activeTab === 'config' && (");
fs.writeFileSync('./src/panels/AdminPanel.tsx', fixed);
