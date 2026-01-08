-- Revenue by Day
CREATE OR REPLACE VIEW view_revenue_daily AS
SELECT 
    date_trunc('day', created_at) as date,
    SUM(total_amount) as total_revenue,
    SUM(balance_paid) as revenue_received,
    COUNT(id) as order_count
FROM orders
WHERE status != 'cancelled'
GROUP BY 1
ORDER BY 1;

-- Top Products (by total quantity rented)
CREATE OR REPLACE VIEW view_popular_items AS
SELECT 
    p.name,
    SUM(oi.quantity) as total_rented,
    COUNT(DISTINCT oi.order_id) as order_frequency
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.name
ORDER BY total_rented DESC
LIMIT 10;

-- Order Status Distribution
CREATE OR REPLACE VIEW view_order_status_distribution AS
SELECT 
    status,
    COUNT(id) as count
FROM orders
GROUP BY status;

-- Monthly Growth
CREATE OR REPLACE VIEW view_revenue_monthly AS
SELECT 
    date_trunc('month', created_at) as month,
    SUM(total_amount) as total_revenue,
    COUNT(id) as order_count
FROM orders
WHERE status != 'cancelled'
GROUP BY 1
ORDER BY 1;
