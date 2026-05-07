const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const menuController = require('./controllers/menuController');
const orderController = require('./controllers/orderController');
const masterController = require('./controllers/masterController');
const { authMiddleware, roleMiddleware } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Routes
// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/create-user', authMiddleware, roleMiddleware(['admin']), authController.createUser);

// Menu Routes
app.get('/api/categories', authMiddleware, menuController.getCategories);
app.post('/api/categories', authMiddleware, roleMiddleware(['admin']), menuController.createCategory);
app.put('/api/categories/:id', authMiddleware, roleMiddleware(['admin']), menuController.updateCategory);
app.delete('/api/categories/:id', authMiddleware, roleMiddleware(['admin']), menuController.deleteCategory);

app.get('/api/menu-items', authMiddleware, menuController.getMenuItems);
app.post('/api/menu-items', authMiddleware, roleMiddleware(['admin']), menuController.createMenuItem);
app.put('/api/menu-items/:id', authMiddleware, roleMiddleware(['admin']), menuController.updateMenuItem);
app.delete('/api/menu-items/:id', authMiddleware, roleMiddleware(['admin']), menuController.deleteMenuItem);

// Order Routes
app.post('/api/orders', authMiddleware, roleMiddleware(['cashier', 'admin']), orderController.createOrder);
app.get('/api/orders', authMiddleware, orderController.getOrders);
app.get('/api/orders/:id', authMiddleware, orderController.getOrderDetails);
app.put('/api/orders/:id/status', authMiddleware, orderController.updateOrderStatus);
app.get('/api/orders/:id/print', authMiddleware, orderController.printBill);
app.get('/api/kitchen-orders', authMiddleware, roleMiddleware(['kitchen']), orderController.getKitchenOrders);

// Tables Routes
app.get('/api/tables', authMiddleware, masterController.getTables);
app.put('/api/tables/:id/status', authMiddleware, masterController.updateTableStatus);

// Customers Routes
app.get('/api/customers', authMiddleware, masterController.getCustomers);
app.post('/api/customers', authMiddleware, roleMiddleware(['cashier', 'admin']), masterController.createCustomer);
app.delete('/api/customers/:id', authMiddleware, roleMiddleware(['admin']), masterController.deleteCustomer);

// Employees Routes
app.get('/api/employees/activities', authMiddleware, roleMiddleware(['admin']), masterController.getEmployeeActivities);
app.get('/api/employees/:id/details', authMiddleware, roleMiddleware(['admin']), masterController.getEmployeeDetails);
app.get('/api/employees', authMiddleware, roleMiddleware(['admin']), masterController.getEmployees);
app.post('/api/employees', authMiddleware, roleMiddleware(['admin']), masterController.createEmployee);
app.delete('/api/employees/:id', authMiddleware, roleMiddleware(['admin']), masterController.deleteEmployee);

// Settings Routes
app.get('/api/settings', authMiddleware, masterController.getSettings);
app.put('/api/settings', authMiddleware, roleMiddleware(['admin']), masterController.updateSettings);

// Dashboard & Reports
app.get('/api/dashboard-stats', authMiddleware, masterController.getDashboardStats);
app.get('/api/reports', authMiddleware, roleMiddleware(['admin']), masterController.getReports);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
