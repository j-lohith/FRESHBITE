-- Create database if not exists
CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  profile_picture VARCHAR(255),
  membership_type ENUM('none', 'bronze', 'silver', 'gold') DEFAULT 'none',
  membership_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) DEFAULT 'Other',
  address_line TEXT NOT NULL,
  landmark VARCHAR(150),
  city VARCHAR(120),
  state VARCHAR(120),
  postal_code VARCHAR(20),
  country VARCHAR(120),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  place_id VARCHAR(120),
  formatted_address TEXT,
  instructions VARCHAR(255),
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(50),
  offer VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 4.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table for cart persistence
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_recipe (user_id, recipe_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'packed', 'on_the_way', 'arriving', 'delivered') DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  delivery_address TEXT,
  address_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES user_addresses(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  recipe_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Insert sample recipes (only if table is empty)
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Margherita Pizza' as name, 
  'Classic pizza with tomato sauce, mozzarella, and basil' as description, 
  120.99 as price, 
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' as image_url, 
  'Pizza' as category,
  '10% OFF' as offer,
  4.5 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Margherita Pizza');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Caesar Salad' as name, 
  'Fresh romaipricene lettuce with caesar dressing and parmesan' as description, 
  90.99 as price, 
  'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' as image_url, 
  'Salad' as category,
  '10% OFF' as offer,
  4.6 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Caesar Salad');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Grilled Salmon' as name, 
  'Fresh salmon grilled to perfection with vegetables' as description, 
  180.99 as price, 
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' as image_url, 
  'Main Course' as category,
  '15% OFF' as offer,
  4.7 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Grilled Salmon');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Chocolate Cake' as name, 
  'Rich chocolate cake with vanilla frosting' as description, 
  70.99 as price, 
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' as image_url, 
  'Dessert' as category,
  '10% OFF' as offer,
  4.7 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Chocolate Cake');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Chicken Burger' as name, 
  'Juicy chicken burger with fresh vegetables' as description, 
  110.99 as price, 
  'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400' as image_url, 
  'Burger' as category,
  '10% OFF' as offer,
  4.6 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Chicken Burger');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Pasta Carbonara' as name, 
  'Creamy pasta with bacon and parmesan cheese' as description, 
  140.99 as price, 
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' as image_url, 
  'Pasta' as category,
  '12% OFF' as offer,
  4.7 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Pasta Carbonara');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Mango Smoothie' as name, 
  'Fresh mango smoothie with yogurt' as description, 
  50.99 as price, 
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' as image_url, 
  'Beverage' as category,
  '10% OFF' as offer,
  4.6 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Mango Smoothie');

INSERT INTO recipes (name, description, price, image_url, category, offer, rating) 
SELECT * FROM (SELECT 
  'Vegetable Soup' as name, 
  'Homemade vegetable soup with fresh ingredients' as description, 
  80.99 as price, 
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' as image_url, 
  'Soup' as category,
  '10% OFF' as offer,
  4.5 as rating
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE name = 'Vegetable Soup');

-- Add more Pizza items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Pepperoni Pizza', 'Classic pepperoni with mozzarella cheese', 140.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 'Pizza', '15% OFF', 4.7),
('BBQ Chicken Pizza', 'Grilled chicken with BBQ sauce and red onions', 160.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 'Pizza', '20% OFF', 4.6),
('Veggie Supreme Pizza', 'Loaded with bell peppers, mushrooms, olives, and onions', 130.99, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400', 'Pizza', '12% OFF', 4.5),
('Hawaiian Pizza', 'Ham and pineapple with mozzarella', 150.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', 'Pizza', '10% OFF', 4.4),
('Four Cheese Pizza', 'Mozzarella, cheddar, parmesan, and gorgonzola', 170.99, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400', 'Pizza', '18% OFF', 4.8),
('Meat Lovers Pizza', 'Pepperoni, sausage, ham, and bacon', 180.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 'Pizza', '15% OFF', 4.7),
('Thin Crust Margherita', 'Thin crispy crust with fresh basil', 120.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'Pizza', '10% OFF', 4.6),
('Spicy Jalapeño Pizza', 'Jalapeños, spicy sauce, and mozzarella', 150.99, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400', 'Pizza', '12% OFF', 4.5),
('Truffle Mushroom Pizza', 'Gourmet truffle oil with wild mushrooms', 190.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', 'Pizza', '25% OFF', 4.9),
('Buffalo Chicken Pizza', 'Spicy buffalo chicken with blue cheese', 160.99, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400', 'Pizza', '15% OFF', 4.6)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Salad items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Greek Salad', 'Fresh vegetables with feta cheese and olives', 100.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Salad', '10% OFF', 4.6),
('Cobb Salad', 'Mixed greens with chicken, bacon, eggs, and avocado', 120.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad', '12% OFF', 4.7),
('Waldorf Salad', 'Apples, walnuts, celery, and grapes with mayo', 90.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Salad', '8% OFF', 4.5),
('Quinoa Salad', 'Protein-packed quinoa with vegetables', 110.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad', '10% OFF', 4.6),
('Caprese Salad', 'Fresh mozzarella, tomatoes, and basil', 109.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Salad', '10% OFF', 4.7),
('Asian Chicken Salad', 'Grilled chicken with Asian dressing', 139.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad', '15% OFF', 4.6),
('Spinach Salad', 'Fresh spinach with strawberries and almonds', 98.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Salad', '8% OFF', 4.5),
('Taco Salad', 'Mexican-style salad with ground beef', 128.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad', '12% OFF', 4.6),
('Mediterranean Salad', 'Mixed greens with olives, feta, and sun-dried tomatoes', 171.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Salad', '10% OFF', 4.7),
('Kale Caesar Salad', 'Kale with caesar dressing and parmesan', 108.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad', '10% OFF', 4.6)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Main Course items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Beef Steak', 'Tender grilled beef steak with herbs', 248.99, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 'Main Course', '20% OFF', 4.8),
('Chicken Tikka Masala', 'Creamy Indian curry with tender chicken', 168.99, 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400', 'Main Course', '15% OFF', 4.7),
('Fish and Chips', 'Crispy battered fish with golden fries', 195.99, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 'Main Course', '12% OFF', 4.6),
('Lamb Chops', 'Herb-crusted lamb chops with mint sauce', 292.99, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 'Main Course', '18% OFF', 4.8),
('Vegetable Stir Fry', 'Fresh vegetables in savory sauce', 103.99, 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400', 'Main Course', '10% OFF', 4.5),
('BBQ Ribs', 'Slow-cooked ribs with BBQ sauce', 190.99, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 'Main Course', '15% OFF', 4.7),
('Chicken Parmesan', 'Breaded chicken with marinara and mozzarella', 107.99, 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400', 'Main Course', '12% OFF', 4.6),
('Beef Lasagna', 'Layered pasta with beef and cheese', 106.99, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 'Main Course', '10% OFF', 4.6),
('Shrimp Scampi', 'Garlic butter shrimp with pasta', 188.99, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 'Main Course', '15% OFF', 4.7),
('Duck Confit', 'Slow-cooked duck leg with vegetables', 238.99, 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400', 'Main Course', '20% OFF', 4.8)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Dessert items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Tiramisu', 'Classic Italian coffee-flavored dessert', 88.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'Dessert', '10% OFF', 4.7),
('Cheesecake', 'Creamy New York style cheesecake',89.99, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400', 'Dessert', '12% OFF', 4.8),
('Apple Pie', 'Homemade apple pie with cinnamon', 75.99, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 'Dessert', '8% OFF', 4.6),
('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce', 66.99, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 'Dessert', '10% OFF', 4.5),
('Brownie', 'Warm chocolate brownie with ice cream',37.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', 'Dessert', '10% OFF', 4.7),
('Crème Brûlée', 'Classic French custard with caramelized sugar', 38.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'Dessert', '12% OFF', 4.8),
('Strawberry Shortcake', 'Fresh strawberries with whipped cream',58.99, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400', 'Dessert', '10% OFF', 4.6),
('Lemon Tart', 'Tangy lemon curd in buttery crust', 37.99, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 'Dessert', '8% OFF', 4.6),
('Red Velvet Cake', 'Moist red velvet with cream cheese frosting', 93.99, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 'Dessert', '12% OFF', 4.7),
('Panna Cotta', 'Italian cream dessert with berry sauce', 85.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', 'Dessert', '10% OFF', 4.6)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Burger items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, and onion', 512.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Burger', '10% OFF', 4.6),
('Bacon Cheeseburger', 'Beef patty with crispy bacon and cheese', 124.99, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', 'Burger', '12% OFF', 4.7),
('Veggie Burger', 'Plant-based patty with fresh vegetables', 121.99, 'https://images.unsplash.com/photo-1525059696034-4967a7290022?w=400', 'Burger', '10% OFF', 4.5),
('BBQ Burger', 'Beef patty with BBQ sauce and onion rings', 133.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Burger', '12% OFF', 4.6),
('Mushroom Swiss Burger', 'Beef patty with sautéed mushrooms and Swiss cheese', 144.99, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', 'Burger', '15% OFF', 4.7),
('Double Patty Burger', 'Two beef patties with special sauce', 516.99, 'https://images.unsplash.com/photo-1525059696034-4967a7290022?w=400', 'Burger', '15% OFF', 4.8),
('Turkey Burger', 'Lean turkey patty with avocado', 123.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Burger', '12% OFF', 4.6),
('Spicy Jalapeño Burger', 'Beef patty with jalapeños and spicy mayo', 123.99, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', 'Burger', '10% OFF', 4.6),
('Fish Burger', 'Crispy fish fillet with tartar sauce', 112.99, 'https://images.unsplash.com/photo-1525059696034-4967a7290022?w=400', 'Burger', '10% OFF', 4.5),
('Breakfast Burger', 'Beef patty with egg, bacon, and hash browns', 115.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Burger', '15% OFF', 4.7)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Pasta items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Spaghetti Bolognese', 'Classic meat sauce with spaghetti', 145.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'Pasta', '12% OFF', 4.7),
('Fettuccine Alfredo', 'Creamy alfredo sauce with fettuccine', 144.99, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400', 'Pasta', '10% OFF', 4.6),
('Penne Arrabbiata', 'Spicy tomato sauce with penne', 113.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'Pasta', '10% OFF', 4.6),
('Lasagna', 'Layered pasta with meat and cheese', 156.99, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400', 'Pasta', '15% OFF', 4.8),
('Ravioli', 'Stuffed pasta with ricotta and spinach', 155.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'Pasta', '12% OFF', 4.7),
('Mac and Cheese', 'Creamy macaroni with three cheeses', 125.99, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400', 'Pasta', '10% OFF', 4.6),
('Penne Vodka', 'Penne with creamy vodka sauce', 124.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'Pasta', '12% OFF', 4.6),
('Linguine with Clams', 'Fresh clams with white wine sauce', 127.99, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400', 'Pasta', '15% OFF', 4.7),
('Pesto Pasta', 'Basil pesto with your choice of pasta', 143.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 'Pasta', '10% OFF', 4.6),
('Chicken Parmesan Pasta', 'Breaded chicken with marinara over pasta', 156.99, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400', 'Pasta', '15% OFF', 4.7)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Beverage items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Fresh Orange Juice', 'Freshly squeezed orange juice', 14.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 'Beverage', '5% OFF', 4.5),
('Strawberry Smoothie', 'Fresh strawberries blended with yogurt', 62.99, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 'Beverage', '10% OFF', 4.6),
('Iced Coffee', 'Cold brew coffee with ice', 55.99, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', 'Beverage', '8% OFF', 4.5),
('Green Tea', 'Premium green tea', 3.99, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 'Beverage', '5% OFF', 4.4),
('Mojito (Non-alcoholic)', 'Fresh mint, lime, and soda', 52.99, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400', 'Beverage', '10% OFF', 4.6),
('Chocolate Milkshake', 'Rich chocolate milkshake', 36.99, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 'Beverage', '10% OFF', 4.7),
('Lemonade', 'Fresh lemonade with mint', 34.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 'Beverage', '8% OFF', 4.5),
('Cappuccino', 'Espresso with steamed milk foam', 55.99, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', 'Beverage', '8% OFF', 4.6),
('Berry Smoothie', 'Mixed berries with yogurt', 66.99, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 'Beverage', '10% OFF', 4.6),
('Iced Tea', 'Refreshing iced tea', 24.99, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 'Beverage', '5% OFF', 4.5)
ON DUPLICATE KEY UPDATE name=name;

-- Add more Soup items
INSERT INTO recipes (name, description, price, image_url, category, offer, rating) VALUES
('Tomato Soup', 'Creamy tomato soup with basil', 27.99, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Soup', '8% OFF', 4.6),
('Chicken Noodle Soup', 'Classic chicken soup with noodles', 259.99, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', 'Soup', '10% OFF', 4.7),
('French Onion Soup', 'Caramelized onions with cheese', 58.99, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Soup', '10% OFF', 4.6),
('Minestrone', 'Italian vegetable soup with pasta', 18.99, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', 'Soup', '8% OFF', 4.6),
('Cream of Mushroom', 'Rich and creamy mushroom soup', 27.99, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Soup', '8% OFF', 4.5),
('Lentil Soup', 'Hearty lentil soup with vegetables', 47.99, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', 'Soup', '8% OFF', 4.6),
('Clam Chowder', 'New England style clam chowder', 160.99, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Soup', '12% OFF', 4.7),
('Broccoli Cheddar', 'Creamy broccoli with cheddar cheese', 38.99, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', 'Soup', '10% OFF', 4.6),
('Thai Coconut Soup', 'Spicy coconut soup with vegetables', 59.99, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', 'Soup', '10% OFF', 4.7),
('Gazpacho', 'Cold Spanish tomato soup', 67.99, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', 'Soup', '8% OFF', 4.5)
ON DUPLICATE KEY UPDATE name=name;

