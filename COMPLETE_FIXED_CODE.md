# Complete Fixed Code - backend/scripts/initDatabase.js

## File Location
`backend/scripts/initDatabase.js`

## Full Code (Fixed Version)

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const SQL_STATEMENTS = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier', 'kitchen', 'manager') NOT NULL DEFAULT 'cashier',
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_category (category_id),
  INDEX idx_status (status)
);

-- Create tables (restaurant tables)
CREATE TABLE IF NOT EXISTS tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_number INT UNIQUE NOT NULL,
  seats INT NOT NULL,
  status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT,
  customer_id INT,
  user_id INT NOT NULL,
  order_status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_status (order_status),
  INDEX idx_payment (payment_status),
  INDEX idx_created (created_at)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
  INDEX idx_order (order_id)
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  position VARCHAR(100),
  salary DECIMAL(10, 2),
  hire_date DATE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_status (status)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
);

-- Insert default settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('restaurant_name', 'My Restaurant'),
('restaurant_phone', '+1234567890'),
('currency', 'USD'),
('tax_rate', '0.05');
`;

async function initDatabase() {
  let connection;
  try {
    console.log('\n========================================');
    console.log('  FoodHub - Database Initialization');
    console.log('========================================\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'restaurant_management',
      port: process.env.DB_PORT || 3306,
    };

    console.log('Connecting to database...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Database: ${dbConfig.database}\n`);

    connection = await mysql.createConnection(dbConfig);

    console.log('✅ Connected to database\n');
    console.log('Creating tables...\n');

    // Split statements and execute them one by one
    const statements = SQL_STATEMENTS.split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        const tableName = statement.match(/CREATE TABLE[^(]*/i)?.[0]?.trim() || 'Table';
        console.log(`  ✓ ${tableName}`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ℹ Table already exists`);
        } else {
          throw error;
        }
      }
    }

    await connection.end();

    console.log('\n========================================');
    console.log('✅ Database initialized successfully!');
    console.log('========================================\n');
    console.log('Next steps:');
    console.log('1. Run: node backend/scripts/createAdmin.js');
    console.log('2. Run: npm run dev');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.log('\n❌ Error initializing database:');
    console.log(error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();
```

## Key Fixes Applied

1. **Settings Table Column Names** (Line 126-138)
   - Changed: `key_name` → `setting_key`
   - Changed: `key_value` → `setting_value`
   - Removed: `description TEXT` field

2. **Settings Insert Statement** (Line 135-140)
   - Updated column names in INSERT statement
   - Removed description values
   - Aligned with database.sql schema

3. **Index Reference** (Line 131)
   - Changed: `INDEX idx_key (key_name)` → `INDEX idx_key (setting_key)`

## What Each Table Does

| Table | Purpose |
|-------|---------|
| **users** | Store user accounts (admin, cashier, kitchen, manager) |
| **categories** | Food categories (Beverages, Appetizers, etc.) |
| **menu_items** | Food items with prices and images |
| **tables** | Restaurant seating areas |
| **customers** | Customer information |
| **orders** | Order records with status tracking |
| **order_items** | Individual items in each order |
| **employees** | Employee details linked to users |
| **settings** | Restaurant configuration (name, phone, currency, tax) |

## Column Specifications

### Settings Table (Most Important - Where Error Was)

```sql
CREATE TABLE settings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  setting_key     VARCHAR(100) UNIQUE NOT NULL,    -- Configuration key
  setting_value   TEXT,                            -- Configuration value
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
);
```

**Default Values:**
```
setting_key: 'restaurant_name'      → setting_value: 'My Restaurant'
setting_key: 'restaurant_phone'     → setting_value: '+1234567890'
setting_key: 'currency'             → setting_value: 'USD'
setting_key: 'tax_rate'             → setting_value: '0.05'
```

## How to Use This Code

1. Replace existing `backend/scripts/initDatabase.js` with this code
2. Make sure `.env` file is in project root with:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=restaurant_management
   ```
3. Run: `cd backend && node scripts/initDatabase.js`
4. You should see all 9 tables created successfully

## Verification

After running the script, you should see:

```
✅ Connected to database

Creating tables...

  ✓ CREATE TABLE IF NOT EXISTS users
  ✓ CREATE TABLE IF NOT EXISTS categories
  ✓ CREATE TABLE IF NOT EXISTS menu_items
  ✓ CREATE TABLE IF NOT EXISTS tables
  ✓ CREATE TABLE IF NOT EXISTS customers
  ✓ CREATE TABLE IF NOT EXISTS orders
  ✓ CREATE TABLE IF NOT EXISTS order_items
  ✓ CREATE TABLE IF NOT EXISTS employees
  ✓ CREATE TABLE IF NOT EXISTS settings

✅ Database initialized successfully!
```

No more "Unknown column 'key_name'" error!

## Related Files

- `backend/database.sql` - Alternative SQL schema (matches the corrected initDatabase.js)
- `backend/scripts/createAdmin.js` - Script to create admin user
- `backend/server.js` - Express server configuration
- `.env` - Environment variables (must be created in project root)

## Windows PowerShell Commands

```powershell
# Navigate to project
cd C:\Users\ADMIN\Desktop\restuarant

# Create .env file (if not exists)
# Then edit it with your MySQL password

# Run database initialization
cd backend
node scripts/initDatabase.js

# Create admin user
node scripts/createAdmin.js

# Start backend
npm start

# In another PowerShell window, start frontend
cd ..
npx next dev
```

## Production Deployment

Before deploying:
1. Update DB credentials in `.env`
2. Change JWT_SECRET to a secure value
3. Update restaurant settings in database:
   ```sql
   UPDATE settings SET setting_value = 'Your Restaurant Name' WHERE setting_key = 'restaurant_name';
   UPDATE settings SET setting_value = 'Your Phone' WHERE setting_key = 'restaurant_phone';
   ```
4. Backup database regularly
5. Use environment variables for sensitive data
