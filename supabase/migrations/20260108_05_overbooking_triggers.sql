-- Trigger to check for overbooking when a reservation is added
CREATE OR REPLACE FUNCTION check_overbooking_on_reservation()
RETURNS TRIGGER AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT check_product_availability(NEW.product_id, NEW.start_date, NEW.end_date, NEW.quantity) INTO is_available;
    
    IF NOT is_available THEN
        -- Mark the order as overbooked
        UPDATE orders SET is_overbooked = true WHERE id = NEW.order_id;
        
        -- Create a notification
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'overbooked',
            'Overbooking Detected!',
            'Product ID ' || NEW.product_id || ' is overbooked for Order #' || UPPER(LEFT(NEW.order_id::text, 8)),
            '/admin/orders/' || NEW.order_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reservation_added
    AFTER INSERT ON rental_reservations
    FOR EACH ROW
    EXECUTE FUNCTION check_overbooking_on_reservation();

-- Trigger to check for low stock on inventory changes
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_available < 3 THEN -- Arbitrary threshold
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'low_stock',
            'Low Stock Warning',
            'Product ' || NEW.name || ' is running low (' || NEW.quantity_available || ' left)',
            '/admin/products/' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_stock_update
    AFTER UPDATE OF quantity_available ON products
    FOR EACH ROW
    WHEN (OLD.quantity_available IS DISTINCT FROM NEW.quantity_available)
    EXECUTE FUNCTION check_low_stock();
