-- Full public-schema dump from plux (bxktvrvpksxaijhdjegh)
-- Restore into NEW project srknqkrnwssnfaimrldm via:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f plux-full-db-for-new-supabase.sql
-- Or paste into Supabase SQL Editor (may need to split if size-limited).
-- Generated for PrimeLuxEvents beige Vercel cutover.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.11 (Ubuntu 17.11-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: delivery_schedule_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.delivery_schedule_status AS ENUM (
    'recommended',
    'pending_approval',
    'approved',
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: delivery_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.delivery_status AS ENUM (
    'scheduled',
    'loaded',
    'en_route',
    'arrived',
    'delivered',
    'failed',
    'returned'
);


--
-- Name: event_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_type AS ENUM (
    'wedding',
    'corporate',
    'birthday',
    'anniversary',
    'graduation',
    'holiday',
    'other'
);


--
-- Name: inventory_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.inventory_status AS ENUM (
    'available',
    'rented',
    'maintenance',
    'damaged',
    'retired'
);


--
-- Name: invitation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'cancelled'
);


--
-- Name: maintenance_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenance_priority AS ENUM (
    'routine',
    'preventive',
    'corrective',
    'emergency'
);


--
-- Name: maintenance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenance_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'delayed'
);


--
-- Name: maintenance_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenance_type AS ENUM (
    'cleaning',
    'repair',
    'painting',
    'inspection',
    'deep_clean',
    'refurbishment',
    'part_replacement',
    'calibration'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed',
    'read'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'in_preparation',
    'delivered',
    'completed',
    'cancelled'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'partial',
    'refunded',
    'failed'
);


--
-- Name: pick_list_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pick_list_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


--
-- Name: pick_list_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pick_list_type AS ENUM (
    'daily',
    'weekly',
    'event_specific'
);


--
-- Name: refund_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.refund_status AS ENUM (
    'pending',
    'processed',
    'failed'
);


--
-- Name: route_optimization_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.route_optimization_status AS ENUM (
    'pending',
    'optimizing',
    'optimized',
    'manual_override'
);


--
-- Name: schedule_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.schedule_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: schedule_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.schedule_type AS ENUM (
    'delivery',
    'setup',
    'breakdown',
    'admin',
    'maintenance'
);


--
-- Name: team_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.team_role AS ENUM (
    'super_admin',
    'admin',
    'manager',
    'staff',
    'coordinator',
    'designer'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'admin',
    'manager',
    'staff',
    'super_admin',
    'coordinator',
    'designer'
);


--
-- Name: venue_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.venue_status AS ENUM (
    'available',
    'booked',
    'maintenance',
    'unavailable'
);


--
-- Name: work_order_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_order_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


--
-- Name: work_order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_order_status AS ENUM (
    'pending',
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: create_low_stock_maintenance_task(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_low_stock_maintenance_task() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    warehouse_role_id uuid;
    existing_task_id uuid;
BEGIN
    IF NEW.quantity_available IS NULL OR NEW.quantity_available >= 3 THEN
        RETURN NEW;
    END IF;

    SELECT id INTO existing_task_id
    FROM tasks
    WHERE warehouse_category = 'inventory_maintenance'
      AND status IN ('pending', 'in_progress')
      AND meta_data->>'product_id' = NEW.id::text
    LIMIT 1;

    IF existing_task_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    SELECT id INTO warehouse_role_id FROM roles WHERE name = 'warehouse' LIMIT 1;

    INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        task_type,
        warehouse_category,
        assigned_role_id,
        due_date,
        meta_data
    ) VALUES (
        'Restock: ' || COALESCE(NEW.name, 'Product'),
        'Low stock alert — quantity available is ' || NEW.quantity_available,
        'pending',
        'high',
        'warehouse',
        'inventory_maintenance',
        warehouse_role_id,
        CURRENT_DATE,
        jsonb_build_object('product_id', NEW.id)
    );

    RETURN NEW;
END;
$$;


--
-- Name: customer_claim_orders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.customer_claim_orders() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_email text;
  v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_email := lower(auth.jwt() ->> 'email');
  IF v_email IS NULL OR length(v_email) = 0 THEN
    RETURN 0;
  END IF;

  UPDATE public.orders
  SET user_id = auth.uid()
  WHERE user_id IS NULL
    AND lower(customer_email) = v_email;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


--
-- Name: customer_sign_order(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.customer_sign_order(p_order_id uuid, p_signature_url text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_signature_url IS NULL OR length(trim(p_signature_url)) = 0 OR length(p_signature_url) > 2000 THEN
    RAISE EXCEPTION 'Invalid signature URL';
  END IF;

  v_email := lower(auth.jwt() ->> 'email');

  UPDATE public.orders
  SET
    signature_url = p_signature_url,
    signed_at = timezone('utc'::text, now())
  WHERE id = p_order_id
    AND (
      user_id = auth.uid()
      OR lower(customer_email) = v_email
      OR public.is_staff()
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not permitted';
  END IF;
END;
$$;


--
-- Name: get_user_by_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_by_email(email_input text) RETURNS TABLE(id uuid, email character varying)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email::varchar
  FROM auth.users au
  WHERE au.email = email_input;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
END;
$$;


--
-- Name: is_staff(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_staff() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF to_regclass('public.user_roles') IS NULL OR to_regclass('public.roles') IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
  );
END;
$$;


--
-- Name: notify_task_assignment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_task_assignment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    task_link text;
BEGIN
    IF NEW.task_type = 'warehouse' OR NEW.warehouse_category IS NOT NULL THEN
        task_link := '/admin/warehouse/schedule';
        IF NEW.due_date IS NOT NULL THEN
            task_link := task_link || '?date=' || NEW.due_date::text;
        END IF;
    ELSE
        task_link := '/admin/tasks';
    END IF;

    IF (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL) THEN
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'task_assigned',
            'New Task Assigned',
            'You have been assigned the task: ' || NEW.title,
            task_link
        );
    END IF;

    IF (TG_OP = 'INSERT' AND NEW.assigned_role_id IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND NEW.assigned_role_id IS DISTINCT FROM OLD.assigned_role_id AND NEW.assigned_role_id IS NOT NULL) THEN
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'role_task_assigned',
            'Team Task Assigned',
            'A new task has been assigned to your role: ' || NEW.title,
            task_link
        );
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: notify_warehouse_task_due(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_warehouse_task_due() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF (NEW.task_type = 'warehouse' OR NEW.warehouse_category IS NOT NULL)
       AND NEW.due_date = CURRENT_DATE
       AND NEW.status IN ('pending', 'in_progress') THEN
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'warehouse_task_due',
            'Warehouse Task Due Today',
            NEW.title || ' is due today.',
            '/admin/warehouse/schedule?date=' || NEW.due_date::text
        );
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: search_users(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_users(search_term text) RETURNS TABLE(id uuid, email text, full_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF search_term IS NULL OR length(trim(search_term)) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    up.id,
    up.email::text,
    up.full_name::text
  FROM user_profiles up
  WHERE
    up.email ILIKE '%' || search_term || '%'
    OR up.full_name ILIKE '%' || search_term || '%';
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text,
    link text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    parent_id uuid,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    key text NOT NULL,
    value text,
    type text DEFAULT 'text'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: delivery_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    delivery_tracking_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    notification_type character varying(50) NOT NULL,
    status public.notification_status DEFAULT 'pending'::public.notification_status,
    scheduled_for timestamp with time zone,
    sent_at timestamp with time zone,
    delivery_window_start timestamp with time zone,
    delivery_window_end timestamp with time zone,
    message_content text,
    channel character varying(20) DEFAULT 'email'::character varying,
    tracking_url character varying(500),
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: delivery_routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_routes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    delivery_schedule_id uuid NOT NULL,
    route_name character varying(255),
    optimization_status public.route_optimization_status DEFAULT 'pending'::public.route_optimization_status,
    total_distance_miles numeric(10,2),
    estimated_duration_minutes integer,
    fuel_cost_estimate_cents integer,
    optimization_algorithm character varying(50),
    optimization_score numeric(5,2),
    route_coordinates jsonb,
    waypoints jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: delivery_schedule_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_schedule_orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    delivery_schedule_id uuid NOT NULL,
    order_id uuid NOT NULL,
    route_order integer,
    estimated_arrival_time time without time zone,
    estimated_duration_minutes integer DEFAULT 30,
    distance_from_previous numeric(8,2),
    delivery_coordinates jsonb,
    special_instructions text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: delivery_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_schedules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    schedule_date date NOT NULL,
    time_slot character varying(50) NOT NULL,
    status public.delivery_schedule_status DEFAULT 'recommended'::public.delivery_schedule_status,
    total_deliveries integer DEFAULT 0,
    estimated_duration_minutes integer,
    estimated_distance_miles numeric(8,2),
    created_by_system boolean DEFAULT true,
    approved_by uuid,
    approved_at timestamp with time zone,
    assigned_to uuid,
    assigned_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: delivery_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_tracking (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    delivery_schedule_id uuid,
    driver_id uuid NOT NULL,
    status public.delivery_status DEFAULT 'scheduled'::public.delivery_status,
    scheduled_time timestamp with time zone,
    loaded_at timestamp with time zone,
    en_route_at timestamp with time zone,
    arrived_at timestamp with time zone,
    delivered_at timestamp with time zone,
    estimated_arrival_time timestamp with time zone,
    actual_arrival_time timestamp with time zone,
    current_location jsonb,
    delivery_notes text,
    customer_signature text,
    delivery_photos text[],
    failed_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: driver_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver_locations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    driver_id uuid NOT NULL,
    delivery_tracking_id uuid,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    accuracy numeric(8,2),
    speed numeric(8,2),
    heading numeric(5,2),
    recorded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    email_address character varying(255) NOT NULL,
    template_name character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    content text,
    status character varying(20) DEFAULT 'pending'::character varying,
    sent_at timestamp with time zone,
    error_message text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    serial_number character varying(100),
    status public.inventory_status DEFAULT 'available'::public.inventory_status,
    condition_notes text,
    purchase_date date,
    last_maintenance_date date,
    next_maintenance_date date,
    location character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_reservations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_item_id uuid NOT NULL,
    inventory_id uuid NOT NULL,
    reserved_from date NOT NULL,
    reserved_until date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: maintenance_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_checklists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    maintenance_type public.maintenance_type NOT NULL,
    checklist_items jsonb NOT NULL,
    frequency_days integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: maintenance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_records (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    inventory_id uuid NOT NULL,
    work_order_id uuid,
    maintenance_type public.maintenance_type NOT NULL,
    maintenance_priority public.maintenance_priority DEFAULT 'routine'::public.maintenance_priority,
    status public.maintenance_status DEFAULT 'scheduled'::public.maintenance_status,
    scheduled_date date NOT NULL,
    completed_date date,
    performed_by uuid,
    cost_cents integer,
    parts_used jsonb,
    condition_before text,
    condition_after text,
    photos_before text[],
    photos_after text[],
    notes text,
    next_maintenance_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price_cents integer NOT NULL,
    total_price_cents integer NOT NULL,
    special_instructions text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_promo_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_promo_codes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    promo_code_id uuid NOT NULL,
    discount_amount_cents integer NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status,
    event_date date NOT NULL,
    event_type public.event_type NOT NULL,
    event_description text,
    guest_count integer,
    delivery_address_line_1 character varying(255) NOT NULL,
    delivery_address_line_2 character varying(255),
    delivery_city character varying(100) NOT NULL,
    delivery_state character varying(50) NOT NULL,
    delivery_zip_code character varying(10) NOT NULL,
    delivery_notes text,
    subtotal_cents integer NOT NULL,
    delivery_fee_cents integer DEFAULT 0,
    setup_fee_cents integer DEFAULT 0,
    tax_amount_cents integer DEFAULT 0,
    discount_amount_cents integer DEFAULT 0,
    total_amount_cents integer NOT NULL,
    deposit_amount_cents integer DEFAULT 0,
    balance_due_cents integer NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    delivery_date date,
    pickup_date date,
    delivery_time_slot character varying(50),
    setup_crew_size integer DEFAULT 2,
    has_stairs boolean DEFAULT false,
    floor_level integer DEFAULT 0,
    access_difficulty character varying(20) DEFAULT 'easy'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    partner_id uuid,
    partner_shared_cart_id uuid,
    billing_party text DEFAULT 'customer'::text,
    client_can_pay boolean DEFAULT true NOT NULL,
    CONSTRAINT orders_billing_party_check CHECK ((billing_party = ANY (ARRAY['customer'::text, 'partner'::text])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    role public.user_role DEFAULT 'customer'::public.user_role,
    department character varying(100),
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret character varying(32),
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.order_summary AS
 SELECT o.id,
    o.order_number,
    o.status,
    o.event_date,
    o.total_amount_cents,
    (((u.first_name)::text || ' '::text) || (u.last_name)::text) AS customer_name,
    u.email AS customer_email,
    count(oi.id) AS item_count
   FROM ((public.orders o
     JOIN public.users u ON ((o.user_id = u.id)))
     LEFT JOIN public.order_items oi ON ((o.id = oi.order_id)))
  GROUP BY o.id, o.order_number, o.status, o.event_date, o.total_amount_cents, u.first_name, u.last_name, u.email;


--
-- Name: partner_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_profiles (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    company_name text NOT NULL,
    business_type text DEFAULT 'planner'::text NOT NULL,
    website text,
    instagram text,
    phone text,
    status text DEFAULT 'pending'::text NOT NULL,
    tier text DEFAULT 'preferred'::text NOT NULL,
    base_discount_percent integer,
    notes text,
    payment_zelle text,
    payment_venmo text,
    payment_apple_cash text,
    payment_cash_app text,
    payment_other_label text,
    payment_other_value text,
    payment_instructions text,
    approved_at timestamp with time zone,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_display_name text,
    brand_logo_url text,
    brand_accent_color text DEFAULT '#1c1917'::text,
    brand_tagline text,
    business_email text,
    business_address text,
    business_city text,
    business_region text,
    business_postal text,
    invoice_footer_note text,
    CONSTRAINT partner_profiles_base_discount_percent_check CHECK (((base_discount_percent IS NULL) OR ((base_discount_percent >= 0) AND (base_discount_percent <= 100)))),
    CONSTRAINT partner_profiles_business_type_check CHECK ((business_type = ANY (ARRAY['planner'::text, 'decorator'::text, 'designer'::text, 'other'::text]))),
    CONSTRAINT partner_profiles_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text, 'revoked'::text]))),
    CONSTRAINT partner_profiles_tier_check CHECK ((tier = ANY (ARRAY['preferred'::text, 'elite'::text, 'house'::text])))
);


--
-- Name: partner_shared_carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_shared_carts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    partner_id uuid NOT NULL,
    share_token text NOT NULL,
    title text,
    client_name text NOT NULL,
    client_email text,
    client_phone text,
    event_date date,
    event_type text,
    venue_address text,
    delivery_address text,
    delivery_date date,
    delivery_time text,
    pickup_date date,
    pickup_time text,
    same_day_pickup boolean DEFAULT false,
    notes text,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    retail_subtotal integer DEFAULT 0 NOT NULL,
    retail_setup_fee integer DEFAULT 0 NOT NULL,
    retail_tax_amount integer DEFAULT 0 NOT NULL,
    retail_delivery_fee integer DEFAULT 0 NOT NULL,
    retail_total integer DEFAULT 0 NOT NULL,
    trade_discount_amount integer DEFAULT 0 NOT NULL,
    trade_discount_name text,
    trade_subtotal integer DEFAULT 0 NOT NULL,
    trade_tax_amount integer DEFAULT 0 NOT NULL,
    trade_total integer DEFAULT 0 NOT NULL,
    tax_rate numeric,
    status text DEFAULT 'draft'::text NOT NULL,
    order_id uuid,
    expires_at timestamp with time zone,
    shared_at timestamp with time zone,
    settled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT partner_shared_carts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'shared'::text, 'accepted'::text, 'settled'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: partner_tier_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_tier_settings (
    tier text NOT NULL,
    label text NOT NULL,
    base_discount_percent integer NOT NULL,
    hold_hours integer DEFAULT 72 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT partner_tier_settings_base_discount_percent_check CHECK (((base_discount_percent >= 0) AND (base_discount_percent <= 100))),
    CONSTRAINT partner_tier_settings_tier_check CHECK ((tier = ANY (ARRAY['preferred'::text, 'elite'::text, 'house'::text])))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid,
    venue_booking_id uuid,
    payment_intent_id character varying(255),
    amount_cents integer NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method character varying(50),
    transaction_id character varying(255),
    gateway_response jsonb,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    resource text NOT NULL,
    action text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: pick_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pick_list_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    pick_list_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    location character varying(255),
    picked_quantity integer DEFAULT 0,
    notes text,
    order_id uuid
);


--
-- Name: pick_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pick_lists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    list_date date NOT NULL,
    list_type public.pick_list_type NOT NULL,
    status public.pick_list_status DEFAULT 'pending'::public.pick_list_status,
    created_by uuid,
    assigned_to uuid,
    completed_by uuid,
    completed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    category_id uuid,
    sku character varying(100) NOT NULL,
    price_cents integer NOT NULL,
    cost_cents integer,
    weight numeric(8,2),
    dimensions_length numeric(8,2),
    dimensions_width numeric(8,2),
    dimensions_height numeric(8,2),
    setup_time integer,
    requires_special_handling boolean DEFAULT false,
    minimum_rental_period integer DEFAULT 1,
    image_url character varying(500),
    gallery_images text[],
    specifications jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    quantity_available integer DEFAULT 1,
    quantity_reserved integer DEFAULT 0
);


--
-- Name: product_availability; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.product_availability AS
 SELECT p.id,
    p.name,
    p.sku,
    p.price_cents,
    count(i.id) AS total_inventory,
    count(
        CASE
            WHEN (i.status = 'available'::public.inventory_status) THEN 1
            ELSE NULL::integer
        END) AS available_count,
    count(
        CASE
            WHEN (i.status = 'rented'::public.inventory_status) THEN 1
            ELSE NULL::integer
        END) AS rented_count,
    count(
        CASE
            WHEN (i.status = 'maintenance'::public.inventory_status) THEN 1
            ELSE NULL::integer
        END) AS maintenance_count
   FROM (public.products p
     LEFT JOIN public.inventory i ON ((p.id = i.product_id)))
  WHERE (p.is_active = true)
  GROUP BY p.id, p.name, p.sku, p.price_cents;


--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promo_codes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value_cents integer NOT NULL,
    minimum_order_amount_cents integer DEFAULT 0,
    max_uses integer,
    used_count integer DEFAULT 0,
    valid_from date NOT NULL,
    valid_until date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    payment_id uuid NOT NULL,
    order_id uuid,
    amount_cents integer NOT NULL,
    reason text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status public.refund_status DEFAULT 'pending'::public.refund_status
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid,
    permission_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    color text DEFAULT '#6366f1'::text,
    is_system_role boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: staff_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_permissions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    permission_key character varying(100) NOT NULL,
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: staff_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    shift_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text,
    priority text DEFAULT 'medium'::text,
    task_type text DEFAULT 'general'::text,
    event_id uuid,
    order_id uuid,
    assigned_to uuid,
    assigned_to_text text,
    assigned_role_id uuid,
    created_by uuid,
    created_by_text text,
    due_date date,
    due_time time without time zone,
    scheduled_start time without time zone,
    estimated_minutes integer,
    completed_at timestamp with time zone,
    completed_by uuid,
    completion_image_url text,
    completion_notes text,
    route_order integer,
    delivery_items jsonb DEFAULT '[]'::jsonb,
    meta_data jsonb DEFAULT '{}'::jsonb,
    checklist jsonb DEFAULT '[]'::jsonb,
    warehouse_category text,
    parent_task_id uuid,
    is_recurring boolean DEFAULT false,
    recurrence_rule text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT tasks_task_type_check CHECK ((task_type = ANY (ARRAY['general'::text, 'event'::text, 'delivery'::text, 'warehouse'::text, 'office'::text, 'venue'::text, 'return_trip'::text])))
);


--
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tasks IS 'Comprehensive tasks table for deliveries, warehouse work, and general ops';


--
-- Name: COLUMN tasks.checklist; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.checklist IS 'JSON array of checklist items with completion state';


--
-- Name: COLUMN tasks.warehouse_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tasks.warehouse_category IS 'Warehouse task subtype for schedule filtering';


--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_invitations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    invited_by uuid NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    role public.team_role NOT NULL,
    permissions text[] DEFAULT ARRAY[]::text[],
    department character varying(100),
    invitation_token character varying(255) NOT NULL,
    notes text,
    status public.invitation_status DEFAULT 'pending'::public.invitation_status,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    accepted_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tour_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_progress (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    tour_type character varying(50) NOT NULL,
    current_step integer DEFAULT 0,
    total_steps integer NOT NULL,
    completed_steps integer[] DEFAULT ARRAY[]::integer[],
    is_completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    last_active_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    address_line_1 character varying(255) NOT NULL,
    address_line_2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(50) NOT NULL,
    zip_code character varying(10) NOT NULL,
    country character varying(50) DEFAULT 'United States'::character varying,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorites (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    language_code character varying(10) DEFAULT 'en'::character varying,
    timezone character varying(50) DEFAULT 'America/New_York'::character varying,
    tour_completed boolean DEFAULT false,
    tour_completed_at timestamp with time zone,
    notification_preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    phone text,
    job_title text,
    department text,
    hire_date date,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    role_id uuid,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: venue_bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venue_bookings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    venue_id uuid NOT NULL,
    user_id uuid NOT NULL,
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    guest_count integer NOT NULL,
    event_type public.event_type NOT NULL,
    status public.venue_status DEFAULT 'available'::public.venue_status,
    special_requirements text,
    total_cost_cents integer NOT NULL,
    deposit_amount_cents integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: venues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venues (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    address_line_1 character varying(255) NOT NULL,
    address_line_2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(50) NOT NULL,
    zip_code character varying(10) NOT NULL,
    capacity_min integer NOT NULL,
    capacity_max integer NOT NULL,
    base_price_cents integer NOT NULL,
    hourly_rate_cents integer,
    amenities text[],
    images text[],
    floor_plan_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: warehouse_task_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouse_task_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    warehouse_category text NOT NULL,
    description text,
    assigned_role_id uuid,
    recurrence_rule text NOT NULL,
    checklist jsonb DEFAULT '[]'::jsonb,
    estimated_minutes integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid,
    inventory_id uuid,
    title character varying(255) NOT NULL,
    description text,
    work_type public.schedule_type NOT NULL,
    maintenance_type public.maintenance_type,
    maintenance_priority public.maintenance_priority,
    priority public.work_order_priority DEFAULT 'medium'::public.work_order_priority,
    status public.work_order_status DEFAULT 'pending'::public.work_order_status,
    assigned_to uuid,
    estimated_hours numeric(4,2),
    actual_hours numeric(4,2),
    estimated_cost_cents integer,
    actual_cost_cents integer,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    assigned_by uuid,
    before_condition_notes text,
    after_condition_notes text,
    parts_used jsonb,
    materials_used jsonb,
    maintenance_photos text[],
    next_maintenance_due date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: work_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_schedules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    staff_id uuid NOT NULL,
    schedule_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    schedule_type public.schedule_type NOT NULL,
    status public.schedule_status DEFAULT 'scheduled'::public.schedule_status,
    location character varying(255),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('8c6fc077-2f8a-40d2-bb48-cac13be3ac3f', 'Tents & Canopies', 'tents-canopies', 'High-quality tents and canopies for outdoor events', NULL, 1, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('5d8b6034-9fa4-4bdb-a563-076a5902c632', 'Tables', 'tables', 'Elegant tables for all types of events', NULL, 2, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('be3a4ac5-84df-4c55-991e-37b9b0cdff92', 'Seating', 'seating', 'Comfortable and stylish seating options', NULL, 3, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('eaf595fe-543d-458e-b5de-4aabb5cfaf5a', 'Lighting', 'lighting', 'Professional lighting solutions', NULL, 4, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('ed1e6eec-843c-4fd6-8a89-81fdde53c607', 'Linens & Draping', 'linens-draping', 'Luxury linens and fabric draping', NULL, 5, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('92d6fdc7-b0a1-45bb-9689-808df6a56c8e', 'Bar & Catering', 'bar-catering', 'Bar setups and catering equipment', NULL, 6, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('0760e400-f435-4313-90d9-d188941be948', 'Decor & Accessories', 'decor-accessories', 'Decorative items and event accessories', NULL, 7, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('6f94caba-14ff-42ea-97d4-fff74802dc5a', 'Dance Floors', 'dance-floors', 'Professional dance floors and staging', NULL, 8, true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'Backdrops & Panels', 'backdrops-panels', 'Backdrops & Panels rental.', NULL, 100, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('0f40ee1b-212d-48e8-acd4-4c16bcdac978', 'Flower Walls', 'flower-walls', 'Flower Walls rental.', NULL, 101, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('c509f672-2463-46db-85d8-73c29112797c', 'Shimmer Walls', 'shimmer-walls', 'Shimmer Walls rental.', NULL, 102, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('9a012d58-8c10-4d34-935d-46459d933740', 'Soft Touch Walls', 'soft-touch-walls', 'Soft Touch Walls rental.', NULL, 103, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('1707c002-5fe3-49a9-924c-ff7ac503b754', 'Bar Counters', 'bar-counters', 'Bar Counters rental.', NULL, 104, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('f675ad56-4e10-46bd-bd69-1741b96b5495', 'Bar Stools', 'bar-stools', 'Bar Stools rental.', NULL, 105, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('4fd0bdec-6340-49ab-984b-3ef410333037', 'Bar Tables', 'bar-tables', 'Bar Tables rental.', NULL, 106, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('16914ca3-474c-49a2-a503-26033f190888', 'Benches & Ottomans', 'benches-ottomans', 'Benches & Ottomans rental.', NULL, 107, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('58ed7eca-8957-4f24-a723-15efe03479e3', 'Cake Tables & Stands', 'cake-tables-stands', 'Cake Tables & Stands rental.', NULL, 108, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('4a7626f7-8bf5-4f7a-9870-162340ca6e17', 'Chafing Dishes', 'chafing-dishes', 'Chafing Dishes rental.', NULL, 109, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('64707572-161e-448c-923a-d367c1a21ce4', 'Cooking & Prep', 'cooking-prep', 'Cooking & Prep rental.', NULL, 110, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'Decorations & Props', 'decorations-props', 'Decorations & Props rental.', NULL, 111, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('5a2e15b5-a45c-4f37-a030-e548b6d69ad7', 'Flooring & Staging', 'flooring-staging', 'Flooring & Staging rental.', NULL, 112, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('06bda734-1787-45d7-98a5-6dd19bd8a18f', 'Chairs', 'chairs', 'Chairs rental.', NULL, 113, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('6b784ad8-1d87-41e0-94eb-1797b5681082', 'Sofas & Loveseats', 'sofas-loveseats', 'Sofas & Loveseats rental.', NULL, 114, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('45abc142-0f76-440a-80f9-3c0528474878', 'Kids Backdrops', 'kids-backdrops', 'Kids Backdrops rental.', NULL, 115, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('1ea7c48a-2dc0-4712-9bd0-8e123ae750e2', 'Kids Chairs', 'kids-chairs', 'Kids Chairs rental.', NULL, 116, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('940ba7fa-fe0c-4a16-83b8-883fe682ffca', 'Kids Tables', 'kids-tables', 'Kids Tables rental.', NULL, 117, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('d6ba76a3-2f34-49cf-8a8f-e78181020b4f', 'Kids Thrones', 'kids-thrones', 'Kids Thrones rental.', NULL, 118, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('9451dd7e-1dbc-4085-b64e-1c7b60ac564c', 'LED Signs', 'led-signs', 'LED Signs rental.', NULL, 119, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'Lit Letters & Numbers', 'lit-letters-and-numbers', 'Lit Letters & Numbers rental.', NULL, 120, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('4c1d4175-099b-4deb-876d-16b37b972444', 'Luxury Thrones', 'thrones', 'Luxury Thrones rental.', NULL, 121, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'Misc', 'misc', 'Misc rental.', NULL, 122, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'Pedestals & Plinths', 'pedestals-plinths', 'Pedestals & Plinths rental.', NULL, 123, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('15d31198-66fb-4abf-b8a7-91f88e6502b1', 'Shelves', 'shelves', 'Shelves rental.', NULL, 124, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('05ce8e78-c7e9-4fad-b3e6-6e9f4972ff32', 'Sweets Carts', 'sweets-carts', 'Sweets Carts rental.', NULL, 125, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('c7a98428-bda4-404a-92c4-25f3c2cc3252', 'Charger Plates', 'charger-plates', 'Charger Plates rental.', NULL, 126, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('7d6939be-c8e4-4771-918f-9a1f42d71a16', 'Dinnerware', 'dinnerware', 'Dinnerware rental.', NULL, 127, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'Flowers & Centerpieces', 'centerpeices-2', 'Flowers & Centerpieces rental.', NULL, 128, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('075f52d8-e10b-420b-89a9-d8c58fddbd68', 'Table Linens', 'table-linens', 'Table Linens rental.', NULL, 129, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'Napkins & Rings', 'table-napkins-and-rings', 'Napkins & Rings rental.', NULL, 130, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('18f26338-231e-4780-b22d-c472c6fb18c8', 'Tables', 'dining-tables', 'Tables rental.', NULL, 131, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'Tents', 'tent', 'Tents rental.', NULL, 132, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('a2d3f735-a303-41cf-86a8-e38321d05d64', 'Buffet Service', 'buffet-service', 'Buffet Service rental.', NULL, 133, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'Glassware', 'glasswear', 'Glassware rental.', NULL, 134, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('66b21615-e23f-439b-8706-c3d0243f697f', 'Chargers', 'chargers', 'Chargers rental.', NULL, 135, true, '2026-08-27 01:47:02.041958+00');
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order, is_active, created_at) VALUES ('5d610c5b-01f9-40f3-bfc0-e67ce438f85f', 'Table Settings', 'table-settings', 'Table Settings rental.', NULL, 136, true, '2026-08-27 01:47:02.041958+00');


--
-- Data for Name: content; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('42885eb9-7142-4558-88c6-261af849a0ce', 'about.hero.title', 'Curating Extraordinary Moments', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('33a29082-03b2-4565-8060-f13ccdb6d606', 'about.hero.description', 'PrimeLux Events is the premier destination for luxury event rentals, bringing your vision to life with our curated collection of exquisite furniture and decor.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('821e39d2-2e7b-4d11-9935-00e457708494', 'about.hero.image', '/luxury-event-setup-ballroom-chandelier.jpg', 'image', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('7c6e55f5-7c7e-493f-831c-8efe90b85b32', 'about.story.title', 'Our Story', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('01ff3e1c-1381-4e09-9942-ed65a549bc61', 'about.story.p1', 'Founded in 2010, PrimeLux Events began with a simple mission: to elevate the standard of event rentals.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('6815a8f3-0d14-4e8c-9acf-1617eb79d0d8', 'about.story.p2', 'Over the past decade, we have grown from a small boutique collection to a comprehensive design house.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('ea9643a1-d236-4204-bdb3-23c11839cc8d', 'about.story.p3', 'Our commitment goes beyond inventory. We believe in the art of hospitality.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('961e2dfe-81e1-44fb-b8d3-6ffca2b94aca', 'about.story.image', '/elegant-wedding-reception-table-setting.jpg', 'image', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('659e36d8-76b0-40b7-82ba-c238efcfa1d7', 'about.values.title', 'The PrimeLux Standard', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('e2cb8d08-aaf9-46be-bafd-03e331af17e3', 'about.values.description', 'We hold ourselves to the highest standards of quality and service.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('54827d71-0999-4bd7-9284-04ae31cd5566', 'about.values.items', '[{"title":"Curated Excellence","description":"Every piece is hand-selected for design and craftsmanship."},{"title":"Impeccable Maintenance","description":"Inventory is inspected after every event."},{"title":"Seamless Logistics","description":"Our team handles delivery and setup."}]', 'json', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('ca7e0214-cdf6-4e22-847d-bd76aba9eee3', 'about.cta.title', 'Ready to elevate your event?', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('d526a2e7-5d55-46ad-89f1-9455f3a46668', 'about.cta.description', 'Browse our collection and build your quote online instantly.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('5ebc8764-88df-4f78-8f82-cb8590b7e776', 'about.cta.primary', 'Start Your Quote', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('e4d1cca4-fa12-4bf5-8345-f128c45c091c', 'about.cta.secondary', 'Contact Support', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('f4b986a6-aa82-42d0-b050-ada0ef891565', 'contact.hero.title', 'Get in Touch', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('67fc651e-3ea3-43c3-99e3-c5d712bd533f', 'contact.hero.description', 'We''d love to hear about your upcoming event. Our showroom is open by appointment.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('d0e2f151-d580-4f4d-b44b-6c05ff806914', 'contact.info.address.title', 'Visit Our Showroom', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('1cd4d8a6-6d30-4884-9398-3cdd77d2ba7e', 'contact.info.address.value', '123 Luxury Lane, Suite 100\nBeverly Hills, CA 90210', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('1e51466b-2d4d-4517-9ab0-de0971c255d4', 'contact.info.address.hours', 'By Appointment Only', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('b6b0254a-9c2d-423f-b7fe-ab6050f7c773', 'contact.info.phone.title', 'Call Us', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('9df734e9-b23e-458d-99a1-600251212080', 'contact.info.phone.value', '(310) 555-0123', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('9af8354e-831d-4570-b2e4-55145e830aba', 'contact.info.phone.hours', 'Mon-Fri: 9am - 6pm', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('48309b1b-0112-4a99-a8c2-e61c34f0e7ae', 'contact.info.email.title', 'Email Us', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('1e19749f-a56b-4d55-83de-359dcfb89056', 'contact.info.email.value', 'hello@primeluxevents.com', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('61419f1c-c4fc-4d23-9502-555a55e9dfa7', 'contact.form.title', 'Send us a Message', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('0d88a66c-15c0-425c-befd-49944573b2b8', 'howitworks.hero.title', 'The PrimeLux Experience', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('ab9be2e1-2fd3-469a-888f-a78c75731d3b', 'howitworks.hero.description', 'From browsing to booking, control every detail of your event rentals online.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('3c3d6b5a-fbcd-4e27-8439-b5310a3c466a', 'howitworks.steps.list', '[{"title":"Browse & Select","description":"Explore our catalog and add items to your cart.","details":["Real-Time Availability","Detailed Specs"],"image":"/open-planner.png"},{"title":"Build Your Quote","description":"Adjust quantities and dates in your cart.","details":["Instant Pricing","Self-Service"],"image":"/design-consultation.jpg"},{"title":"Secure Reservation","description":"Book with a deposit through our portal.","details":["Instant Booking","Secure Payment"],"image":"/concierge-service.jpg"}]', 'json', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('e8433228-8fb0-433a-ab35-edc417290419', 'howitworks.concierge.title', 'Need a Custom Touch?', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('2e183ed8-976b-4236-b48a-ce596496a66a', 'howitworks.concierge.description', 'Our Concierge Team is available for large-scale productions.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('d4c591a5-3761-4878-8637-29cca5164da4', 'howitworks.concierge.button', 'Contact Concierge', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('23a93d56-9da1-4616-8e18-30b3e2d0168c', 'howitworks.concierge.list.title', 'What We Offer', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('d77ae8ec-9f5e-48f6-b870-1abef528f9f1', 'howitworks.concierge.list.item1', 'Custom furniture sourcing', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('1e65a56d-8304-4220-9358-a13306d99e34', 'howitworks.concierge.list.item2', 'Complex event logistics coordination', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('3f673b69-c024-4a8c-bdea-930d6fd46774', 'howitworks.concierge.list.item3', 'Dedicated event planning support', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('f3f46233-442b-4933-8136-986bdfc18255', 'howitworks.faq.title', 'Common Questions', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('10862576-dce0-4275-9297-490a0c69765a', 'howitworks.faq.description', 'Everything you need to know about renting with us.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('b5f53670-daf2-4b07-973e-bd77362281f7', 'howitworks.faq.button', 'View All FAQs', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('3e77ef6f-4be2-4678-afb3-45a5e5c19bac', 'howitworks.faq.list', '[{"question":"Can I book everything online?","answer":"Yes — browse, quote, and reserve entirely online."},{"question":"How far in advance should I book?","answer":"6–9 months is ideal for peak season."}]', 'json', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('d0c6ffcf-4e1e-40c4-b822-dd36f8eb2a8b', 'gallery.hero.title', 'Our Portfolio', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('f3f97a45-9fcf-4fb7-a4cc-ed232ef6a1a6', 'gallery.hero.description', 'Explore a curated selection of our most memorable events.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('16c18c51-fb63-4c64-8de6-d427633629ec', 'gallery.images', '[{"id":"1","src":"/luxury-event-setup-ballroom-chandelier.jpg","alt":"Grand Ballroom Wedding","category":"Weddings"},{"id":"2","src":"/elegant-wedding-reception-table-setting.jpg","alt":"Outdoor Garden Reception","category":"Weddings"}]', 'json', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('81fcb9fb-e989-4097-b768-b6676328305b', 'journal.hero.title', 'The Edit', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('cdbdf856-1805-4e47-9ce5-ec14397f3ea0', 'journal.hero.description', 'Trends, inspiration, and expert advice from the world of luxury events.', 'text', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');
INSERT INTO public.content (id, key, value, type, created_at, updated_at) VALUES ('866852b0-66e7-4566-9e9d-6d854d046c8e', 'journal.posts', '[{"id":"1","title":"2025 Wedding Trends","excerpt":"Discover why maximalism is making a comeback.","date":"October 12, 2024","image":"/luxury-event-setup-ballroom-chandelier.jpg","category":"Trends"}]', 'json', '2026-08-27 12:32:46.205717+00', '2026-08-27 12:32:46.205717+00');


--
-- Data for Name: delivery_notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: delivery_routes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: delivery_schedule_orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: delivery_schedules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: delivery_tracking; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: driver_locations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: email_notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('02c0a86d-1017-47fd-9a78-637b78de61aa', '2a108558-ebf5-44d0-8732-393fca29cdd4', 'TENT-40X60-LUX-001', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('089cd246-1da3-40f2-b4c0-5fac1513a360', '2a108558-ebf5-44d0-8732-393fca29cdd4', 'TENT-40X60-LUX-002', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5e862bd7-1249-4752-8579-63a3c464cf92', '2a108558-ebf5-44d0-8732-393fca29cdd4', 'TENT-40X60-LUX-003', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e1aeb97d-2efa-4b49-949c-37358ae8b376', '2a108558-ebf5-44d0-8732-393fca29cdd4', 'TENT-40X60-LUX-004', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9b3edff9-67aa-4d07-a07c-f592e41f02c2', '2a108558-ebf5-44d0-8732-393fca29cdd4', 'TENT-40X60-LUX-005', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('056f8c47-aff5-4706-903b-d6f58102031b', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-001', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('306b2ffe-cca4-4197-8a47-bb3c43f720c8', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-002', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3743835b-bd8a-4649-825b-1338827a7bf8', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-003', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5914a7ab-19ec-41af-8a40-4a2375afad56', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-004', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2568f34a-05cf-4fa0-b146-f43db6239363', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-005', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9321c945-6127-4992-aeaf-1e5b0d1fd0d9', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-006', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2f131abf-8742-4bbd-9e4b-d8d186375f4c', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-007', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('70d80755-81e3-4da2-b957-e047d1ade3f2', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-008', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f6436746-2fc3-4e7a-9d41-76e3fb22156b', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-009', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f73f4ea1-4f6f-4935-8dd2-3a05193712e8', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-010', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c89a8566-840b-41c5-b57d-fe3993371f8f', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-011', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ccc3cfec-5a5b-421d-bf9f-ce5968b7d882', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-012', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('15c9f659-5613-4770-a647-421baf504b5d', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-013', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d4e0da12-7d52-41e0-9736-5d26b1277479', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-014', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6fbc75ab-87bb-4937-95f0-72a0dd27ebb5', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-015', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a089a1d6-fdce-4d56-8c1c-0c175ba03cfa', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-016', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('89d89d9f-9278-4488-a9e2-dca6516f857d', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-017', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ced411d0-8960-4e94-85e6-3db2816c6a6c', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-018', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b2e5618b-bf08-4571-98b8-e7e8e7f29458', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-019', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0b85b1c2-4486-42c3-845c-147e7eb5348f', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-020', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5ef43ba2-9521-462e-8fad-e0dbc0f903ac', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-021', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fffe52d1-8fe9-404c-b55b-015f4633d860', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-022', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c7f49957-20d1-44b0-a125-73db83ae6251', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-023', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4e260f67-a2c6-43bf-8969-03e1c3fc0cd0', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-024', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d0290363-c294-4eb1-b9e1-a47cce982cdc', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-025', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b9809fee-358c-4dd6-a72d-bdc911bf5350', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-026', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ec6d30ec-b323-474f-8c2e-e9906a32a47f', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-027', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('efd60a10-cc29-4e2a-882c-77cbdc59b5b0', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-028', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dc5939ec-6d87-4253-b77f-500f15f6ebcc', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-029', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('44fd42d9-66ed-4180-8b17-b1c671192e93', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-030', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('99dea445-a67a-48e1-a601-908ddc84b12c', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-031', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cf156f44-625b-48b0-9609-5136bd797806', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-032', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1cd3e9de-e98f-4e79-b5be-2d511c5a7d06', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-033', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3dcdacd9-6b91-4380-9965-b302e28c1e48', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-034', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9229f28c-2106-4abe-9b4a-602fefda7e33', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-035', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5af293c0-8038-49fe-a11f-1188645403ae', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-036', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d50639bf-7eb2-40a9-9e96-628ea42158ef', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-037', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4c521dfc-b65f-4ea8-9d7b-c9ef3d084930', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-038', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e9f68119-888f-48d3-a7f1-a694ad94db90', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-039', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('de5752c1-ad24-4987-af8f-e35dd2660063', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-040', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a308260d-5ef3-48c2-91f8-3b49fd8c468a', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-041', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b2478507-022a-46c7-b7fe-38f9c58c4765', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-042', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dfdb9580-52e3-4e0a-921d-8c4e0bba6999', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-043', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1402ed99-a934-4b34-9725-3e08bbc38aef', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-044', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('df5fc299-a0bf-4b10-b0be-4bfcfece58de', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-045', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bf5427a7-7757-4a93-8043-b222b9d8d6af', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-046', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e6b4916f-7c74-4c1d-b71c-d647bf738e93', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-047', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2cfb8112-4d4c-4e41-b58e-8d84632aedde', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-048', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a8019c2f-9a9d-4073-bfbf-023499ccf7f4', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-049', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0a8ea567-a14d-4ec4-8bae-febd1e906c21', 'eaa37021-8986-47d8-a548-3f906ae4a47b', 'TABLE-60-ROUND-050', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b3d8e672-7a1e-444f-99b3-3efe8d38ca00', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-001', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1b28a3d4-3d8f-47b5-ba78-0eb7f13b7af5', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-002', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a89eba29-b25e-42ed-b766-184355404756', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-003', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0231bdbe-7c37-44e6-9545-654355afa341', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-004', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8f8985ab-a5f5-4412-b311-53e957cca702', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-005', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f9c9551a-e27a-4244-be8d-39aa4751441d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-006', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c97799be-d749-49f0-a679-ff5ad7cc893e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-007', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('26e6ab53-9ac0-4436-befe-a8bf2db04e0e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-008', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1c74e6be-ebb5-47a2-bccd-c8f591986aff', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-009', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('04e6dddc-ab91-46cf-9a92-4c14d7803d76', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-010', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2ff425b7-0850-4b45-98df-7c0172287e59', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-011', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('32dd5ace-8f0c-4bb5-b5d9-c1243369eed2', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-012', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('44e2f569-1621-481c-ae26-4d59057cf4ee', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-013', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('322c3c36-9add-4f1c-8dbd-0a3467730e29', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-014', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d45f2951-91b2-4549-aa82-c8f2d6d64194', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-015', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('12c1c598-ba07-41fa-8378-0ec476afc549', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-016', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('53d623f4-08f8-4250-90bf-39c1523f9e8b', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-017', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('de852c2d-c5f9-4a1c-af9f-62f2caa3598f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-018', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('56e12097-4067-4887-9aa0-c7f4cd1cfa1e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-019', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1f30bbe2-581c-4cc1-84a7-55f12e933fea', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-020', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d8d1b44b-2c82-4302-a6e5-a10c45fcbf96', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-021', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f686bc6e-2d79-4504-8da2-c73a1e80aa12', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-022', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('13f95bf1-1282-40bb-bf3f-cc98764d2e33', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-023', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2d8c0452-6791-4d72-b2fe-b8caba95372d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-024', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f92b98f9-7244-4b14-82cd-c62c2acc5456', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-025', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ac2c16e9-d1df-4359-a82b-d946a1c9e2db', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-026', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5bca05df-dc8b-46f9-8f8c-f28fa40a247f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-027', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0cb1ec7b-4ebb-4472-8081-ba4ed2d8ef0e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-028', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('02102378-d1b8-4d82-88a1-fc50c7f332cf', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-029', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c3dab488-b094-4201-8444-63daebf034a3', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-030', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('864a0d34-103f-4d1a-8ebf-5835dececedf', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-031', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6bcac6a2-ab1e-436a-ab5b-da7aa80e0456', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-032', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9ecce7a3-36a0-4ab2-bf7d-7d6707accf27', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-033', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('54cf6b27-2cc0-4b5e-b8a2-af36b36cec30', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-034', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('355c2555-185b-4da0-97c4-69e220e121ec', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-035', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('17fcfb39-cc24-4b21-bfc3-e5358b70f263', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-036', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('92b371c4-3750-4156-a8b8-53f2fb9dee14', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-037', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ba8c8bc2-bb2d-4203-af40-f2624d91d0c1', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-038', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e7a709ae-e802-4572-855c-509bb21a35f5', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-039', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c6f1ee07-35c3-4df4-8a98-59b12858fba4', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-040', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('41b9199d-8501-45d0-af42-96524d8df119', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-041', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('96cf49c8-7beb-4ab9-833f-e99360b63d13', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-042', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7fb44003-707e-4ba2-800a-e566efdce5dd', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-043', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('deffaad9-9f8e-4826-b1d5-7f124f5222c4', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-044', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('64f230b0-172c-4b70-9a1c-84a0a6bb133a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-045', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('124e7eb2-8696-4134-95e6-21fa11ffead7', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-046', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d62f675d-82e3-4f48-98c9-260f6e4fc9fd', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-047', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4888e447-f38a-421e-bfc0-db3c0039943f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-048', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('007e758f-287c-4dc7-8425-b15e019e9114', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-049', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6bd2a847-c279-48f2-b486-9d28e80c7d9d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-050', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c31befd3-9598-45ce-8a67-8731d3928cc7', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-051', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('383c9c7f-32be-471d-91d7-104412a5c45b', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-052', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b1d86b2f-3f4b-4d65-bb57-162c455bbded', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-053', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2680ec25-0a38-474c-8da8-5961b2ad73b2', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-054', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f11a6347-898f-4421-a3ae-064b68b57d27', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-055', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3188fc76-cc80-42d4-8984-fdc01e13f457', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-056', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a3847ce9-7a20-46bc-9ea7-9d8ae28c889d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-057', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b9371858-9ca2-486e-8c97-01a74444b4bc', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-058', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6c04aa98-a970-48a9-a5be-a5091f6b0f0a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-059', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c5d39c0e-b430-4376-a1fa-dd6e3d12fcaf', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-060', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2cb6411a-5259-4081-9976-678533c5c59c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-061', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b64a5f81-d17a-48ab-9c8f-78b39499ae6c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-062', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9a54ac9d-d184-4c27-9c35-cf8ac4b87ebd', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-063', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e4b29931-e64f-48a5-aa1f-b1e33077dc0f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-064', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b56acfac-e10f-441c-8b98-69c6e6b5392a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-065', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c6a576ca-ecc7-42a4-ba89-94faf89dc170', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-066', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('21329ceb-b86a-4551-b200-1339dc131314', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-067', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0a77318a-3ccd-4795-85c9-8157093cad14', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-068', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('50876940-545b-49ee-8727-81e003245bd7', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-069', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('76d27ec7-0d8c-4cd8-bc01-2747a6268073', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-070', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('31f986f7-e6e1-4bfa-847f-2748ff99c9a1', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-071', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('937f0eb0-b337-4076-a809-528f816447ad', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-072', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a3728608-e6f9-4afb-b7a7-947c62df7dc1', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-073', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('03e69057-55d4-4522-be6d-be19d08bcd95', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-074', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('61e83ab1-b9b6-446d-ac52-d35fc18cf250', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-075', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dd3911b9-b054-4f64-a278-fd36698ea76c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-076', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5899a818-dd6c-444c-9777-4d3e710f220c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-077', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('600d6026-adc7-45dc-befd-96b995a014aa', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-078', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b1ac965c-6224-467e-ad53-e4ca5e1f046c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-079', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0cdf594d-848a-4dd4-a4e2-d31a38db468e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-080', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6a582b42-4f4f-4d4e-8bab-619a887684b9', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-081', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('301c52a0-14d2-4f35-aaf0-c930907f9988', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-082', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b94606cd-9247-43f0-aaf6-ca7a0b7b2d90', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-083', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('da387ca1-bc24-4e18-9eb0-7715a3bd8d8a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-084', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3ae722d0-bf08-4a76-bcfd-8fad4042e2d8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-085', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('26f84594-be22-4959-9af7-cd1a6d205820', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-086', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('113d3580-e32d-4e81-9ed3-3b2c4e6e79c2', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-087', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e1cf6b89-ce9b-4cfd-8077-757e890e5a35', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-088', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('121687f2-b851-4c4b-869a-c2c474e7f5a2', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-089', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e8040cc7-51c9-4519-afae-57b102f7657e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-090', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('81ba41bd-c435-4996-9f71-bbeb2fce25a9', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-091', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3a9b9dbf-3de9-40a9-8f87-6e259417d925', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-092', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c1eef7d4-a102-49e4-8fdc-3f4c1f7c96a9', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-093', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9ab9b3f1-65f3-4a39-babd-706acabfa7a7', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-094', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f8d770a7-d168-41d2-a7bc-00386521c009', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-095', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d0803184-500e-4ca4-be9a-4ad55905e1f2', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-096', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('db20b857-a0ad-4a1d-a007-60f569633caa', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-097', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f4eb9eec-3a41-4f11-b848-8ab4cc83ff48', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-098', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('46c474ba-bcae-4918-86fd-3f3036982338', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-099', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('331b00e5-4203-45be-80fe-5222b93dc517', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-100', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5fc74113-b75f-44be-947b-88398d3fb486', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-101', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('45372b55-2e7a-43c8-8b71-946d3b963c7b', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-102', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('208c4770-3821-4271-97fd-8e26b6d74024', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-103', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('19478625-41ec-4636-9bde-225a7d286beb', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-104', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('58a4663b-18c1-48e6-a252-1db407cbe478', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-105', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7714de71-9ea1-4c37-b5e3-9126be135867', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-106', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3b147142-b7c1-4dcc-90d3-9f7c65fec98f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-107', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e68865ba-ffcb-4cb1-a08c-94e65b964f1a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-108', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4e2652bd-db67-441c-b84f-9cd47dd55fc6', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-109', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5eb18344-7f72-457b-b60e-671ab08952b0', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-110', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5542bc94-4c2d-489e-9ce8-e022b2fa2775', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-111', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('60c4518e-550c-4798-947a-767e8c3f2cad', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-112', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('18f07394-ca0d-48f5-8725-420ca585ea6e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-113', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bcf2e614-03c1-4b5b-a34e-de02814930b8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-114', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4716f0b1-4e7f-448c-ac1e-c8fe4315275e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-115', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a2778943-7605-4df1-a88d-80f4fe2d0e3e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-116', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c6998dd6-9618-4129-8551-a073381d7c18', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-117', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e3762fd1-dacd-48c7-bf91-d27d0b123794', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-118', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1922b2af-3868-4f3f-a4f0-0d119da228b6', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-119', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b95abf13-9db4-40dd-9f3f-8c0faa48e58b', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-120', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fe1590cf-0b89-4cae-9270-b1c5bcd310d8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-121', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c3727ba8-bf32-4754-976a-a3cb591465ab', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-122', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1b06319d-29f6-42ee-a2f6-5b0014b9a859', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-123', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c44392ed-f867-4905-9419-9468cac9b53a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-124', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d01ed1fc-4157-4cf4-8d8c-d21fd9091ffb', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-125', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('41cd87f4-911b-4666-9d7f-ade532f04386', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-126', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b85665cb-9842-44b0-981f-70a76d3f3639', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-127', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9b3e52ed-24a1-4ee5-b216-03e9286d2b84', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-128', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6908085c-fe85-4baa-97c1-e5c75cfbcb02', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-129', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('75cf7601-40f6-4d4d-a748-1be752b4b43c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-130', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('040b01fd-ad0a-482d-b300-cd938fe3a73f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-131', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cee85c6c-b38d-4184-ade6-2f6b8e44b74d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-132', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('630fcd61-47bf-4ccd-b03f-847cbce5e061', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-133', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9e6bb50b-fc68-433f-8f74-d22346f8ac8e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-134', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7d1acede-0feb-4e3a-988e-e7fcce639587', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-135', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('88dd23a4-edea-472f-94e3-df2c22bf437f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-136', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bc6d315c-b0ce-458e-8df2-d3cb60b9dc54', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-137', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('14120b8a-ae52-48ce-99ad-14ebc3bc7e77', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-138', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4fc308ee-4696-42dd-a6f9-3a49b04dfbae', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-139', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1a5926ba-fe31-4bb3-84e0-b597fae7af72', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-140', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9eaacf44-c7a8-4cbe-a420-5c4d48e14722', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-141', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5500dd3b-313f-4dbc-b0ca-6e22df67ae60', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-142', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e31fea78-eecd-4cf1-8734-cb61582df003', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-143', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('804ed638-5833-4896-9bc9-0866f612df7f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-144', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d78ead0f-1dca-47eb-b0f0-4aa5a31ffa8f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-145', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ca905357-beb5-484a-8b5c-47071396c4bc', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-146', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('517934ac-9493-4ac9-a5c8-7b482c990fcd', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-147', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c747b515-c876-470d-ba1d-f7a455bcd25e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-148', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('961ee2d4-2234-453b-bb1d-3905f0664c3c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-149', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e4c87149-b284-4d2d-9fd9-a8ec6e17a95a', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-150', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('413ae50f-8fed-487e-9323-c3c7d4f2e05e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-151', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('98af8fcf-9ab0-487e-9262-065672ff0d9d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-152', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ec48d6b5-6683-4b3e-9ec4-ba37755479f8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-153', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f096a01d-5732-42bf-bd8f-bd9792b5f26f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-154', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('edae13d2-fe5c-4d42-aa9f-cef88b797734', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-155', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('012a83d7-7d53-4fac-947a-6d3a070ab498', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-156', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('41fd396d-dd59-4761-a455-b254c8e023ed', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-157', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('90a61ca5-2e7f-45d4-9133-36c4f0466b3e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-158', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2b0319f1-affc-4dc3-8ed9-9c5a1a4cd378', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-159', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f5d551d5-8645-45e1-a8e9-d36b0610e834', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-160', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d2b9e43e-d7f5-45f5-931b-aabbe0e4165e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-161', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('87af52b9-dca7-4939-ab2f-17820b5b5a84', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-162', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e2e01d54-be2b-4173-80a9-9c52c5756900', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-163', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3b366a06-47e9-48c6-ac2d-e92a87c72abb', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-164', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c3608cf0-ee45-45b3-8087-a5f565d737e4', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-165', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b44d40bd-3f25-4231-bd78-bab2d4ba1534', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-166', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('22db27b3-9e76-47b5-982f-d0400b6c41ba', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-167', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7affbc83-26e5-4006-9716-b6736ed82eb8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-168', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('48f9c925-2956-49e6-b228-11308becd781', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-169', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('74162b46-cb04-4f82-8359-752a48daedfd', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-170', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('00c19611-e17a-40d4-abc3-2d16e6caeaa3', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-171', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('82670372-85f0-47f1-af4b-ef920d015015', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-172', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9d5f084e-0cbf-46b6-bcf3-f6e844811126', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-173', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('773b8bef-e437-4a78-98cd-a692e50165f1', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-174', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1ccb2a5b-71ac-47a6-aaea-4bfe31f74489', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-175', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5e2d705d-442a-43f5-ad06-0e49597b4c65', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-176', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dee6cf87-2b3e-4cdf-8fc4-ec7a4afa0893', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-177', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6b1da085-00b0-47f3-8ce6-3e2a1ff62bf8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-178', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('37842850-1157-493a-bd10-6754d6b4567e', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-179', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8355f9aa-afb3-458c-a65e-9d70ed258b30', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-180', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('996ab7fd-1bf6-4405-bccc-3a3c778c7b59', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-181', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('786d30cd-f080-4a1a-93d4-c476daedcb7f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-182', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2c60bbe3-60a5-44b9-8be8-61fc70b2624f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-183', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('42dfb066-27e9-4d13-b445-029b9ba5f064', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-184', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d8141ca3-8133-4fda-94bc-c75fe677c687', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-185', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a064ec82-ddcb-49ea-8b99-cec454d782fa', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-186', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('eaeeab01-f589-4cd4-bc40-5f33bcd48873', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-187', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1ea59e9d-df59-463e-ba0c-42bd7b68a3e8', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-188', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e862c325-b199-4962-aaf9-8d643ec2a34f', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-189', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('86b29706-e427-4e36-86f1-fdf6e039c3dc', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-190', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('eb5f5031-5a05-457e-aa29-16470151dece', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-191', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('059c77cb-f7de-41ac-8daf-b75791a6980c', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-192', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('93f9ecb2-23b4-470b-af37-b68323c75267', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-193', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bfe300bf-c827-4b35-8caf-308000de9d00', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-194', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e4749fda-5f02-4caf-b522-a9fc795ad1d0', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-195', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4efe9699-cb44-4994-aeb4-d9268bab6660', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-196', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c7747a23-3f49-49f4-8418-dc4f518de42d', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-197', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('10e29bb8-ce96-4cb3-a8a1-d23bfbe8f984', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-198', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7bc34bcb-d84c-401f-a82e-b01ad89fdf79', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-199', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1ea46a4e-cd14-4495-8512-379e1728ba11', 'a014226c-c083-4800-a9ce-fa8985e90678', 'CHAIR-CHIAVARI-GOLD-200', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e390d143-18c2-4c06-9065-df82d69dbd1a', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-001', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('049381e8-e509-4217-9ad2-61bf0ace424f', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-002', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b21c3045-78dc-4bbe-92af-660cc118d3f9', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-003', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7cc16cc9-1fca-44a0-9987-afea20bd9305', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-004', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3af0aec8-4512-421e-afe7-df806552b1ca', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-005', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('661cb439-88cc-44ab-adcf-32606be77ba0', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-006', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('27eb2bd9-44f7-481d-8634-a0c7391c879c', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-007', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('84c63544-72ea-46c4-a4c7-69d8e8df5d14', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-008', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3264d55a-d01e-461d-8010-efd815bf03ec', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-009', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('809fc595-962b-4a59-bbeb-31185181c30a', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-010', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8df7b7f9-dc81-4dcf-a868-4fef01840085', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-011', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('19e9b6b6-8b99-4dc8-b6eb-1ccfa35f10ca', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-012', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ce306d29-b1fa-4c5d-b5d2-100a803ddcd3', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-013', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('44effe7b-4734-45fd-ae56-98f8ca42119c', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-014', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c286308b-5cf3-402b-a22b-9b535bfffa98', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-015', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0c220cab-c04f-443e-8ce4-fac985143c50', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-016', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8e229283-f519-4ac4-900e-90de86509dab', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-017', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1b9f344e-2394-4f2b-8dda-f368ef3c1f46', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-018', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e56859b0-9d25-4e8c-97aa-38d0a88e7dde', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-019', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b6c58b60-f16f-4d75-b154-0e60f2ad2f1f', '0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'LIGHT-CHANDELIER-CRYSTAL-020', 'available', NULL, NULL, NULL, NULL, 'Warehouse A', '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('15a34c1a-47bb-4e57-88c9-b88d78ce52f8', 'b6326098-757e-4310-8fe8-d58ab5fc2407', 'PARTY-IN-A-BOX-ULTIMATE-0001-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0bd3ea0c-e32d-4df3-95ef-c00a4be3ca7a', 'a90e8bba-f101-4dc9-b4c4-c67cde326fe4', 'PARTY-IN-A-BOX-BABY-SHOWER-0002-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('eab209a4-9100-4e9c-9fae-7f234dec21e3', '425f6e6f-b74a-45a5-8efa-114703b4707c', 'PARTY-IN-A-BOX-GRADUATION-0003-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('153145c5-2971-48c1-a12e-59ef6cd63e94', 'e99fa949-e48a-435b-90ed-953ad9a91d4e', 'SCARLET-ROYALE-FRAME-0004-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('93d66d53-5b44-4d1c-9f13-0e3b5cb1225a', '7d65ed1f-acb8-482f-9a83-d51c994fa46f', 'SCOTTSDALE-ARCH-0005-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('71dbc0f2-e2cf-4830-9392-67cff86e4f6a', '596db12b-7f0e-472a-baf0-b4673bd2bccc', 'SAPPHIRE-ACRH-0006-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1132da52-5d2c-4320-b020-ef564f117a68', '31042258-b840-4a02-af06-5d0f5973d843', 'CLOVER-WAVE-ACRH-0007-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a3f39def-08f8-4877-b5f3-b575a0e2f59a', 'bd12248f-654b-4207-8ca4-bb9ddb3db1ef', 'ANA-SET-0008-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a73e8a2d-1f13-46ce-9bc1-94e8caba2727', '1fcf5b87-5c30-4653-bc64-d0ff1617eca6', 'WAVES-OF-ELEGANCE-BACKDROP-8X8FT-0009-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('85803232-78c4-48ba-825f-b3c1acb255f0', '0dabd14e-5dc4-4d06-ba01-45b4da520326', 'JOLIES-BACKDROP-0010-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a3476fc3-4c80-4dfc-8db7-3fed1919b2df', 'b239b9dc-66ae-4851-a59c-db86aad2e56a', 'STORY-BOOK-0011-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('df9eb94c-2696-4e1c-9a31-391a9ef40285', 'd0187014-6b8e-4903-90a0-a8d27c12771c', 'FRESH-KICKS-DISPLAY-6FT-0012-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('07787494-c0db-4025-bec0-26963e1f34ca', 'ca2a2ca8-1b72-4450-ae3c-304da3d651bf', 'MOON-7FT-0013-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('369a86c1-ed0a-4d4b-850c-40afd7f611e2', '7f1c6e89-71a7-4b2b-93d8-2a2d70e62f71', 'SANTORINI-WALL-PACKAGE-0014-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4d9472e9-c542-49a6-9b6d-17bbf286e791', '6bf88522-6e7c-4ed8-9f5c-51fd48082615', 'BOXWOOD-WALL-6FT-X-3FT-0015-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5c5402f8-efda-48c0-8d11-21ce8dd82ff7', 'b5895cca-78f5-49d3-8928-958d7e99ffa0', 'SUGAR-BLOSSOM-PATISSERIE-0016-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c1723b78-6fd8-4cb9-a184-769b6aff8e45', '13a6bd85-7ab3-4a37-9695-a54ca11db791', 'RUSTIC-RED-BARN-WALL-0017-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0c9fb48c-16e5-4659-b822-a9fae525286c', 'b5b47010-ad90-450c-9d0d-42f7578ac5e7', 'FM-ARCH-WALL-0018-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f2025336-e969-414f-8159-1b57cbf5c7ff', '2aef4d67-3012-404c-9064-d3323ae02602', 'FANTA-SHELF-WALL-8FT-X-8FT-0019-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('25ef065e-802a-47bb-8aae-77678d36d6a0', '0af5076d-9c80-4ca0-b8a9-9b357df3b55b', 'TRIO-WEDDING-GOLD-ARCH-0020-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c603acae-a4c8-43c6-8a0c-0ec23d65d5d6', 'de9ca979-9f7b-4de8-85c6-437db0bd8d81', 'THE-CRAIN-WALL-0021-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('950fbac9-506d-40d7-b396-aeb9d74952f3', '63f6c934-3cb8-462a-ae70-0cb4e6ba51d5', 'ALICE-FLOWER-BOX-6FT-X-4FT-0022-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dd37a3cc-8fdc-49f9-a614-f8135fad49a1', 'f3dc97a4-57ca-4029-9bc5-262c02045e75', 'LUXE-TOTE-0023-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7637b947-babd-457f-8547-9c7a6ac8756f', '0f8569d3-f539-442e-8a49-26cf5bda7b3d', 'RED-FLOWER-WALL-BACKDROP-0024-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('46cbb55a-cd81-448a-a53c-934e4aeca9a4', '2967da0e-e7e6-42c4-ad70-613163f9ae75', 'GRAND-FLOWER-WALL-BACKDROP-0025-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3d61f3f0-c409-468b-8e0a-82bb577a732c', '974f8816-db2f-42e2-9d39-7876e74069c5', 'FLOWER-WALL-BALLOON-0026-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('66c5cf2c-8207-477c-87ef-7861c6f103b6', '61f9f8dc-8067-4cf7-ba9e-76a6fbf697e9', 'FLOWER-WALL-TOUCH-OF-PINK-0027-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2c92fb6e-f105-446c-b012-e1bf1cce604d', 'b9bd75be-da97-463f-a45d-98b81f9a06b6', 'SHIMMER-WALL-GOLD-0028-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('df628de2-03a5-4f0c-b8b7-e0e9042bc707', '72f0a603-164a-453f-be47-57b0cc642f9a', 'SHIMMER-WALL-BLACK-0029-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2f2e752c-6a14-46c3-8c83-5f4bcd0f95aa', 'f91c8196-6040-412f-815f-a2df42571c21', 'SHIMMER-WALL-SILVER-0030-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('53ef4ba7-8542-4d1e-ade7-8886897def21', '7d9544ec-bf6f-46cc-87d5-c4466dbe7925', 'SOFT-TOUCH-WALL-BLACK-0031-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('70d5f706-06fc-4ddf-9916-9f8c9eae66c0', '948b0453-48a9-4fe0-ae45-8aac8c791355', 'MALIBU-BAR-6FT-0032-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ac35b45a-82c5-4eaa-94aa-9cb2bb3cf2c4', '43711411-23da-4e18-aeb5-66bbda7e8b20', 'LUX-BAR-0033-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a4e684e8-07c5-4442-b10e-7eb2d6bbb50c', 'e6f5ff6f-b47a-42a5-9157-16341dd8e242', 'WHITE-CHAMPAGNE-WALL-0034-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c8901e22-7d4c-4d21-bc0e-f80185fec16c', 'dac67771-2439-49d4-9c24-3969c05aef94', 'BLACK-CHAMPAGNE-WALL-0035-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9ebafd72-6729-4f66-a49f-8ba8f740f7d7', 'b1dfef93-e221-4f82-91c2-fa21604dac2d', 'WALNUT-LAMINATE-BAR-0036-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('acca20c5-967f-4e37-a643-90eea8d6e91f', '7657c334-6f38-4c1d-b453-ad3bf1bd5ac8', 'WHITE-FORMICA-BAR-0037-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b0fd27c2-70c4-4942-a496-5dd4049fc211', '50ffa976-8167-4d3d-bd08-d957fad6f222', 'LAMINATE-BLACK-BAR-0038-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('80ee8e3c-a896-4711-8a90-f181fde7fabd', 'eaf1c5e0-4b64-47f6-852b-a41115a7d758', 'GRASS-BAR-0039-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('981c2e51-0b80-48b8-8a68-731bc34e71a9', '5cb9ab07-a0ea-4210-8c22-7efc9a9ab183', 'LUX-GOLD-BAR-STOOL-0040-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c0b1d4b4-b220-42db-aefc-5177afeed364', 'b935ae1a-9fa4-4be9-89ca-b5a9da820752', 'STYLISH-VINTAGE-BARSTOOL-30-0041-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2176d9a2-b090-4888-b0e0-7e768015755f', '76ccd107-03f8-41dd-bd5b-8dbc1ca97134', 'STYLISH-VINTAGE-BARSTOOL-24-0042-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('09580390-12ac-41f3-b434-efc82495fdf9', '0c3e8eda-06e5-4908-864f-24a7be4f2fa2', 'LUX-SILVER-BAR-STOOL-0043-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8b14c754-0100-407d-8665-66ca733ad145', 'f80667ab-0e42-4878-b2c5-69e653de65e9', 'O-BACK-GOLD-BAR-STOOL-0044-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('248d8d85-8b9f-4b72-ad06-80c93512b124', '9091a8ae-5854-4670-8908-4d5c560af621', 'WHITE-COCKTAIL-0045-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e5ef324b-99ab-45db-acfa-fccc16e3b5b1', '4869bbfd-1361-42c9-ac42-468e7fdc2ba0', 'LED-CHAMPAGNE-TABLE-0046-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d4192c9f-8b4a-4657-abe5-c03c9fd7b0cc', 'e36b3087-3cc4-4ed8-8dd0-7f90a78fe318', 'HIGHBOY-COCKTAIL-ROUND-SPANDEX-TABLE-COV-0047-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b4480e4e-bdfa-45eb-b3f8-6346972223b8', 'f915521b-df93-4572-a397-914dc983ab29', 'COCKTAIL-TABLES-0048-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d14a573c-58fa-43db-8ecd-420e37236d3f', 'dda9bbf7-767d-469e-b83a-d8c7d1c81bab', 'SPANDEX-TABLECLOTH-FOR-COCKTAIL-TABLES-0049-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('231e4599-4f4f-443d-87bb-1641f764545c', 'aec3db32-c5bf-4ecd-b0aa-53b17e2807cd', 'LED-COCKTABLE-TABLE-0050-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.594189+00', '2026-08-27 01:47:02.594189+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('509c098a-9010-4f6f-91d8-d3a0a5493342', '4732a959-06ea-4448-838d-edfbca263c57', 'TRISHA-BAR-TABLE-SILVER-0051-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ae9585c2-7aaf-4370-8102-708ebf66c756', '7d79b944-de19-4c6e-8bdb-eaeb215b5e4d', 'TRISHA-BAR-TABLE-GOLD-0052-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b0aae863-3a6a-4695-961d-7d271a73f140', '09674cfd-b5df-4bd8-be29-d452130212a4', 'CIRCLE-BAR-TABLE-SILVER-0053-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('44859075-9623-418f-ae14-973dbf3615f8', 'beaee00b-cf0d-4641-af45-c4f49750c48f', 'CIRCLE-BAR-TABLE-GOLD-0054-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6d1cd200-02f0-4291-ba1a-e0a484f8929f', '9e40f831-574d-461b-a4ee-2f3169d93dd0', 'WHITE-WAGON-CART-0055-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('15a0b4f6-ed27-4d06-9630-37776839f7da', 'e00fd0df-c6b7-4323-9b1a-f5ef3307c73c', 'WHITE-RUSTIC-CART-0056-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3207361d-b89c-491c-8d7a-e9e66adec5d5', '494edb4e-493f-48dc-b38b-4b8b038155bf', 'LED-ROSES-TABLE-0057-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('47eef4f3-2c4b-40d8-84ac-c0b88a74e608', '2c1436f3-208d-461e-9d7f-079567e7899d', 'SQUEEZE-ME-STAND-BLUE-0058-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6f2c9dfe-4c18-4978-8926-c5ab1fea8020', '48bafc1d-8e16-4f0e-8aeb-047279d8d180', 'SQUEEZE-ME-STAND-PINK-0059-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('181290ea-c65b-478e-bd05-00b868e86b02', 'bcc5a015-b743-43f9-8c4e-b33a8dee6223', 'GIRL-TREAT-TABLE-0060-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('74d53887-1465-417a-8fae-cf78b6856d48', '2536fb2d-720b-46c3-aeae-2b8f535acdb4', 'BOY-TREAT-TABLE-0061-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fc60a9d2-934e-43e8-82fb-315d7a6ff24e', '2b8c169b-0b41-4a24-a138-d0fee64d43ec', 'DIAMOND-CAKE-TABLE-GOLD-0062-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7f38aa80-79f7-446f-b049-37b4a2e6ee4e', '2b17a6c5-072e-43df-a086-39b18f939501', 'GREEN-TREE-0063-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2bc51b8f-6d27-41d7-8f70-fb90745e0b68', '739c12d6-9ae7-4588-b49a-75e81b6f0d6d', 'TELEPHONE-BOOTH-0064-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8bbb2de4-3b70-44ac-a370-6069ada68c7a', '34e8c4e3-9ebf-4828-9276-10eeef2782b0', 'ZEBRA-0065-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0757d243-609f-40c5-9544-0cc3204f2181', 'eeebefc0-9db2-4d8e-b51d-57e595906db9', 'GIRAFFE-0066-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b0a0fd70-2860-4046-93b5-a7b0d6f9b2be', 'f5a41fbc-a0c7-4a1f-a489-598f62d5a694', 'ELEPHANT-0067-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('32a7bc52-5f0a-4f51-807d-ad59059aee47', '507c2b52-6951-4fc8-9000-ed6d71e66738', 'TABLE-TOP-ELEPHANT-0068-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bc98d207-c21e-4e73-b535-3182c887d32b', '6051aec4-b522-4660-a8cd-8dffb31047b0', 'GOLD-NUMBER-STAND-0069-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('24224ad3-b0da-413b-aee5-9857ed787ac8', 'b54b7f97-e998-4f53-8848-d55198340df9', 'TRANSLUCENT-CHIAVARI-CHAIR-0070-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('caf1526f-9eb1-49a5-a0b7-d202cbe3ad18', '00a7853b-3a4a-40fb-a84f-e2f88e61c660', 'CLEAR-ROUND-ELEGANCE-0071-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ad76ee99-01d8-4bba-bb0e-0fb155d93e3e', '9a77fe39-2158-4e6e-a61f-69be6ad91f4d', 'PADDED-FOLDING-CHAIR-0072-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('293fee62-3529-4edf-ac66-72173329df2c', '2e5c770d-1a05-4fbe-98a9-a5dac010a13c', 'BLACK-PADDED-CHAIR-0073-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ccc932eb-cf24-4cf1-9197-0f029df30a8f', '3690027e-bf82-4bfd-bd84-b1cee9c8f932', 'BLACK-CHIAVARI-CHAIR-0074-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8e3e12f1-c1ed-483e-806e-326f5665e0e3', 'f7f32514-3e6d-4a3f-bfd2-549163e10ec5', 'PRIME-PINK-ROYALTY-CHAIR-0075-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8435e3bb-f693-4fb2-8d37-3d8c38d18b19', '9e72e4fd-0f7a-43d4-ba9e-2d76d1a00f01', 'WHITE-SAMSONITE-CHAIR-0076-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8feb4e36-780f-4cc7-93f7-27541fb9517f', 'e0e5136c-8eed-44b6-96d7-f2e32edd82f0', 'O-BACK-GOLD-CHAIR-0077-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7fb546d4-9580-46c8-9976-38177e6cb0ee', '236290ae-7112-44f2-b1ea-ab1af3b7c126', 'O-BACK-SILVER-CHAIR-0078-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('460b2e2a-e7a1-4b96-9793-252756d53c07', '1cbbe824-a6b5-4746-b921-42ef5042b1d4', 'HEART-CHAIR-GOLD-0079-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d83a9018-153a-4b95-a0a8-79e2581ffc6d', 'b0f95ba2-9408-46f7-9d68-92e7348b1cdd', 'BAMBOO-CHAIR-GOLD-0080-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9459fa56-c7f5-45d6-9a19-a552927f26c5', 'cbd0212d-eaff-4868-96f0-0f7944d331c3', 'BAMBOO-CHAIR-SILVER-0081-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b800b5e4-23b2-42da-873b-31283e542124', '086d6ff9-f752-454c-b494-8e35a187373e', 'FOLDING-ACRYLIC-CHAIR-GOLD-0082-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7de5e38c-7c62-45ca-9b26-acc5bbb4180d', '2761ef59-98c3-4d08-95b3-f0fb13487f56', 'WAVE-SOFA-0083-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('df0d4d96-1123-4c51-bb92-426812fdd65a', '30d21be4-6e03-4d52-8524-7e737d638164', 'HENDRIX-VELVET-FLARED-ARM-LOVESEATS-0084-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ebc0977e-c93f-4621-95d3-ec2b71d863be', '9c9ce030-a311-48ff-a49e-d1d59b01b138', 'LUX-SOFA-0085-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f5c3b03f-e0d7-4e6e-b8be-3ce55fb5c24e', '614bcd63-8a78-471d-a5aa-2af8da5f7d75', 'CAGE-SOFA-0086-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2f389820-c0e8-4a02-b8e3-e85caa0374d7', 'f3195070-4e27-4ac7-b384-00a463b37d9f', '3-PIECE-LUX-SET-0087-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4409bbc9-31fa-4c5a-9c3e-717acfb4cb9e', '39c49434-2f2a-45fe-a679-3dee55a51ab7', 'LUX-PINK-SOFA-0088-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f3640c44-3601-4772-b617-5ded53b93b26', 'b174366a-769f-4db7-a4f8-6025e0b771f8', 'FANCY-ROYAL-SOFA-0089-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ddaa674a-7c9f-49ab-9ab2-125b385e083d', '6607bd0e-80f6-4296-a381-0ecef0c2f62b', 'NUDE-SOFA-0090-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d3f93549-f0c7-40d0-b9a1-9e2dc988faea', '2222afc9-fd06-444d-b8d8-7f1b7802359a', 'CHIC-SOFA-BLACK-0091-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b22572de-745f-4137-adab-f0d63d9a9e2c', '1ee8ef4c-444d-4076-8901-8ac7a06a2177', 'WHITE-DOTTED-THRONE-SOFA-0092-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('be4fd87a-961b-49b9-a879-afc91104dc88', 'f1923376-5053-4e78-a45a-a629c08b2911', 'DREAMLAND-TRAIN-0093-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('90ec0c82-71e2-4d5f-9350-2a0a5f8dc8c4', 'f66c8c2a-65d9-455e-a619-6c5013e4f9fb', 'PRINCESS-EXPRESS-TRAIN-0094-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('021755ae-a843-4030-8609-04c3680b441b', '286e5654-5f85-4670-a2ef-56553c532a21', 'ROYAL-CASTLE-0095-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3e323dbd-2523-409e-b164-5dcd1d1b91e7', '3736967b-750e-4955-8fdb-4bc0a4dd05d5', 'BLAST-ZONE-MAGIC-CASTLE-0096-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2f987c8e-f2cc-4ea1-9c53-b526669ca1fd', '275f55d5-f10e-498f-87dc-b5f8fd6a83b7', 'KIDS-BOW-BACK-CHAIR-0097-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9fb87f5f-5f31-44ad-9538-5122c34839e8', '7c751651-cfbe-4446-be99-e1fe683b2419', 'KIDS-CHIAVARI-BLUE-CHAIR-0098-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8722d38d-2b0d-4a04-b4da-2bf28998db0a', 'b3b69437-7abc-4589-9c6e-d45c58db16b6', 'KIDS-WHITE-SAMSONITE-CHAIR-0099-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e3af0fe6-e1dd-450e-94f4-eec4b866823c', 'd126d932-e3db-4a51-9be3-89c036419dcb', 'KIDS-BAMBOO-CHAIR-PINK-0100-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.783202+00', '2026-08-27 01:47:02.783202+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ba0a9450-ffbb-4781-858b-c34d4f603a5a', 'd248262a-378b-4953-9fec-760dec841f7f', 'KIDS-6FT-TABLE-0101-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6c790d0f-6d1c-418f-955e-b9be910fdd08', 'f69c2cf8-e548-4e0a-8cf5-38ca5ad2ca64', 'KIDS-KING-THRONE-CHAIR-WHITE-0102-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fc399542-6ad7-41c7-ba91-4eb4c9030ac8', '90414d49-83f7-4242-8200-058ae00777ff', 'HAPPY-BIRTHDAY-LED-SIGN-0103-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('72312afe-8c30-4098-ba38-af6d60028b0e', 'b2a240a2-934a-43a0-82a2-2cbf05108617', 'LETS-PARTY-LED-SIGN-0104-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e1cd89bf-51a4-47c9-a642-df9b8bbbd2e6', 'f9949bf0-e501-40f4-98a5-7d942a4f84e3', 'BABY-MARQUEE-0105-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0d78bdf1-27ce-4c3f-96a5-691cec7bbfb2', '218e3a0e-2593-43f8-84cb-5406eacfe9c0', 'OH-BABY-MARQUEE-0106-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fee4fe84-a6a0-4e80-9625-8cef4513a922', '6a446e47-6610-4063-a10f-5b54d412a435', 'BLACK-MARQUEE-NUMBERS-0107-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('32065192-e18c-44ba-b205-914998a5b050', '5685435d-5e32-4547-a888-aed67b329453', 'MARQUEE-LETTER-0108-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9be83466-89bc-4f92-9817-01d205f32d35', '0c501f8a-283c-4725-8151-4472bbd4da2e', 'LARGE-MARQUEE-CROSS-WITH-LIGHT-0109-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e00b21af-5e80-4561-bca1-02d539231b9b', '76234e3d-c95a-4cb1-8df8-2261bd7d74ed', 'WHITE-MARQUEE-NUMBER-0110-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6a124b4b-5cbe-4b28-9c9e-e9044bb2f62d', '8408e9da-3483-42d9-9f41-34590b9ffdf0', 'GOLD-DUST-THRONE-0111-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bd9e2a77-1420-4b74-b35a-a8e21ba359a6', 'cacbb547-e889-4f86-bf26-fc272be0104c', 'MID-NIGHT-THRONE-0112-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a071f8b8-07aa-4670-be98-df09e9b7436a', '619ae7d6-e7a9-49c6-9ea0-76c29a9ce23a', 'EMERALD-PEARL-THRONE-0113-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('faa7a7bc-292a-4caa-bf3b-8815461b3677', '9531080a-96ab-45ab-aeea-be25ca27606f', 'SILVER-PEARL-THRONE-0114-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('447ef99f-441d-4054-adeb-6423adbd8f3d', 'a9410e2a-09ca-40fe-afc7-5b9bfd81f59c', 'WHITE-PEAL-THRONE-CHAIR-0115-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1ad754bb-9550-49a2-8768-9fcaf02e488b', '9a241fa5-b63a-4625-aebd-088f9d3f7e3a', 'RED-THRONE-0116-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f7828528-49b6-4006-bea2-b615e9f1d594', 'b616500e-8970-4351-8487-094882e6b5c6', 'KIDS-VELVET-PINK-THRONE-0117-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a5426e6b-ea8a-4faf-86b0-930d6d5e966e', '8d0cb784-15df-481c-91c3-b7cfa412dc27', 'WHITE-PRINCESS-THRONE-SOFA-CHAIR-0118-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('521de07e-a3f7-4213-8680-12b46167aee0', '30835374-4f41-49af-a49d-894274216a1c', 'KING-THRONE-SOFA-CHAIR-0119-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('34f4ac9a-8e0b-457b-9caf-e65d73e6012a', '9c1d0f86-dba5-4a56-98cc-957a0a813fb3', 'CASSIE-LOVESEAT-GOLD-0120-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c9979b6c-850b-463b-bec3-c5bed4dcc483', 'c6a1b5c9-36d1-44c3-84c2-239c7fe51500', 'CAGE-GOLD-CHAIR-WHITE-CUSHION-0121-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cb4f78be-92b1-43d9-b936-fbd3e4190661', 'cfb71294-4cb6-48f2-85f5-545fc73bcb91', 'CAGE-GOLD-CHAIR-BLACK-CUSHION-0122-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a57c110e-88d4-4f63-911f-123aeccf06f4', '8d62a299-4e42-4a67-9fd6-796d7a990a3a', 'LUX-THRONE-CHAIR-BLACK-0123-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2ebb07a3-a6b1-4400-bff5-5b71e4af4dd0', '5cbc3167-39ea-45bf-a876-94e0fa2424e1', 'CANOPY-THRONE-CHAIR-WHITE-0124-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2ed0f4fa-77c1-4019-95dc-8d54d099ed1f', '3e6131cd-fdf5-450e-ba34-b95ded8140d0', 'LUX-THRONE-CHAIR-GOLD-0125-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d16fdf64-533d-4881-bcc2-50f39c71497e', '291fe924-c59a-42de-9afb-e712cc231f05', 'LUX-THRONE-CHAIR-SILVER-0126-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a80ee16f-12f8-4743-907f-0e3a9fa5caf2', 'c10a9a94-4140-4ee2-8c98-3bf817064946', 'GOLD-CHIAVARI-CHAIR-0127-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f2e92223-d0b8-4732-bd0e-ac1847075cbf', '88ba3923-e2f5-4385-9af5-d73e7175f67a', 'SPANDEX-LIGHT-BLUE-CHAIR-COVERS-0128-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('50e1c9c8-203e-4a69-9e53-4cc91b43a14c', '40acbbc0-8a07-4e2d-8916-9f112283963e', 'TREAT-WALL-0129-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2bad5419-1f3f-41f8-bb8e-c931c07b6323', '71f46936-df8d-430f-8a5a-2dc43f11f13b', 'TABLE-NAPKIN-BABY-BLUE-0130-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5e0cbbe3-d02b-4f78-a07a-c1932202c43e', '46588248-dc70-4869-bdc1-c613180c84f3', 'ACRYLIC-STAGE-8X-8-0131-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b6e5de4f-d6d0-4dc9-b5f9-8df674f43c5d', 'b49b405f-9aa1-4fb2-8d40-8ffc3a18ba29', 'CHAMBERLAIN-3-PCS-0132-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('50d0abd7-abe2-4685-ac07-867d8e9a2658', 'a3b5f6ee-0470-4742-99a7-a7f962e75800', 'KEN-BARBIE-BOX-0133-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f2fe4ebc-7e9a-4df0-801c-21d188d7e558', '06681e7a-573a-4471-b0cd-f95fc63007eb', 'GOLD-SHIM-SHIM-BACKDROP-0134-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9d356663-9440-4036-baec-4deb5c48fbe1', '58f28ba4-8ffa-4eea-9ffc-c28021fd2c5c', 'CAGE-DOME-THRONE-0135-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c1546257-7ddc-4a0d-a928-01426d32c5f6', '96c63f12-5e06-472a-8ac3-7cb8e7850a35', 'BABY-LETTER-TABLE-0136-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c026415f-a03c-433d-9a88-ef762cf6eeb6', '0054ac5d-30f9-4fef-8229-8930fd2b3501', 'CLASSIC-HALF-SIZE-ROUND-CHAFER-0137-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5c8408c2-b52b-4f76-b858-c0f0fd73bf2c', '68f6a2ba-700a-4fbb-b123-abee47924ce9', 'CLEAR-BEADED-CHARGERS-0138-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('83a228d4-456b-4201-8bf0-7bf142290e5f', '2f0162c8-403c-4685-a03b-5f4163afa975', 'MENU-0139-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dd7a1694-a90a-49d7-b503-e38804bb88df', 'bc8f65b2-c081-4e07-9054-aea42c98dc07', 'BIRTHDAY-PACKAGE-0140-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8926f495-c376-4cd9-bf75-9b77871ba27a', '5b8f5835-9b68-4018-ada2-a05e1a32fae8', 'MEGA-SET-ARCH-STAGE-0141-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5a173ed0-6e6e-48f0-b9ca-18255cf9dbb0', 'd3428e02-d5df-43cc-ac04-1885783ba2d3', 'GREEN-WALL-N-BALLOON-PACKAGE-0142-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('45e0a416-d0b6-4066-8bd2-a89708079a58', 'e17f57a0-290c-4516-8cf7-65ed3b8089a1', 'ARTIFICIAL-FLUFFY-TREE-0143-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('025a0602-3bd3-46fc-80ef-38eee8e07c09', 'a1437de3-9571-43c9-9aec-94f411a73feb', 'WHITE-PHOTO-FRAME-0144-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3a466ab4-93ab-4125-a96b-379477bc9370', '95eff44c-1b91-4955-9ede-e9551040414a', 'PINK-COLUMNS-0145-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d9dc33bd-8397-4f69-a29a-0626b2343eea', '88e81e8a-ba85-422e-8f33-a9f5f3ca92b6', 'KIDS-WHITE-CHIAVARI-CHAIR-0146-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('631d30b9-5cd3-43e3-ab3a-6d288d78715c', 'ea4fd353-a91a-4cc2-a35e-8a4c1652731b', 'LED-CUBE-0147-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('997fbc5d-23c8-42ae-8b8f-926a1048f1d3', 'ac81e932-929a-4830-9077-6e484cffef2f', 'PURPLE-COLUMNS-0148-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3b117ade-b6b2-4cc3-b197-191af94c036e', 'bf81736c-0417-4e4c-a8c9-d822600e6dca', '3-PCS-GOLD-FLOWER-BACKDROP-WTABLE-0149-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('be63e68a-05e2-4b15-b8fd-36f625ae951e', '8baca025-1787-41c7-9970-b9cabd40614a', 'PURE-WHITE-STAGE-8X8-0150-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:02.924357+00', '2026-08-27 01:47:02.924357+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6188a03c-941f-4ab5-a613-fe6f92d500fe', '00b7dcfc-af4f-457c-ad6c-93d103d529f2', 'KISSING-BALL-0151-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e623cfd9-e3c9-4cb6-89e6-686d97a5c2eb', 'edba2e1c-a201-4f6a-9665-d91c72fb66c7', 'THE-INDY-3-STATION-0152-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cf381a12-fb16-4b1a-be8b-d9f732954725', '402e1b90-dd5f-4de2-a674-d690650099fd', 'TABLE-NAPKIN-WILLOW-GREEN-0153-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5cb801a7-275f-492a-a4f5-0f806615c04a', '62a858da-2279-4fdb-9bcc-4021175725ee', 'MOIEA-FLORAL-WEDDING-DESIGN-0154-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4f0d88a0-0282-43b6-98db-7896b6bb9241', '7a821418-6371-4e74-a453-7a402e551666', 'BESTIE-BABY-THONE-0155-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a1d2f3a1-96fc-4002-afbe-8ab8c7eb806c', '875e484f-20e4-47e1-adee-647c96ab3d30', 'SILVER-CLASSIC-THRONE-0156-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1eecef57-06fa-4ab0-9d4a-f02cacb66300', 'ac5dbaa9-dd1f-4b75-8359-341af37b1b97', 'KIDDIES-FRESH-FLOWER-WVASE-0157-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('35c828ff-8401-4a11-bf48-81b98143e449', '5376a366-c265-499d-bf2e-d6efa6dfa6d5', 'RUSTIC-SOLID-PINE-FOLDING-FARM-TABLE-0158-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('321d8ad3-9d43-4cbc-a82e-2315c8305e1a', 'a95b6343-a513-43f1-9346-6170226dba16', 'PODIUM-0159-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('15ccdb3b-b3bc-433a-adb2-feaecd55a721', '8f427c41-27fc-4e9b-909c-f58e6472109b', 'TUMBLERS-10-OZ-0160-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('910a6cad-aad0-4483-96c7-be03c3601a35', 'f22919a8-96e6-4a92-b0c0-81c9723e61a9', 'CRATE-PEDESTAL-0161-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('534fa926-3d14-4d4c-a941-60e58ca5c1e1', '5571530a-48bd-4069-96c0-47de1edf2c9a', 'LED-TABLE-0162-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0508a6e6-bd57-4056-925f-6aaede09d073', '60b46a4f-2f0c-499d-84fe-62674034fa4e', 'THE-SELFIE-2-STATION-0163-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fe9c6d07-8fac-4f95-b96d-42a6d3cbaa4c', 'e5041eb7-582b-41ce-9322-87b288d5ec66', 'CHAIR-CUSHION-0164-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7111312f-b1f4-4a54-aad8-122ba8beb693', 'bb396186-9559-4ece-a9ff-5fdf1e4fd457', 'CHLOES-ARCH-0165-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3665b1c2-efda-4765-80b0-c217fb348cc3', '2d7e3507-ae92-44fc-8f2e-249b473070e3', 'COPPER-MULE-MUGS-0166-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('51ac2979-7cf0-4556-9ad9-18a782be6006', '8b4b2024-3c12-4a56-a319-50b7d9a0b1c5', 'MOTHER-2-B-AREA-0167-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5d3139a9-e3a9-4a59-a5a1-4d55e38dec1b', 'e028690b-62ae-4002-a9d1-2fda3d0fa8d4', 'LUX-BUBBLE-ACRYLIC-WALL-BACKDROP-0168-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('120609fa-a80a-40b2-b8ce-de87cc08ea00', '4698b132-3b21-47ca-a3fc-40ce054367d6', 'ABSTRACT-WALL-0169-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('963eef59-8cf4-44c1-9557-3cef43c3c9e1', '33cf6368-c5ab-4ce3-9365-6ffedb8232f3', 'PONYTAIL-BACKDROP-0170-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d91607da-c729-4760-b994-fd5a33bdd287', '99884a1e-13d7-425a-97e0-7c54359de89c', 'SKYLINE-BACKDROP-0171-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f24fa44f-fd10-4a6a-bff2-d01ba761bba9', '20396e1a-650c-4d21-b8b7-6501dcf91bb2', 'CIRCLE-TIME-BACKDROP-0172-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('90b3bd7e-6fc1-4bd1-a18b-0bcde20bda0e', '169d0a4f-6650-4666-a202-daf6adf19301', 'MIAMI-TREE-0173-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e28843ce-136d-4b3d-a78a-b8b0afbb3b43', '93335af1-9966-4be8-8100-c3ad2426c0db', 'SPANDEX-ROYAL-BLUE-CHAIR-COVER-0174-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('be466a93-d62c-439b-a2ae-ec6f2f5acdf5', '85118180-7160-4344-8a45-f277100aad12', 'LUX-COCKTAIL-TABLE-0175-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('516c60ed-8693-4e44-b256-37b43d83028c', '39310c7b-e98e-4b75-bc3c-7203fcc84279', 'FRESH-FLORAL-WVASE-0176-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6a2e0bc0-e702-440d-85ce-9add7bf77b13', '8b8c036f-b2ae-4e42-96e3-c3d9f96ef1ca', 'SINGLE-VELVET-LUX-0177-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('380c931d-bea5-456a-8df1-080b546f0746', 'c0644882-8691-49b7-814e-11ffa3948fda', 'NATURAL-WALL-AND-BALLOON-BACKDROP-0178-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bed78492-6886-4aca-84e8-c0bb9064372d', '533ded56-64c3-456e-9fe8-4fecde4d73f3', 'PEARL-QUEEN-BENCH-0179-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('705737e8-84d0-44f0-bfd8-d28ff749712d', '86dbcaa2-4cd5-4efb-b816-938fa42cd9c8', 'GUEST-TABLE-SETTINGS-0180-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2abf744b-c59d-4f14-bed9-1d75b0770ab5', '85e1be8b-973a-4c94-981a-bd71452c9527', 'SPANDEX-METALLIC-GOLD-WHITE-CHAIR-COVERS-0181-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('81d6fc88-68e9-4368-9ec4-cc1a5dab74db', '19e07835-94de-40a2-87c3-dca8625418d3', 'ACURA-BLUE-PACKAGE-0182-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dae16522-4778-4283-baeb-82ebe72b544d', '23875565-b28b-4e3e-8efa-6f26c0f34d48', 'MARLEY-3D-OPEN-ARCH-0183-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0c2a7fdf-3e55-475a-8aa7-d20901b5cb2b', 'c23f50e9-ec1b-4841-8b49-91f8461373a5', 'GREEN-COLUMNS-0184-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1cc2ce0c-be81-4235-9b36-e839cfbac9bc', '6a240d78-bcb0-46bc-94fb-3d5a6ceff67d', 'GOLD-CAKE-STAND-0185-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('56f35530-aa67-44c5-b544-54d38ee6ca78', 'de6e6183-ec61-40d2-a2fe-00d31542ee67', 'BUTTER-ARCH-0186-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('18ce86ac-405f-4e3d-9b2c-8ddcc6fb7d7b', '7a064dfb-0150-4aa7-bbc5-f65ee8be20c8', 'KIDS-CHARACTERS-DECOR-0187-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('28e718b9-52aa-45ae-8c71-bb40f91216c9', 'ae5f05c4-d559-4f7b-9028-a895adc45ca7', '6-BURNER-STOVE-0188-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4e5f493c-d74f-4c19-a057-17d5480e93a9', 'fdd63c19-10d1-4505-9534-c814c0db45b2', 'CRISSCROSS-BACKDROP-0189-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bf8e19a4-789f-474f-bf02-eb8f6bf5cf9e', 'ceafa427-eb95-4a35-a470-084763e462b5', 'TRENDY-KIDS-THRONE-0190-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('439fdb62-dffe-4eb1-a3bb-43c6ea018d2b', '07c9baa8-1d95-4712-9ec6-71476207d3a5', 'GHOST-PEDESTAL-0191-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('822aecb8-431a-4530-b0b7-94d82602fc7e', '3cce16bf-8ec1-4a13-9d12-0ff4ec29039e', 'GOLD-BEAD-ACRYLIC-CHARGERS-0192-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('677a2b7a-00be-41e1-96ba-4dd1a74075a5', '601efacf-7c9a-415a-ac9c-eef985dd010f', 'ARC-STANDS-0193-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dcc799c0-4c84-479d-84c1-c118a2f94886', 'c2864ba8-4f14-4da6-bf50-b3cf2143f0fc', 'MOI-BLACK-VELVET-0194-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fd9912d3-b69c-4cbf-b14d-b65c61d9a011', '545817cd-28bf-4fd3-9029-ba70fba77874', 'PLASTIC-CARAFE-1-LITER-0195-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3eed3a53-1e7d-472b-a714-3eaac842a166', 'f425db59-8be3-464c-89e5-2e1c9eabbfd1', 'PRIME-GOLD-ROYALTY-CHAIR-0196-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0b8b3360-cdb4-4fad-80a7-392ffde48bc7', '1643b6a9-6553-4434-a7e7-d477a06ed10b', 'OPEN-ARCH-0197-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8ffaf5db-84e1-4ebd-adc5-dc3aec4c96b5', '83f81fea-56b9-4723-ac39-7058318e31c6', 'ELITE-DRIPLESS-RECTANGULAR-CHAFER-WITH-G-0198-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e000d1ef-ea7e-4069-a859-a49479eae9c2', '9329d9dc-7274-4714-a3bc-0d813d12c6c3', 'WHITE-QUEEN-SOFA-FOR-WEDDING-0199-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9cc4c188-4871-4709-aeb0-5db0b850d14e', '41a07095-1f92-4397-9c0e-3ea54427daae', 'BLACK-DOME-0200-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.058989+00', '2026-08-27 01:47:03.058989+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ffd7d2c3-f324-464e-9c68-344fb36b628e', 'a4b752c0-0038-4aaf-972e-59cac1dff4b8', 'CURVE-ARCHWAY-0201-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f2535b0a-978f-45fc-82b3-41c5110616b9', 'dfcc0964-ed18-4add-afa3-9fd523d34249', 'GOLD-TUNNEL-ARCH-0202-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f27541ec-de15-41d0-a237-9ba576820124', '6cebe6e2-fe5b-4a6a-bb87-a137a15d4690', 'CHAR-GRILLER-0203-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4f7da536-4df9-4e15-b85c-700bd30e29c3', 'e6290607-e6d7-49a4-b6a1-64e7117e088b', 'PRIME-EMS-ROYALTY-CHAIR-0204-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('eb702dfe-5a93-4126-a8b6-b3a6b549b637', '275d26c2-724f-473d-b17c-5db51b3b088b', 'KING-AND-QUEEN-PACKAGE-0205-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8a0dd2bc-f36d-4a62-9382-e1bcf19b412f', '1eddefd5-9788-4614-ba8d-b7bea2fe3519', 'DELUXE-4-QT-ROUND-GOLD-ACCENT-CHAFER-0206-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('aed5ef0b-85ab-4a91-b915-43789fdc818e', '3b184fcb-0a74-4582-add6-53abf97bc9f3', 'BLACK-SHIMMY-WALL-BACKDROP-0207-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5fd2879d-01d9-4196-bf73-1cf0e1489373', 'c6e83554-d82e-49cb-8924-b128e7ba956d', 'HEART-OF-LOVE-BACKDROP-0208-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4f93869f-ca2e-45ef-9fff-44aa6c041c0c', '53622682-e528-44ca-ad1f-336783f216bb', 'GOLDEN-FLOWER-BOMB-BACKDROP-0209-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('29d994b5-63a5-4bbf-ae29-d57fcf6b19fa', '27682994-2119-4779-b5a4-f43e46063507', 'DELUXE-8-QT-FULL-SIZE-GOLD-ACCENT-CHAFER-0210-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d5e13c6a-8b35-42fd-ad6c-10e923896afa', '32505b22-9202-4d13-9475-b387224d71b4', 'BLACK-CIRCLE-WALL-BACKDROP-0211-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('82bc7096-f0ea-4965-91d5-4d34e48d10b8', '8cc48472-da74-4e24-8999-ef4fb45b36c2', 'LUX-CHAMPAGNE-WALL-0212-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9e523362-37c4-4e4b-9f6c-7bb0b646ab74', '3ad149c7-e3ba-4b08-9b24-5dfc7bd30e30', '360-PHOTO-BOOTH-0213-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8ec15f9f-225b-4038-9544-bb237a7be18a', '8114e176-3cda-4e89-ae72-4833453a9906', '3D-GRASS-WALL-BACKDROP-0214-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4ff26c13-09d0-4485-a29a-ce9ccf480cf6', '9409e443-35ff-44f4-bb19-ddf5d689f1e8', '2-SEATER-WHITE-BENCH-0215-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d4648631-cbd9-4b45-9001-f9093ee23150', 'e690b71a-75b8-438d-9bf3-ec3b8cedb687', 'COMING-2-AMERICA-0216-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('35dee41b-a235-43de-a95a-2f355997a2bf', '7d7a0137-bd3c-4adb-b972-60fa0b5c0ba5', 'GOLD-VASE-0217-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fc44f13d-469b-40e6-a630-efc2adb7f024', '2aca2f31-a879-4735-8299-af43d3429364', 'TUFTED-BACK-FLAT-SEAT-SOFA-3PCS-0218-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8afde874-4b05-483a-b646-500dc3c7beb5', 'e3fe24be-a32b-4228-9a0b-6ba67f058156', 'LIGHT-PINK-RUG-0219-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fc00856b-c9e6-4f8f-a743-4c70baf9318b', 'd952db17-b427-41a4-93a8-f158577c7a0c', 'DOTS-TABLECLOTH-0220-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f0967cb4-d812-488f-9c4b-ecd0876061eb', 'bc68fa17-f108-4f3a-aa0c-2a12c5cb3506', 'DANCE-FLOOR-3X3-0221-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0831d56f-d8bc-4c4b-adcb-09fd5e03887b', '4b28c4d0-16e0-4116-bc26-e56b4bf6c27a', 'QUICKLOCK-STAGING-8X8-INDOOROUTDOOR-STAG-0222-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8e74689b-18ea-4c11-b554-15cc96719652', '8f89faf8-b083-4dc3-891a-beb963519872', 'INFINITY-DINNING-CHAIR-0223-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('93b06044-bb9e-4740-ae77-f2832ff761e2', 'c2f4b9bf-fe98-4d4d-ad8f-7c843ce6a7f0', 'PATIO-HEATER-0224-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('becc2f20-ffbb-4bf4-a048-4672b5a1c8ff', '45450f5d-20d3-4f5e-9301-a9ab951012be', 'SIDE-PART-BACKDROP-0225-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('da79ba77-7d34-49d5-b423-184c3940a903', '9aed31ee-cf5f-41e4-939f-5202f08ad9e9', 'EXCAPE-THRONE-0226-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('13719a4a-187c-4913-8128-da2465a1e4f9', '3fb71ae1-ac5e-4511-a0d5-ef011c720252', 'MACY-STAND-0227-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('95432c47-d3b3-4027-a39c-45931f18d3d8', 'b99a5059-354d-4f21-9e41-1c6e80c82a83', 'WHITE-CHINA-RIM-0228-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d0fbdd93-d853-41c6-a929-07eab1387cfc', '20b3eeb4-e12d-48e9-949d-6fd2568df38c', 'CIRCLE-WINTER-WONDERLAND-ARCH-BACKDROP-0229-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cf76cbde-0062-48b6-a4ec-f4e11dc6aa30', 'aa82abc0-7443-4a25-a440-a9dd57a6bfb8', 'GOOD-LIFE-MIRROR-POLISHED-GOLD-SILVERWAR-0230-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dec78773-3314-4ffd-a911-6a77f23d87d7', 'ca0351bf-e295-4db4-940a-d28f60e5e48a', 'ACRYLIC-WALL-WHITE-0231-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8b8de6b8-8cb9-45de-b24a-67d3f42294ab', '3d1571a0-49dc-4aa4-afbc-a4b980320d11', 'BABY-BLOCKS-0232-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('106f2a60-df79-432b-9a61-5c0c3638cb69', 'f0a14f72-f1bb-4659-967c-7cbe8c0de494', 'SILVER-SHIMMY-BACKDROP-0233-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('df28bc6f-7eee-40ee-a568-7f31ea2d54f4', 'eb721d18-0c22-4fa3-bff6-8cd5d7eea676', 'HOT-AIR-BALLOON-0234-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b0a6ac7f-d352-4ac9-934e-9b91e3639c8f', '1bb42372-a92e-4774-921e-3844435cfa0e', 'LA-BELLE-FACADE-0235-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fa26c3f6-95d2-4093-b491-29c4a73d0265', '0cdc1897-4f8b-46b4-a030-3f5c75ffb290', 'GLITZ-SEQUIN-SPANDEX-CHAIR-BAND-0236-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('22f03aba-c668-4754-886a-2bfd953aac88', 'e9a9c338-467b-4e0b-8c7e-7ee6f5583913', 'GOLD-PEAL-THRONE-0237-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d8d8525d-460e-4f4c-8d7e-bb6403093267', 'dd647b8f-bcc6-472f-a8a5-91cfacb0aa28', 'BARBIE-HEAD-SHELF-0238-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cd5f5b06-544f-4a7e-aa92-a0b046f008c2', '75cc75ba-f8f2-4bfc-ab78-1ff342d95f91', 'MAJESTIC-VELVET-CHAIR-0239-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1191d51a-5eb4-4adc-b314-32f9fa5253cc', 'b742f210-a6cf-4264-9886-49a92fe80a32', 'CLASSIC-BOWL-BLACK-6-IN-0240-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('51e0595e-c0c5-488c-85b6-1de873816427', '929800ce-47e2-445e-bd52-5479d90cc934', 'WHITE-WINE-20-OZ-0241-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0c748e5c-d7de-4244-bac7-80cc1fc9d085', '4c7003ca-c832-4692-a19c-7bdb94f65f05', 'PRIME-AQUA-ROYALTY-CHAIR-0242-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('886764c1-2772-44c8-90cf-91e45d4600ef', '6409e269-a8b7-4cf5-8396-133047307ab5', '3-WAY-IN-CANOPY-BACKDROP-0243-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5983d052-ada3-45c1-8602-317bbf75b50a', 'db290efb-ff69-41e2-b6ea-3d88e81d6d78', 'EMERALD-SOFA-0244-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6c309a95-792d-4813-9342-f7e10d5a02e7', '4dc9edbf-bbce-4dad-9f3a-7d96ca08158f', 'THE-VIP-SINGLE-STALL-0245-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ad5368dc-f61f-4aa3-a452-89a8a8f1def6', 'd5b57a9b-b32f-48ca-9a58-d593fe483f8c', 'GLORY-DAY-0246-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('14aaf3e3-c298-4924-a2fd-651fcdd40928', 'e9e2c60d-94d8-4a3e-8ee4-dfcf884ac958', 'BIG-BARN-WALL-BACKDROP-0247-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4e4ba536-018d-49f3-81cf-d93d9f2544ea', '538d6497-2ffe-45db-a7ab-9960f17d4f7c', 'FLOWERING-DOGWOOD-TREE-PINK-11-FEET-TALL-0248-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('19cbfa8b-91c2-472f-a5f9-ef3fbd3d7d78', 'efad64f0-2b76-434d-be1d-fbf81f703188', 'ACH-WALL-0249-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1510cd60-74cc-4cfd-b22e-e87f3b911ebb', 'f026a40f-3cf2-4218-8846-49472ad8f010', 'CHROME-STANCHION-0250-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.195025+00', '2026-08-27 01:47:03.195025+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('da1634e9-baf0-41ba-bc10-6d0587936da1', 'b6718205-feed-4a00-bf51-9881b6743c9c', 'ROUND-STAGE-8FT-X8FT-0251-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c933096d-7ff8-48c2-bcb2-0b3b7a9da64d', '03dcbcf9-9508-41df-9d67-7db7b6c848ae', 'SPANDEX-BANQUET-CHAIR-COVER-0252-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d5ae53d5-eeb7-4888-b3e1-f8e8bcb3cd1c', '43866a10-c692-42f0-8acf-a25b4dcb69d1', 'LUX-TRIANGLE-WFLOWERS-0253-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fcc970aa-ce5f-4ba5-a48c-4a8cbab9105b', '92960b40-1f64-4545-9a74-4f926f2b66b2', 'CLOSED-BACK-3D-ARCH-0254-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6ae6d701-49ec-4502-822b-e81f59c9e005', '807c10fc-3482-4bf3-aeba-20cf9a579a5c', 'KIDS-PACKAGE-0255-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('257f21b4-56df-4b05-9c2d-3cccdaa0575a', '2fa031c3-7078-4af1-ae4e-33cee1b5c611', 'TABLE-NAPKIN-RED-0256-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5ab12dd3-f9d1-43dc-a7d1-6d08904fc09f', '59c563dc-ac7c-460a-9a6b-287c0bac007a', '3-ANGLES-0257-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f84fe510-83e1-4fca-8c5f-8909856edd69', '73afef06-6c09-48c1-9067-aa64ce2159cb', 'GENDER-REVEAL-PACKAGE-0258-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6c642a03-a66a-481b-bb7e-42fa7d03c3a6', 'c208d864-fefe-4c20-8254-a51d7f87473c', 'LUX-SWING-0259-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1e21a6dd-4c9f-4978-9073-be01e1f57318', 'eeccc173-6c3f-4eb9-bf75-8a34cae03c35', 'SPANDEX-TABLECLOTHS-FOR-6-FT-HOME-RECTAN-0260-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8a9ee323-0835-4ed8-874d-2d4820d75b87', 'cd400cff-6852-44cc-a1b4-13aa03bc97fb', 'RENAISSANCE-CHAFER-0261-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e12b6276-9b30-4c80-938e-5025d16563b3', '140f857a-aada-40ea-95b8-1aa8ca24c12a', 'HEART-BACKDROP-0262-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('561fd0f6-f2ea-4729-a9a8-4680e8cf3bf4', '4b1a203f-73be-4572-85d4-b2779cf27c61', 'MEYA-0263-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bc304e69-e04a-4c44-aa1b-61ff8e28a537', 'ad3256be-313a-453f-adc7-793e42323cbe', 'MIDNIGHT-DOUBLE-BACKDROP-0264-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('605bcddc-a6cc-45bf-a5f1-8efd47270aa4', '8f806209-33cb-40e5-beec-dc264b295e15', 'SILVER-BEADED-CHARGERS-0265-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8486242e-1eb5-49bb-b113-60e5aa526f99', '5fddfea9-95f0-49d8-9076-545e184d18af', 'ACRYLIC-WALL-BLACK-0266-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0b679ba7-9129-401e-8d54-266d1e8b8f62', '9e20cb2e-720b-425b-8969-ea7ecda0ba7e', 'LEXINGTON-GOLD-HIGHBOYS-0267-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('241c0559-c6fe-427c-b8b9-ce5379ce338e', '14851cdc-730f-4ff0-96f8-b2f4da0a429f', 'ELEGANCE-LUX-LOVESEAT-0268-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5a513e49-4751-420b-a458-2a9981f8bfac', 'bc9709cb-36e9-40fa-b221-9fd5f90f91df', 'STORE-FRONT-0269-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a0f1e6b9-1567-4510-a0c4-8f43dc8c4e90', '0f61afe8-8a63-42e3-a57d-441ac52b5626', 'FLOWER-RUNNER-PURPLE-PINK-0270-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d915ea9a-c22b-4107-82cb-d138780431f7', '0e53d332-803f-4a86-be2e-9618e39ff3d6', 'BABY-BLUE-COLUMN-0271-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9ceef2d5-5183-43fb-b107-ec46f6fe9a17', '629471c3-63ee-4aae-960b-feb58d33803e', 'LUX-BOHO-CHAIR-0272-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e7f8c253-6158-450f-9622-fc32bb477986', '7ac28248-46d9-4693-9f02-c04be48a81fe', 'TABLE-NAPKIN-FUCHSIA-0273-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e07bc82b-771f-495e-8950-e9aba4389e83', '469b637b-e705-4584-9ae3-a6dcc56dd889', 'SILVER-CHIAVARI-CHAIR-0274-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('94286423-a7f1-47bc-933a-558664e9f1fc', 'db266a09-0c65-4bd8-99a7-ece5bc51fbfa', 'STERNO-GEL-CHAFING-FUEL-0275-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9a172578-fbf4-498b-a254-94b970fecf84', 'bc63bb29-aaf9-49f6-838d-1f05d003b4ff', 'STAINLESS-STEEL-WEDDING-ARCH-0276-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5a0cb77a-191a-4981-8e76-d92327ac608a', 'db7396e5-503f-475a-a1f6-dd71f83c4501', 'ICE-TABLE-0277-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0f7970d6-f50d-44c2-b1c3-46630afbc54c', '717d2c7d-214b-4934-b027-20db29088638', 'LUXURY-LIFE-RUNNER-0278-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5588d021-ba71-49b7-94e5-e0b2bf20c830', '37ba7225-f8b2-4ce9-b94e-537902604662', 'POLY-NAPKINS-0279-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ffbaccac-71b2-48b5-8e49-aa7627d71c26', '7173735e-0845-4706-828f-626f308ca1b5', 'TABLE-NAPKIN-LEOPARD-0280-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('59923d9c-0d47-4631-ae1a-ddb91f7b7b88', '36fd8c95-54df-4649-aa50-919bf82b24c4', 'GOLD-RUFFLE-CHARGERS-0281-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cab36088-de77-4a56-8d5e-711c17a156df', '93a19012-0965-449e-a460-a28e6c5cf7f5', 'ECONOMY-8-QT-FULL-SIZE-STAINLESS-STEEL-C-0282-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5570d1a2-674b-4643-9510-baf76a91acb7', 'b9fb43a5-4ded-4be6-a3cf-dcc97859e7e3', 'LOVE-TABLE-0283-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a08542f7-51fe-4ce2-8b13-0b8679316658', '135c64e2-3eea-4832-86ea-387d34d45c81', 'FOOD-WARMER-0284-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('95a83403-9f0f-47b6-b91e-7c96e6388da9', 'd85a1deb-0a0d-4bd3-9644-98c1b355d842', 'POCKET-ARCH-0285-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ec8ffe5a-97cc-4ed2-9eaf-4e48bfadbaed', 'c1753967-c293-46bd-86fa-fa3bcf55fb67', 'NATURAL-BACKDROP-AND-BALLOON-0286-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('13b685c6-b618-4d7a-ae9a-8d936317d812', '0b9774d9-72a5-4ba7-a613-4b1f5dd6cc11', 'ALL-BLACK-PEARL-0287-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('195d6200-95fb-4607-a30f-f3e56e232eb0', '8189f923-e0d7-4a9c-8c0f-69b55bbd78ef', 'WHITE-DOME-PARTY-0288-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4b7908b2-6fff-40c7-a86f-9c41dd438107', '5afd5883-31a3-4eac-84aa-d6e7f36378c2', 'TIGER-PROPS-0289-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b1b50726-df5f-44e9-9b68-3b61a522607e', 'fbef3fcc-4818-4590-b27d-fab146b0d094', 'RAINBOW-ARCH-WALL-7FT-X-4FT-0290-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8aaa70eb-345a-4257-8e54-60b760692a33', '9a58a08f-3217-4644-b1fa-b414eb83b21b', 'BLUSH-COLUMNS-0291-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9e3ffc89-4d61-4c4a-a979-78830d14cbae', '9d38bc26-b12c-46b3-9b27-3f5f6b77dc9f', 'VINTAGE-TABLE-0292-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9aa6ea33-bc2e-48cb-9ad3-4d9a17f880ab', '9086a43a-9a55-4464-aa89-2ae549849e48', 'LED-COFFEE-TABLE-0293-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e74678a6-0a24-4bd6-93c6-4f132831dd73', '93c47ba1-cde1-4816-a8f9-9db64f5b5274', 'BUBBLE-GUM-LOVE-SEAT-0294-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('09089f0b-e9a1-4bc5-b8e7-8627b2f82baa', 'c7170ddc-d608-4eb8-a72f-4f7c912a7ba7', 'LIGHTNING-WALL-0295-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f2b59674-37ce-41e9-9e86-e669e3573a4d', '19ee9c9b-9b2e-4e78-a61a-78dc6f4fd67c', 'ROSE-LUX-SOFA-0296-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('57a1693b-e6db-428f-bd74-af78f64a834d', '2ca94cf9-b368-483d-b452-cbca142e539a', 'RED-SNUG-SOFA-0297-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8bf58fda-cbc7-4503-aef8-2780af0ffb0f', '6ede6604-9b07-476c-9beb-6899fda2e4f5', 'FARMHOUSE-BENCH-0298-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2cbc48c6-ff82-4381-adb0-7121bedb9b6f', 'e9e78e88-2276-4bf1-a52d-0952f79feee7', 'FLOWER-RUNNER-PURPLE-0299-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b9858a3e-f982-46d1-b37c-077ec7b04149', 'cb55737c-8a81-497c-b5c0-eabea4395f8e', 'NUDE-COLUMNS-0300-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.572533+00', '2026-08-27 01:47:03.572533+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('557448be-806e-4589-b07d-cbf66688bf5a', '61c64911-1fcd-451b-a1b0-c2281bb29d82', '5-WHITE-COLUMNS-0301-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4271666b-7fb4-4be5-b1bc-cb1080f7ccd1', 'd8d5ee41-613f-41d7-b4f2-09d6604a7731', 'CIRCLE-BACKDROP-0302-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('28875475-7a86-4afd-9e7e-dae2d5504100', '5536701e-2fc0-49be-94e3-e17773d67274', 'PERSONALIZED-BACKROP-0303-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e49b9ef2-98f2-41f2-8b03-a44202e8c629', '84bdd7ae-5de7-46c6-a5bd-374f78ee56a1', 'FULL-SIZE-CHAFER-CHOICE-CLASSIC-8-QT-0304-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('951d612c-6b65-4188-a144-3f948bfcb56c', 'f1687039-1590-46f5-b193-f825a4567f1a', 'HALO-WALL-0305-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c85af5eb-f17c-48ac-912f-594ba2344346', 'ba29961a-74ca-41c1-92b8-6e7ac85cfe75', 'LOTUS-BACKDROP-0306-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c8175e1d-ce6a-4f9e-9d84-131c034bb7f9', '0965e567-5102-477b-bfba-a705519bc5ff', 'TUNNEL-WALKWAY-LED-0307-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('81757107-1ae0-496e-a528-60b05f089258', '4484075f-3929-481e-957b-e9e6cb67832e', 'SILVER-CAGE-THRONE-0308-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('da817906-aa07-4e86-9336-a9dc305f92df', '67160666-cc90-4226-8ced-e5c04c09b8d9', 'CARPET-RUNNERS-0309-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1b478a83-101a-4fd5-bc51-a2c9811edf7b', '615a9e1d-2bbf-4cd2-8c6b-271adefb7c47', 'TREAT-STOREFRONT-0310-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ecf3b9ff-5853-4508-ba8c-9a25481d3a1b', 'ed606f26-091f-4d0e-9885-a11982a49dcd', 'FARM-TABLE-0311-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c815d254-ea77-47c5-b567-cafe678ff34e', '4c3764ae-162c-48f0-8582-b226b160994b', 'SPANDEX-BLACK-CHAIR-COVERS-0312-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('47cfda09-63c7-4ea7-989a-29531bcd8ba6', '3d119d3b-da4d-40b9-b1dd-38be15bbacbd', 'PLAIN-ROSE-GOLD-CHARGER-0313-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('207c4bad-23c9-4fda-a761-597f61868712', '592d7142-aaed-4e07-9ff6-ef83b943227c', 'STACY-BACKDROP-0314-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7becfbb7-814f-4726-a397-92998de5bcde', 'ea6767b0-8e66-4636-bd83-143ae00d2ecb', 'CLASSIC-THRONE-0315-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('96b312af-db7e-4fba-8a04-8e1b1bcca1d9', '8a10eb59-5c3f-44d0-9f74-88865939dc01', 'HENDRIX-52-VELVET-FLARED-ARM-LOVESEAT-0316-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4a110a5f-24f5-4cbe-9ab2-47f0d74b5463', '2615bd03-4ff5-45fd-b89a-311ac19240db', 'FLOWER-FRESH-WVASE-0317-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2177de10-8e9c-47c4-aa36-f2e5ad86dd00', 'ac779ce3-da13-4bdf-8742-eda90b6be091', 'FIVE-TOP-CRYSTAL-0318-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7356b84c-d860-454a-b9ea-a20b48c55193', '7bd7f5f2-bcf6-4bb4-b8c9-14fa90921308', 'MOI-PINK-VELVET-0319-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fe479028-4257-494f-96eb-726a6868a06b', '888c7f3f-f31d-47c4-8209-d64dc7a309f2', 'PINK-ELEGANCE-LOVESEAT-0320-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('45f78a91-a192-4af9-9d9e-bb80e48786ca', 'e1f5dee6-0f91-4cce-b310-58630aede5d7', 'PLAIN-SILVER-CHARGERS-0321-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7e187869-d5b2-4072-9c89-f999132eaa28', 'a7a7c909-7aca-44aa-aa8a-b314f36c14d5', 'FLOWER-WALL-BLUE-0322-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7b5a5d0a-ff5b-48fb-bb2d-2097eea2de56', '53ed38bd-8bb8-4c1a-ab36-1fd33491827d', 'BAMBOO-LOVESEAT-0323-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c989a1e3-1dab-4622-b485-34370cd2d9ef', '4686b202-cbf7-48e7-9d35-d53cc5b9c1f7', 'CLASSIC-FOUR-BACKDROP-0324-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('38d6f977-acf3-4757-82ad-24c57522758d', 'fc0e5507-d642-4895-a398-092adf1cc7ea', 'FLOWER-WALL-BACKDROP-0325-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('73bf66c9-d227-4b47-8228-affa28fcaae8', '8963c2c0-dca6-40e5-a779-61a43cc93c48', 'LUX-CAKE-TABLE-0326-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('665b9278-be5a-4fc4-8d40-1595cc3b64a7', '42375e76-bfb6-4832-9a8b-facc5871f540', 'COLD-SPARKLER-FOUNTAIN-0327-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('81da89e8-304e-47de-b3d6-fb520d51187c', '95b9431e-b914-4b5f-a72d-f34510201b15', 'LUX-MIRROR-SWING-0328-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('64ea9a93-287a-4bec-81b4-2708c930d755', '42470b15-5815-46f6-9b39-8ad000c1bdd6', 'TRIANGLE-TREATS-WALL-0329-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7fb588fd-0bf7-4971-ba36-aaa3e2b021ec', 'e2610ac2-d5f0-44ef-bf36-d5d7395d5944', 'MAGAZINE-PHOTO-BOX-0330-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1f69ebcc-df09-4687-adc7-45c8e9f536a8', '683cf203-0263-4a12-9d6f-f72867ba067e', 'PRIME-WHITE-ROYALTY-CHAIR-0331-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5cc929be-57db-4ec6-9383-1fc220a0751e', 'b04bdd1d-9709-49e2-a510-0047ae732024', 'GRASS-WALL-0332-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8955b702-12cb-4d30-a55b-542097165e81', 'b54757cc-81f4-46aa-813a-a798faa8781a', 'WEDDING-CROSS-0333-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('eb13665a-e493-4592-81e3-0cd712f83212', 'fa2966df-cb46-46f8-b289-5c9874b0f61a', '3-WAY-BACKDROP-0334-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ccf775bb-67bb-4e99-9b5f-ca4d8d8f72df', '451a7b8e-7fdb-441a-ba99-7ece081ee26b', 'SWEET-LUX-STATION-4FT-0335-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('656dc3c6-4214-4967-824f-5a1180d9fcfc', 'c056f533-3c72-45ce-8b3a-1b9481cbe6ee', 'KIDS-TABLE-4FT-0336-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b51459b1-9c2f-4434-bee0-eb8b2d766c45', '0da4dba0-4a02-4966-9528-0aa0ae9b17c0', 'LOTUS-FLOWER-CHANGING-LIGHT-0337-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('41bc6983-1c43-4acc-bb6d-b663b3f0a599', 'db99dfb3-bdcc-4f93-86f7-3722cc526525', 'RIPPLE-ARCH-WALL-BLUE-0338-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4da8319f-e10e-4c7f-8f6e-90af1fd88ab9', '18b459ca-c387-4840-b1a4-567d96fdb45b', 'BACK-DROP-POLES-0339-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d32b3334-9226-4ee1-a8b1-b547c77cba1d', 'c6d417b4-ffdf-4ca7-81d7-865ca007c07c', 'LOUNGE-CIRCLES-0340-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5fbed9bb-1837-4d6c-9a89-8d13d0a9c4ab', '3793f109-900f-4df1-ae43-a74f08259117', 'SINGLE-ANGLE-0341-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d5e9d0e6-8863-4ec3-8f31-06698cfeb899', 'caf0bc54-26be-4a62-8f13-70699dc0edb0', 'TABLE-NAPKIN-IVORY-0342-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5c83648d-f0f1-4cbc-900b-cfb8705dd12a', '7a5a9195-755a-43cd-bf76-91416d4e0acf', 'PRIME-LAV-ROYALTY-CHAIR-0343-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ce62bcc3-9746-469d-b933-2a52e85664dd', '3e581164-94fb-4b2e-92b2-15f03449125c', 'EARTH-TONE-0344-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d39b5cb9-21eb-4450-b774-65160e0c8faf', '35c2ae5c-c8be-4513-bcc3-12a36487d700', 'LUX-AFFAIR-0345-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0eccca24-f0ee-4c4b-b9ac-b149d8f23e40', '4557af33-f295-430b-b1fe-954bb9eedaae', 'SNOW-WHITE-TABLE-0346-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d471a8a3-43c8-4f14-8fb4-e6bcdbc07a67', 'cc9cf513-b021-461e-aa06-1db0f57eaa62', 'KIDS-THRONE-0347-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('606a90bc-7a5b-4b0a-8991-9daa95b467a6', '356be1a3-a5bf-48bf-8560-d45b6a955710', 'LEXINGTON-MINI-0348-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('87e1af15-0d58-4695-b35b-dbed208738f6', '53a85316-1799-45a3-9e3a-c6c90727ff0e', 'OLD-FASHION-HAGING-BACKDROP-0349-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d3965b61-0845-45e8-a14d-f3899b8f9b13', '4db5f2c8-3b1c-4337-9d35-059f04c2cd22', 'ELEGANCE-FOLDING-CHAIRS-0350-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.68015+00', '2026-08-27 01:47:03.68015+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('67e6722b-a0e0-493f-a593-f66535f86282', 'eb9c212a-3b57-42b3-a4a9-2695a42fe75e', 'CHAMPAGNE-ARCH-0351-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bcd4ca90-44e9-4a87-ad7c-9153295edde5', '94f2d066-9235-4ee9-9f06-5fbc7c060696', 'OVAL-WEDDING-BENCH-0352-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d865ec3e-ac5e-43d6-8d3f-26ae291c4fd6', '50071d49-948b-4b32-8556-76a582016913', 'THE-CURVE-THRONE-0353-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('50759484-c876-4c7f-9527-442891e823d9', 'dfdb5bdc-57ce-4b53-945e-5b26907bc91c', 'MARCI-BACKDROP-0354-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('724e2cca-3ac1-49cb-906f-84e7900f2167', '266b3c99-36a0-4e5f-960b-8a50dd98fb2a', 'KIDS-TRENDY-TABLE-PACKAGES-0355-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8478d2c9-803b-451d-8f87-ff8e5381298b', '0c05c4ba-300f-4379-a2b4-6f438c6faee7', 'SOLO-SECTIONS-SET-OF-3-0356-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('06a51f12-8412-4469-b861-87d65b255ec3', '6909f315-4727-4c38-9075-c493d9a1dab4', 'SPANDEX-PINK-CHAIR-COVERS-0357-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f5c9ce41-ebee-46de-b804-dceaad4ea3fa', '239c3e3b-ea7b-440b-a3fa-5d7f7ea091b0', 'REEF-CHARGER-0358-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cd98482f-7940-44a0-8b9c-3285061ea91f', 'e7cab3ac-9eaa-46c1-9bf5-14854ca53cb5', 'ICE-CREAM-PROPS-0359-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ab4112d1-aa03-4760-818b-9e220c650ca6', '5d30fb0d-f39c-4428-8eff-a1ef55ea2d71', '3D-LETTERS-0360-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('153cfc7b-e9c3-4a41-901b-080bedcc5531', '5414720e-c800-4ce1-9b7c-772155735b0a', 'SWEET-16-PACKAGE-0361-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5957035d-23ef-40d7-868a-330ffa0f9031', 'f5349435-934d-409a-a91a-48258e5f9f21', 'THE-ROYAL-POUR-0362-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2185b902-8ec9-4a1c-a1e6-34e8af07fbfd', '211aa27b-5f5c-4a26-b852-578f88755a9f', 'COTTON-NAKINS-0363-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8550208d-691d-41d9-b06b-168eaa1c4ede', '70212802-cf5b-4ff9-a2c5-0901cc38a227', 'PLAIN-GOLD-CHARGERS-0364-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c1d60073-845e-4221-ad2b-876884e52d9f', '6eaaf3db-b4c8-40cf-b896-bdf3150ebb5f', 'LED-CLOUD-6X6-0365-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('21221b81-25b5-4632-b296-2942460d9c01', '66c437e1-744b-42b2-9055-c7829e162e77', 'BARBIE-READY-0366-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8cde7c72-13ff-470c-8a9f-bab97894d8af', '250a7246-0067-4010-9295-d0a7ef7253aa', 'THE-MAJESTIC-BACKDROP-0367-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('000b62f4-4d6c-4582-8c7f-517d797d962e', '9dcd11d4-5800-4f24-9c5d-64ab2dcacb91', 'THE-CHEST-OF-GOLD-0368-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0a2ec7f2-08bf-485c-ae41-c51c4b46cccf', 'addef665-a1d4-46fc-b8c5-ee1a17812191', 'OVAL-LUX-GOLD-TABLE-0369-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5dd2249d-710f-432c-8f60-201bad654fa4', '8fe6b12e-8ed0-489d-aa33-70131d11e85a', 'RIPPLE-ARCH-WALL-PINK-0370-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b391d28f-4dff-4f38-8516-0486b59da4d8', 'e794f308-26af-4cb5-8be8-944495549e1d', 'FLOWER-RUNNER-PINK-0371-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('de75c71e-dc7f-4300-ad31-fe78ff2e2dae', 'ab9407ce-dcf2-46ef-900b-b962742dc86d', 'PRIME-PURE-WHITE-ARCH-0372-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('68ba11a4-f20b-4ba8-84b7-a47fe4a8bb4e', '8c4dce26-70f8-4cef-b0f3-6f26dc55c450', 'HIGH-ROLLER-SOFA-SET-3-0373-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1a3bdf66-c396-465b-9df2-10dcfedfd05d', 'ab8d3c7d-f41a-4d8b-967b-60178ee73318', 'PRIME-BLACK-ROYALTY-CHAIR-0374-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('71c96c35-86b7-40b8-be9d-bdb61eb73539', 'f16194e1-34c2-40d3-a7bc-361e73ab1fad', 'ROSE-GOLD-BEADED-CHARGERS-0375-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8447b0b1-7085-4c4c-93b4-085656829e50', '52f95ea4-36f6-4204-bd79-ecac748430c1', 'CRYSTALS-TRUMPET-VASE-0376-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('67b78c51-ed6c-4c5b-9887-6192cca9e1da', 'f144b0c0-28ac-493e-b47c-9d1d23738495', 'SIDE-TABLE-0377-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fd58e262-ee27-4714-9249-b97ea16272b3', 'd2886790-8ee2-4cbd-a87f-29f163ace862', 'MANZANITA-0378-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b4d57ffb-9725-4fac-87c4-fd911e1eecce', '720901c8-c6f5-4ac7-8f94-3c8afd570fea', 'RED-WINE-135OZ-0379-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('646e7942-2385-4005-9f75-4a253565758f', '2da9ba2c-3308-40f5-889d-6985b0ba1c8e', 'LED-CLOUD-WALL-4X5FT-0380-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e9c9b41f-cb32-44de-8bcc-4430b075d40c', 'a5ca3cf1-757f-4db7-9ed6-63ac561aed43', 'BRIDES-SPECIAL-0381-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2cc93dfb-acc8-408f-8379-6fd65e02810c', '47f4f411-535d-4450-bd11-bf7efc3979c5', 'GOLD-COLUMNS-0382-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9d00a81f-94e6-43e8-86bf-523836f65e21', '7986477a-9d9c-4acd-81cf-93481551f3e1', 'HOT-PINK-COLUMNS-0383-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('52341cd9-2c73-4c1e-ae7c-158b5034642d', '6159d0ce-4275-424e-b9d4-2c398c0d3b18', 'ELEGANT-CANDLES-0384-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('396b0653-f840-4b92-8647-86d3acfe4c5a', '95e5fb2e-b9e4-43e2-a084-f802867f3a83', 'BLACK-BEADED-CHARGERS-0385-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fc9a49c8-aab5-4902-a7a1-ff45eebfdd9c', 'f135e6a2-52d8-4174-898e-5b7ea7715874', 'SILVER-RUFFLE-CHARGERS-0386-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ce6a0fdf-fcc0-49b1-b38c-8f18eb7da3c7', 'aec1df6e-09c4-4d26-a092-6812c6852683', 'SLATTED-PEDESTAL-0387-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5988882f-0e1f-4f12-8c83-634f43b91761', '045b00e0-c24e-437d-8857-b5dd463bc3b5', 'SLIVER-PEDESTAL-0388-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('54745e51-3c1b-4656-b04a-91cc0ae48e92', '2ce4b22e-6497-4ee3-b733-9fae68e71332', 'BLACK-COLUMNS-0389-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('76a3e3a9-83d4-4fec-998c-7ebe5547fbfe', 'df4d8596-4c5c-4466-9373-6c39377b6658', '3-PIECE-SET-OF-METAL-CYLINDER-PEDESTALS--0390-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5ea6001e-822c-49c6-8c63-c7df4b1b3708', '0d8c78aa-9c4e-47ae-b5c2-31020bde1d67', 'ROYAL-BLUE-COLUMNS-0391-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9191594a-3cdc-48f7-ac78-2b04cc904e48', '164094c3-5cd8-4aa0-aea7-8757a0eb0cd8', 'RUTH-PEDESTALS-GOLD-0392-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2d208d16-8ef0-45ff-8010-366d764c3f25', 'fd2c06af-77d6-4cad-94e1-f6922643cbe9', 'GOLD-SQUARE-PEDESTALS-0393-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8bf5abcd-0163-4df0-99db-59122af000d9', '24aeafe5-88ee-40fb-8ebe-a7e17ce03c13', 'RUTH-PEDESTALS-SILVER-0394-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('204add54-569c-4500-8054-790bf81a1974', '1be980ba-f27b-49f9-b347-bc1cc3230e1a', 'CYLINDER-ACRYLIC-PEDESTALS-WHITE-0395-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('758cff3f-a7a3-48ac-9658-5fcee2ffaea4', '70fad228-311b-45b8-81ad-faaa939b0823', 'CHARICE-SHELF-0396-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6f8d9bfd-3625-4c7e-bddf-006638a1218c', '97b7f418-5ac6-4c5b-9dff-e3d5da74dd96', 'PRIME-CYCLE-CART-0397-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2ecd21ab-9887-481e-bef9-13d03a03aad6', 'e19b8609-f211-4079-ab8d-942907cb0fee', 'PUMPKIN-CART-0398-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('97accd41-eea9-4ef0-957c-14677fb48622', 'e0b280d3-4b3a-4c79-9af0-6b58e73e86a6', 'ALL-WHITE-CART-0399-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8c1a1e06-8c6d-480b-a500-57a55020a13c', 'd60c5664-92ec-4632-9e8b-96852bc5a1f2', 'PLAIN-RED-CHARGERS-0400-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.800854+00', '2026-08-27 01:47:03.800854+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b4896217-aa07-4410-8a59-6f6eef19cc1e', '1890008c-ea18-4f9b-b12e-3714193540bb', 'ECLIPSE-GOLD-CHARGER-0401-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a2e58614-eb2d-4f46-b483-e41ae7ed010c', 'e09a7a18-7f90-4790-89ea-5122b6157c3f', 'NATURAL-TONE-CHARGER-0402-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0e366736-743d-4915-9f14-6ae0326d2cf5', 'e1c2eb72-d703-439c-8bf9-a62acfccba0f', 'REEF-CHARGER-PLATE-PINK-0403-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('418b321c-8405-4f3b-833a-8e181234def8', 'a2878b98-45ae-4771-b562-22389020747e', 'REEF-CHARGER-PLATE-NAVY-BLUE-0404-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('01f76875-ebbc-4a2c-9305-18936f36c21d', '126e7584-aa82-47f0-8b25-b652f006f1db', 'REEF-CHARGER-PLATE-PURPLE-0405-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2c45565f-7515-415d-bb03-873beb9f6e2b', '68dff3f7-9a7b-4ca1-9fb2-dfbb78f4876e', 'REEF-CHARGER-PLATE-GOLD-0406-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ea7e1d89-1ff1-4933-891f-fbf397fb9b82', '21196bc1-48c4-4021-b809-e11fcb1c0cc4', 'REEF-CHARGER-PLATE-BLACK-0407-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9ddf0573-25bf-483b-bd24-2e334a9358d9', '68de7c1e-1ded-4cbf-b5e4-7b9d0d549d46', 'REEF-CHARGER-PLATE-AQUA-BLUE-0408-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6cbf47db-a20d-431b-bd4a-caf8bd984ff6', '0fd6b66d-8678-4971-9f95-773f43f1b95c', 'REEF-CHARGER-PLATE-BABY-BLUE-0409-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0f59f47b-79ab-4368-95b4-9a48edb3217a', 'dd3912ac-33d7-48e4-a935-03fe8d347026', 'REEF-CHARGER-PLATE-BURGUNDY-0410-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('39515014-2690-49f0-87ab-419aefd882c8', '26a9c3f3-93f7-4531-9966-1a304d44419a', 'REEF-CHARGER-PLATE-SILVER-0411-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5f440eb2-4591-40c8-81b9-f96b7decd0cf', 'aa6957b8-6fa2-49ec-8a55-a3a203b7d5e6', '3-PIECE-CYLINDER-CENTERPIECE-0412-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('537aebc2-e6f4-4f31-8bc1-07d933621d46', '6897a218-3c04-46fa-904e-397bf97d9aac', 'GOLD-VASE-1-0413-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('459c0be2-003f-4c85-a2f5-4064f5e7ce22', '6a269fd6-1b40-4636-ba36-55c0cc86e872', 'PEACH-TIME-CENTERPIECE-0414-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9333ffa0-f968-4a48-9900-f5b2096db0dd', '1d5457c9-c365-4a72-94a3-9cc80c223a40', 'THE-ELEGANCE-CENTERPIECE-0415-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ba6c99ab-1ef3-4a64-ba30-aff963b28a8f', 'a0d7629a-8058-481b-af6b-08ad31b87dbc', 'SPRING-VALLEY-CENTERPIECE-0416-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bd71e19c-d082-433d-abd9-46d0375b828f', 'c2b08d1d-c09c-4b28-a08a-d06a51dbce45', 'SILVER-VASE-0417-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fabe30e6-10f3-471e-9b04-196c88ff5a0f', '755700af-1b4a-4468-88ea-257637fecf96', 'ROUND-CRYSTAL-VASE-0418-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3cb926a0-3e31-47ca-9b0a-294717758884', 'b44c106c-7bd3-4408-8712-09ca2a05a2f0', 'SILVER-FRESH-FLOWERS-W-VASE-0419-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f9152443-551b-4e6c-ac90-0f724af86b1c', '40dc3706-6a37-49d8-9844-b2e715872f37', '3-GOBLETS-0420-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6e960cde-58b3-429c-94a5-e508377ed3d3', '7bae9644-83fa-41be-b0b5-e43817083f5b', 'FLORAL-BALL-0421-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b22dd6d8-9124-4c7a-92b1-32abe30963ed', 'bc2ed649-07bb-4bff-944e-35a84b88adbf', 'FLORAL-CARRIAGE-CENTERPIECE-0422-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2fcae0cf-dbcf-492a-9b76-5f40249511bd', '674dd381-732f-436d-8bc1-7b83c60894e4', 'BALLOON-CENTERPIECE-0423-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('40c05aac-32f9-4143-bfb1-01c9857ada4d', '62784fad-bfa1-4f19-99eb-7fb6cc2ac2fc', 'FLOWER-QUEEN-WVASE-0424-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('04cacdf9-5925-4ef6-9f55-c74ad9a5fc27', '66b6db38-17f4-4706-96be-b7bc9f997f4d', '3-SET-CORAL-0425-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('757f0c20-6485-47a6-9067-f3207bbc7c72', '3d039cc2-1182-438e-8c38-95e73b7a22c0', 'FRESH-FLOWER-0426-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0e85451b-3a90-43c3-a167-6539d98ac445', 'ab3270f1-eb3d-4e22-b31f-410110d605fb', 'GREEN-GARDEN-FLOWER-0427-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('480fc60d-c7db-4e1b-b1e7-ef6774bb3fb4', '11f6921d-ba7d-4d50-a602-aac759bcc6fd', 'SOLID-STRIPE-TABLECLOTH-0428-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b4590bd1-59b3-4311-af8c-138a37868023', 'c8d6ad0d-8366-48c2-bfce-f4edf94460c0', 'BEETHOVEN-TABLECLOTH-0429-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3d13bd52-37f8-4a75-b5a1-089c71fa66c3', '586d15ff-49c4-4797-955b-5043e42da67a', 'CHECKS-TABLECLOTH-0430-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('d86817f9-2ca9-491e-9410-e5f587495e01', 'ade75cf7-d56b-42de-8388-91cfa0c2926b', 'PLAID-TABLECLOTH-0431-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('db6f5562-aaa5-4e5e-bff8-f58e67f174c3', '4e5e5a8d-31c6-48ca-8eb2-5dc28ed93e76', 'AWNING-STRIPE-TABLECLOTH-0432-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f63011e3-bbc4-48a3-899a-3748fdddecab', 'dfd8577b-1d2c-45e8-90cf-dd31d84bbc62', 'VELVET-TABLECLOTH-0433-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ddd3bb2f-775b-4843-bfec-847f598f0f40', '2d3916a1-d63b-455c-83e4-eda41e4e35c8', 'RACE-CAR-TABLECLOTH-0434-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e44fce67-529c-4551-87a3-5e84c630219d', 'bf3f5984-8be1-4bf4-9a61-c73dcf2126f3', 'SEQUINS-TABLECLOTH-0435-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7ab75e37-0793-409e-9d82-21bde158080d', '8091a040-3f8c-4807-b249-e422e652c572', 'FLOWER-ON-SEQUIN-TAFFETA-TABLECLOTH-120--0436-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('85aa7e47-8910-4853-a342-657c780986c8', 'ed898f37-bd6c-4d38-b96e-9932039941f6', 'LARGE-ROSETTE-FLOWER-TABLECLOTH-0437-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ef5c0fb1-063e-4da2-a87f-78d8e5bc2ece', 'dcfe29e9-8ead-4479-9608-cb6e2aa17ae3', 'ROUND-PINTUCK-TABLECLOTH-0438-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('80203ffd-9410-4d4b-8edf-ebcfe3f6f80a', '285df256-788c-4610-85ed-4744f7756d70', 'ROUND-PAYETTE-SEQUIN-TABLECLOTH-IRIDESCE-0439-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ee91dc21-d5e1-4759-9c8d-9e632553efae', '602c5299-41c2-4450-90e6-22e523d2e11a', '1-RECTANGULAR-POLYESTER-TABLECLOTH-IN-DI-0440-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c0c41afb-c6d4-4568-8a57-a06140412d39', '91bfecfa-2233-4784-a718-aa941db7235d', 'ROUND-POLYESTER-TABLECLOTH-0441-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e6247944-9e6d-40b6-aaaa-212510a09e25', '92b1a0b1-0a9d-4bf5-97c9-ad766200ee9d', 'ROUND-SILK-EMBROIDERED-POLYESTER-TABLECL-0442-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('68d3dfb7-98a7-4e11-b051-5d130eae73db', 'bd41a0b3-bc31-4422-baf2-6d8babab5327', 'TABLE-NAPKIN-BURNT-ORANGE-0443-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f76725f2-fb6f-432a-9955-2e15f83cff4b', 'c95cdee6-e3be-441f-a187-56ee5a1d88b8', 'TABLE-NAPKIN-EMERALD-GREEN-0444-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('87ceb044-4853-4258-bf3d-9328202ee46a', 'fe94ed23-530e-445f-bd64-9d6af07c13c1', 'TABLE-NAPKIN-AQUA-BLUE-0445-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2b6c4944-9585-4d73-9262-5b215e970645', '4dc65db2-7047-41fe-8258-218617091506', 'TABLE-NAPKIN-LAVENDER-0446-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('dc2d7e02-5580-478f-8c65-682cb3f8d839', '7e99b322-aeb4-4284-ac4c-2bf1cca44b30', 'TABLE-NAPKIN-MEDIUM-PINK-0447-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b32f515b-549d-4c48-a636-f2b43fb7664f', 'abbb9959-506d-4349-9eec-32d823314c94', 'TABLE-NAPKIN-SILVER-0448-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5f85e50b-a651-40d0-a090-02563403be49', '8661dfe6-29e3-47ff-8c53-b3384b0e0ba5', 'TABLE-NAPKIN-PURPLE-0449-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8988b5b0-20c8-4886-99e8-bd008c6094aa', 'fec63399-3c7a-4125-9239-e7d84ca515cf', 'TABLE-NAPKIN-WHITE-0450-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:03.93186+00', '2026-08-27 01:47:03.93186+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('653c2a45-8f32-4cc0-8452-c5948a4fde95', 'b2842e77-88aa-493c-b020-e17db556dc50', 'TABLE-NAPKIN-CHAMPAGNE-0451-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2e74fe92-dfc1-4fb2-9e96-cae82e8aabff', 'e513d0df-7332-425a-9da4-81e8cd15159b', 'TABLE-NAPKIN-CORAL-0452-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7259c77e-af98-4828-9eba-c5b6cae7e2af', 'a183b33e-3597-402a-a034-3666967492b3', 'TABLE-NAPKIN-MAGENTA-VIOLET-0453-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8ddf1524-7bf7-4971-9ee1-8fca67b5d9f5', 'ee2ebd74-0876-44cf-b9de-3cdf06eb9ede', 'TABLE-NAPKIN-PEWTER-0454-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5a316a90-88bb-4f59-88b1-415758e8a0d5', '51455b69-bf27-4227-afbc-f88e8bd8dedd', 'TABLE-NAPKIN-GOLD-ANTIQUE-0455-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('95411a52-7cc7-4e71-bf8f-944523f407a2', '882746f5-5b1d-4044-ae54-ee644d76f658', 'TABLE-NAPKIN-BURGUNDY-0456-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fd6f956c-b9fc-4de7-9458-c7ccf4bbc9bc', 'd576420b-4b6c-4537-a1fc-86ff21524d00', 'TABLE-NAPKIN-CHOCOLATE-BROWN-0457-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0272bd24-3c2e-474a-8779-8eb9d984ed72', 'c4c0425a-2dc3-438e-b860-1bd0a235b723', 'TABLE-NAPKIN-APPLE-RED-0458-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f92d5442-a077-41de-9e44-d868e6853fc8', 'fc170ffd-6138-4096-8f0c-9a6b1f803951', 'TABLE-NAPKIN-BLACK-0459-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4a0c38ad-e3be-461f-ade5-27d45541d9df', '89656f6c-7222-4f41-8ce5-4fd973916934', 'TABLE-NAPKIN-ROYAL-BLUE-0460-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('97a21480-eee6-4c7d-bd9f-d3fb008f6703', '025cd4c6-f590-43e8-a35b-84f1b614271a', 'TABLE-NAPKIN-BRIGHT-GOLD-0461-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8cfdd0a0-5810-4797-abf0-c724250e8e11', '7e373907-384d-4ff7-86fa-8d6c45b5ac2b', 'TABLE-NAPKIN-KELLY-GREEN-0462-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0f57bc32-0614-41a9-b1db-3f67ffae3166', 'cad72a92-a285-4cd8-875b-581e6e6eee06', 'WHITE-LUX-TABLE-0463-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b73f4265-1b42-4c8d-a7bb-63fb420eebff', '0387dd66-3672-4b0f-b218-18a150d50c19', 'BANQUET-ROUND-PARTY-TABLES-0464-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('b8bee835-c39f-41c3-8c86-6a7fc02702ad', 'cf8b484b-0a5a-457a-94e9-7aa675b307a5', 'RECTANGULAR-BANQUET-TABLES-0465-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a82b6305-2e89-4dba-b416-483583911c8b', '59c70295-7de2-4356-a0bc-cfb6bb32acaf', 'GOLD-MIRRIOR-TABLE-0466-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('801ded50-62d9-462f-af2e-71e69ef57f0d', '686c86c5-da3e-49fa-aa4e-860c1f720acf', 'GOLD-SERPENTINE-TABLE-0467-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6ce91172-f3e4-490a-a938-2d9489d0788d', '31c6939e-1d19-4f17-a29f-6dd07243abd2', 'VOGUE-TRIANGULAR-TABLE-0468-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e8e6ef45-4a2a-4dac-9746-3082db4d95d0', '95d22e54-d91c-4442-a70b-43947f609bf3', 'FAB-GLASS-TABLE-0469-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('37ce6ee4-4ff2-4db3-b151-51a89e03a3e1', 'bb90f40b-984d-4a54-b01f-13e702e1d88a', 'CLEAR-RECTANGULAR-TABLE-0470-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a6d0eade-eca6-4f64-a916-25f00ee9a9a3', 'aebf96ec-2692-419f-9757-daa4b2b6d586', 'OLIVIA-RECTANGULAR-TABLE-0471-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c89e76e7-319e-4bcf-9c47-55633dbeb6d3', '264f0f43-2aac-414e-8ffb-1b15dad11fd5', 'PICKUP-SECURITY-DEPOSIT-0472-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('2f7e9679-f8ec-4e0c-b08a-63b5b701d358', 'a24b8368-64b7-4747-8496-525fcd1b7f2f', 'TENT-INSTALLATION-0473-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('79bc2475-7070-4cdd-93f0-6c12fc1ed169', '93c8386f-2a92-449b-a348-d2c781e5daf0', 'INSTILLATION-0474-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('358114b4-da5c-4c79-8c31-104970404e1c', '1b6d1a12-cafd-46d1-b283-3debb29b797f', 'WHITE-BOUNCE-HOUSE-3IN1-BOUNCEY-HOUSE-FO-0475-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('6cb36b0d-0e0a-43ab-8ca2-f509101ee55f', '09fdbe5c-2434-4ced-88f9-2b182e65d72f', 'OUTDOOR-SETTINGS-1-0476-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9fd773ac-cb6c-4eac-b407-e22117f5970f', 'a6eb1e54-797f-4fad-bb0b-a390521c8e0c', 'OUTDOOR-SETTINGS-2-0477-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f3909dfe-5259-414e-8538-5de100ec536e', '7a05378c-f90c-4714-a94f-eb67de0a6119', 'LED-CABANA-0478-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a54001a6-d812-401f-b68d-a2647db72dc7', 'aba8daf4-3705-4efd-a7d8-61b3f1991bdc', 'SINGLE-CABANA-WSOFA-TABLE-0479-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('06bc641f-2028-4da0-8ffc-533ea42eb9ae', 'dfadb91b-29fc-46a0-9c04-89d498c588ca', '10X10-TENT-0480-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('3b3a65dd-a994-4df2-9162-3dfbcbd50282', 'd9fd96c1-476e-4e6f-bc8f-9eb7d8f207ac', '20X30-TENT-0481-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5c0d61c9-8aa6-4902-998a-fa20c1b8c005', 'd5d0f334-16aa-43ca-a55b-5808aa0ec135', 'OUTDOOR-PACKAGE-4-0482-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('17e1f337-af11-4686-8412-cf115841c288', '35fa45cf-f873-4cbc-b6b0-4be1a5d625f9', 'OUTDOOR-PACKAGE-3-0483-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('c5384212-6b68-4b62-9e6f-af24619ab163', 'fdad86f9-eb14-4ec9-b922-807834d5325e', 'OUTDOOR-PACKAGE-2-0484-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7fafc201-8a8d-4c65-9544-f3d232644cdb', '85c77053-5467-406e-8ca4-232deaadcf69', 'OUTDOOR-PACKAGE-1-0485-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('19c959c1-cdaa-4392-a83e-971846fd25b7', 'aa0e97b4-af78-4b25-badd-b245efaff36d', 'FRINGE-UMBRELLA-0486-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('868857a7-3c69-4842-aa31-7090c06c0d20', 'b3dac527-126e-453e-b048-2b46ce605a03', 'MARKET-UMBRELLA-0487-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('5e900212-e097-4641-a8c1-aab9756bd668', '87c4ee5c-24e8-4328-abbf-d134d2d1a83e', '20X-40-TENT-0488-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8fb32cb8-5477-403a-ba70-3b98ddbbf66b', '244af647-da40-4e3d-9f2f-dd94476cb5fb', 'TENT-20X20-0489-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7b8b24d5-587e-40c4-9d9f-3c327cb6d67f', 'f8df127a-817e-4929-88b2-0f2cb5825403', 'WHITE-DESSERT-PLATE-0490-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('77567130-d7d2-4a6b-9800-9505ef3eb502', 'd7302698-3c36-424f-9332-4b09a2ee14a7', 'BLANC-WINE-GLASS-0491-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('df6a4204-17c9-4498-abc2-d14e3aeeec3e', '1994dd83-a297-42f5-8db6-09744f6e0b64', 'ROCKS-OLD-FASHIONED-GLASS-0492-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f0626dd9-bf63-464c-b167-2aeaa538865b', '55024e10-a6ff-4fe6-9177-1def3e8bf51e', 'CHAMPAGNE-FLUTE-625OZ-0493-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('fa4bd0c4-757b-43ba-8a90-021db7efd9ac', '7a80223b-2005-4cf4-8718-2d1abbc9471d', 'MODERN-LUXURY-MATTE-GOLD-SILVERWARE-0494-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('ffa7be83-0326-4d2c-bac9-c73da3861900', '93273328-8742-48fe-8722-67abdcf1b970', 'STONEWARE-MUG-12OZ-0495-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f0d0a220-98a5-4ebf-84f2-6afbb7b382d0', 'b28a92e1-8b62-4da7-9293-13afbf3851b9', 'STEMLESS-GLASS-205OZ-0496-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9bdf1bc9-d3a7-4902-ad68-fdf2f5c14c9a', '4ac0a738-8af7-4b8f-b558-ae4a343d6677', 'STAINLESS-STEEL-STEAK-KNIVES-0497-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('f5525c0f-6c4d-43fc-8b57-effe1a016681', '3319cb8d-b982-4aaf-8cda-c0db81806559', 'THE-DROP-FLATWARE-STAINLESS-STEEL-SILVER-0498-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a4f24c83-3b16-4be5-9066-9e6b90ca2b44', 'ad721538-4e7e-4be9-82de-127e64da9c04', 'BENTLEY-STAINLESS-STEEL-SPOON-0499-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('0ffcf77d-925b-4298-9996-09be87b06022', '0508ed69-aa2a-4fb1-a409-59f489e6c00e', 'WHITE-PLATE-75-IN-0500-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.053424+00', '2026-08-27 01:47:04.053424+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9b9ded9e-a13b-43e6-96b6-3f9f1599bd4e', '19d90b2c-6062-4e3b-82ca-370b3a8d99bf', 'WHITE-DINNER-PLATE-105-IN-0501-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('23f53696-ff81-47a0-aeb7-245a05e69cd8', '90b350c9-7107-45e0-b257-8e7f041bd7a0', 'CLASSIC-BLACK-PLATE-105-IN-0502-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('e991ad51-feb8-40a8-87d1-85026d67ebcd', '133734c3-6835-490a-ae63-0503b7f7d513', 'CLASSIC-BLACK-PLATE-75-IN-0503-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('be7c1ec0-db53-45fc-8637-4f0caa097f27', 'b6be8cde-dc28-4886-a79b-06b2d20052c6', 'WHITE-SERVING-COUPE-BONE-CHINA-PLATE-0504-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('61152fc6-d5c7-4141-9ec2-d6db033e2309', '876ff606-1bd4-460d-875b-2e398dbfbaec', 'GOLD-RIM-DINNER-PLATES-105-IN-0505-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('bf4a9cc6-6d89-456b-9a30-4d388c0de473', '8090033f-ef2a-40c1-9c54-0634212108ee', 'GLASS-PINT-JAR-16OZ-0506-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7a64c633-75be-460c-a3cd-e42182b69324', 'fdf34e7f-3fc2-4bcb-a479-0025368cfef9', 'GLASS-CARAFE-1-LITER-0507-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('04918493-c0f3-4bfe-81cd-deaac5bc15b8', '02bbe537-1d27-46ea-9486-314eaf3b9299', 'GOLD-FANCY-CHARGERS-0508-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('860bf006-f1b6-46b0-a062-54add10ea116', 'e4e78907-a196-4ecd-b388-d911c95bd53d', 'METALLIC-SILVER-CHARGER-0509-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('04e21e88-dae5-4c36-9a75-52479db673c9', '49f4eefe-38e9-499e-ae70-7038ffa6483f', 'ACRYLIC-REEF-SILVER-CHARGER-0510-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('82ed0176-1f5a-4ca0-85b4-900a913a8c93', '4f2f88db-db0e-40b8-a0ec-f6d7275608a5', 'ACRYLIC-REEF-BLACK-CHARGER-0511-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('4c24bb9e-98cb-49e6-8edf-d6730e39c31e', '2bf34a1a-447b-498c-95e6-7c5c16db226d', 'ACRYLIC-REEF-DUSTY-ROSE-CHARGER-0512-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a340d44a-c0e6-4cdd-b65b-4f623e51e7ba', '236e8467-c8e6-48b5-99b1-da14b807ed93', 'ACRYLIC-REEF-PINK-CHARGER-0513-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('afc2cd60-0d10-4a99-93bd-4c63bda1b6bc', '5484d5ff-8b2e-49f0-bafe-47f77e11995a', 'SILVERWARE-CHARGERS-0514-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('1460777f-5e2f-4bc7-b83b-3275709154fa', '99253826-30bc-429b-8d32-1995009a2735', 'ACCENT-SILVER-CHARGERS-0515-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('87cb3f69-e75a-40fd-9e2e-fec4b569f681', '5f5784d7-c7b3-4812-9d10-1bbf3328fa72', 'GOLD-AND-BLACK-RUFFLE-CHARGERS-0516-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('8e1960f3-7831-4143-95be-cd5442b382b7', '079ebe57-380d-4ce1-b643-535d966984f8', 'BLUE-RUFFLE-CHARGERS-0517-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('569ed2d3-4d56-44b0-9fe6-1bcb55344ac9', '834008d5-9e79-46c2-9fad-a2bc0d467a97', 'ACCENT-BLACK-CHARGERS-0518-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('a91c662b-a1fb-4eed-8b55-cff4453a2084', 'b1869cc4-093a-4175-9cb4-54f9bb0f0416', 'STONE-TONE-CHARGERS-0519-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('7f835276-36d8-4b4b-b586-8d94204ceb2c', '2add1203-0f53-48d4-b751-0ced685824ea', 'GOLD-GLASS-CHARGER-0520-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('60f9f833-d4d4-40d4-96b1-4a4e28d7464a', '3ce31a36-ce14-4a07-aeff-623226df4a5b', 'LUX-GOLD-CHARGER-0521-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('175a1c05-20f6-49bd-8555-8157b90951e4', '061a1dcb-db84-4269-990a-9a936042562e', 'THE-MINT-HAVEN-DISPLAY-0522-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('cdb1475f-8892-4f2d-ae71-143f1b9bee9a', '70688b34-f06a-4278-b923-90c8043bd981', 'CRYSTAL-GLOW-TABLE-0523-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('531c2e7b-6c48-46a4-a18c-be02d8c0fbbc', 'a7d696f2-74ed-4d0a-9eca-70f641f1dce9', 'CLOUD-STAGE-0524-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('43008d8f-e80b-43bc-8f8a-eea2582fca6a', '9dd3fc02-ba42-41a5-8c06-244d4762e106', 'AURORA-STAGE-0525-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');
INSERT INTO public.inventory (id, product_id, serial_number, status, condition_notes, purchase_date, last_maintenance_date, next_maintenance_date, location, created_at, updated_at) VALUES ('9e7d2473-3337-42b5-8d35-a5e672fda2ee', '2ac28bf3-a6fb-4a3c-ae8d-a4f5ce51744d', 'ANGEL-WINGS-0526-001', 'available', 'Seeded from scrape; catalog qty≈10', NULL, NULL, NULL, 'Warehouse A', '2026-08-27 01:47:04.176457+00', '2026-08-27 01:47:04.176457+00');


--
-- Data for Name: inventory_reservations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: maintenance_checklists; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: maintenance_records; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_promo_codes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: partner_profiles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: partner_shared_carts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: partner_tier_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.partner_tier_settings (tier, label, base_discount_percent, hold_hours, created_at, updated_at) VALUES ('preferred', 'Preferred', 10, 72, '2026-08-27 19:41:52.991858+00', '2026-08-27 19:41:52.991858+00');
INSERT INTO public.partner_tier_settings (tier, label, base_discount_percent, hold_hours, created_at, updated_at) VALUES ('elite', 'Elite', 15, 120, '2026-08-27 19:41:52.991858+00', '2026-08-27 19:41:52.991858+00');
INSERT INTO public.partner_tier_settings (tier, label, base_discount_percent, hold_hours, created_at, updated_at) VALUES ('house', 'House', 20, 168, '2026-08-27 19:41:52.991858+00', '2026-08-27 19:41:52.991858+00');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.permissions (id, name, display_name, description, resource, action, created_at) VALUES ('813c83c6-947d-43dd-a13e-43b988d9ff0a', 'users.view', 'View users', NULL, 'users', 'view', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.permissions (id, name, display_name, description, resource, action, created_at) VALUES ('5a700f3b-57f8-4dc0-b1cc-055e05710dc9', 'users.create', 'Invite users', NULL, 'users', 'create', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.permissions (id, name, display_name, description, resource, action, created_at) VALUES ('064111c0-d1b2-497f-9684-379153909ec9', 'users.update', 'Update users', NULL, 'users', 'update', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.permissions (id, name, display_name, description, resource, action, created_at) VALUES ('b94282a1-02b4-4253-9a38-e26b0978be04', 'users.manage', 'Manage roles', NULL, 'users', 'manage', '2026-08-27 03:50:30.841799+00');


--
-- Data for Name: pick_list_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: pick_lists; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2a108558-ebf5-44d0-8732-393fca29cdd4', '40'' x 60'' Luxury Tent', '40x60-luxury-tent', 'Premium outdoor tent with sidewalls and climate control options', '8c6fc077-2f8a-40d2-bb48-cac13be3ac3f', 'TENT-40X60-LUX', 250000, NULL, 800.00, 40.00, 60.00, 12.00, 240, false, 1, 'tent-luxury.jpg', NULL, '{"flooring": "Optional", "material": "Commercial Grade Vinyl", "sidewalls": "Included", "weather_resistant": true}', true, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('eaa37021-8986-47d8-a548-3f906ae4a47b', '60" Round Tables', '60-round-tables', 'Classic round tables seating 8-10 guests each', '5d8b6034-9fa4-4bdb-a563-076a5902c632', 'TABLE-60-ROUND', 2500, NULL, 45.00, 5.00, 5.00, 2.50, 10, false, 1, 'table-round.jpg', NULL, '{"height": "30 inches", "capacity": "8-10 guests", "diameter": "60 inches", "material": "High-quality plywood with vinyl top"}', true, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a014226c-c083-4800-a9ce-fa8985e90678', 'Gold Chiavari Chairs', 'gold-chiavari-chairs', 'Elegant gold chiavari chairs perfect for weddings and formal events', 'be3a4ac5-84df-4c55-991e-37b9b0cdff92', 'CHAIR-CHIAVARI-GOLD', 850, NULL, 8.50, 1.50, 1.50, 3.00, 2, false, 1, 'chair-chiavari.jpg', NULL, '{"color": "Gold", "cushion": "Ivory cushion included", "material": "Resin", "weight_capacity": "250 lbs"}', true, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0ed8abcb-8c66-47aa-8ea1-ce41344856bf', 'Crystal Chandeliers', 'crystal-chandeliers', 'Stunning crystal chandeliers for elegant lighting', 'eaf595fe-543d-458e-b5de-4aabb5cfaf5a', 'LIGHT-CHANDELIER-CRYSTAL', 45000, NULL, 25.00, 2.00, 2.00, 3.00, 45, false, 1, 'chandelier-crystal.jpg', NULL, '{"type": "Crystal", "bulbs": "LED compatible", "height": "36 inches", "diameter": "24 inches", "installation": "Professional required"}', true, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b6326098-757e-4310-8fe8-d58ab5fc2407', 'Party in a Box (Ultimate)', 'party-in-a-box-ultimate', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'PARTY-IN-A-BOX-ULTIMATE-0001', 145000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/party-in-a-box-ultimate.jpg', '{/images/products/party-in-a-box-ultimate.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a90e8bba-f101-4dc9-b4c4-c67cde326fe4', 'Party in a Box (Baby Shower)', 'party-in-a-box-baby-shower', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'PARTY-IN-A-BOX-BABY-SHOWER-0002', 190000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/party-in-a-box-baby-shower.jpg', '{/images/products/party-in-a-box-baby-shower.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('425f6e6f-b74a-45a5-8efa-114703b4707c', 'Party in a Box (Graduation)', 'party-in-a-box-graduation', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'PARTY-IN-A-BOX-GRADUATION-0003', 200000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/party-in-a-box-graduation.jpg', '{/images/products/party-in-a-box-graduation.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e99fa949-e48a-435b-90ed-953ad9a91d4e', 'Scarlet Royale Frame', 'scarlet-royale-frame', 'Scarlet Royale Frame.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'SCARLET-ROYALE-FRAME-0004', 67500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/scarlet-royale-frame.jpg', '{/images/products/scarlet-royale-frame.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7d65ed1f-acb8-482f-9a83-d51c994fa46f', 'Scottsdale Arch', 'scottsdale-arch', 'Scottsdale Arch.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'SCOTTSDALE-ARCH-0005', 37500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/scottsdale-arch.jpg', '{/images/products/scottsdale-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('596db12b-7f0e-472a-baf0-b4673bd2bccc', 'Sapphire acrh', 'sapphire-acrh', 'Sapphire acrh.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'SAPPHIRE-ACRH-0006', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sapphire-acrh.jpg', '{/images/products/sapphire-acrh.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('31042258-b840-4a02-af06-5d0f5973d843', 'Clover wave Acrh', 'clover-wave-acrh', 'Clover wave Acrh.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'CLOVER-WAVE-ACRH-0007', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/clover-wave-acrh.jpg', '{/images/products/clover-wave-acrh.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bd12248f-654b-4207-8ca4-bb9ddb3db1ef', 'Ana set', 'ana-set', 'Ana set.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'ANA-SET-0008', 60000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ana-set.jpg', '{/images/products/ana-set.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1fcf5b87-5c30-4653-bc64-d0ff1617eca6', 'Waves of Elegance Backdrop 8x8ft', 'waves-of-elegance-backdrop-8x8ft', 'Waves of Elegance Backdrop 8x8ft.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'WAVES-OF-ELEGANCE-BACKDROP-8X8FT-0009', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/waves-of-elegance-backdrop-8x8ft.jpg', '{/images/products/waves-of-elegance-backdrop-8x8ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0dabd14e-5dc4-4d06-ba01-45b4da520326', 'JOLIE"S  BACKDROP', 'jolies-backdrop', 'JOLIE"S  BACKDROP.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'JOLIES-BACKDROP-0010', 65000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/jolie-s-backdrop.jpg', '{/images/products/jolie-s-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b239b9dc-66ae-4851-a59c-db86aad2e56a', 'Story Book', 'story-book', 'Story Book.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'STORY-BOOK-0011', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/story-book.jpg', '{/images/products/story-book.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d0187014-6b8e-4903-90a0-a8d27c12771c', 'Fresh Kicks Display 6ft', 'fresh-kicks-display-6ft', 'Fresh Kicks Display 6ft.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'FRESH-KICKS-DISPLAY-6FT-0012', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fresh-kicks-display-6ft.jpg', '{/images/products/fresh-kicks-display-6ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ca2a2ca8-1b72-4450-ae3c-304da3d651bf', 'Moon 7ft', 'moon-7ft', 'Moon 7ft.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'MOON-7FT-0013', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/moon-7ft.jpg', '{/images/products/moon-7ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7f1c6e89-71a7-4b2b-93d8-2a2d70e62f71', 'Santorini wall package', 'santorini-wall-package', 'Santorini wall package.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'SANTORINI-WALL-PACKAGE-0014', 100000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/santorini-wall-package.jpg', '{/images/products/santorini-wall-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6bf88522-6e7c-4ed8-9f5c-51fd48082615', 'Boxwood  Wall 6ft x 3ft', 'boxwood-wall-6ft-x-3ft', 'Boxwood  Wall 6ft x 3ft.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'BOXWOOD-WALL-6FT-X-3FT-0015', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/boxwood-wall-6ft-x-3ft.jpg', '{/images/products/boxwood-wall-6ft-x-3ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b5895cca-78f5-49d3-8928-958d7e99ffa0', 'Sugar Blossom Patisserie 🌸🍩', 'sugar-blossom-patisserie', 'Sugar Blossom Patisserie 🌸🍩.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'SUGAR-BLOSSOM-PATISSERIE-0016', 50000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sugar-blossom-patisserie.jpg', '{/images/products/sugar-blossom-patisserie.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('13a6bd85-7ab3-4a37-9695-a54ca11db791', 'Rustic Red Barn Wall', 'rustic-red-barn-wall', 'Rustic Red Barn Wall.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'RUSTIC-RED-BARN-WALL-0017', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rustic-red-barn-wall.jpg', '{/images/products/rustic-red-barn-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b5b47010-ad90-450c-9d0d-42f7578ac5e7', 'F&M Arch Wall', 'fm-arch-wall', 'F&M Arch Wall.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'FM-ARCH-WALL-0018', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/f-m-arch-wall.jpg', '{/images/products/f-m-arch-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2aef4d67-3012-404c-9064-d3323ae02602', 'Fanta Shelf Wall | 8ft x 8ft', 'fanta-shelf-wall-8ft-x-8ft', 'Fanta Shelf Wall | 8ft x 8ft.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'FANTA-SHELF-WALL-8FT-X-8FT-0019', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fanta-shelf-wall-8ft-x-8ft.jpg', '{/images/products/fanta-shelf-wall-8ft-x-8ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0af5076d-9c80-4ca0-b8a9-9b357df3b55b', 'Trio Wedding Gold Arch', 'trio-wedding-gold-arch', 'Trio Wedding Gold Arch.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'TRIO-WEDDING-GOLD-ARCH-0020', 105000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/trio-wedding-gold-arch.jpg', '{/images/products/trio-wedding-gold-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('de9ca979-9f7b-4de8-85c6-437db0bd8d81', 'The Crain wall', 'the-crain-wall', 'The Crain wall.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'THE-CRAIN-WALL-0021', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-crain-wall.jpg', '{/images/products/the-crain-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('63f6c934-3cb8-462a-ae70-0cb4e6ba51d5', 'Alice flower box 6ft x 4ft', 'alice-flower-box-6ft-x-4ft', 'Alice flower box 6ft x 4ft.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'ALICE-FLOWER-BOX-6FT-X-4FT-0022', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/alice-flower-box-6ft-x-4ft.jpg', '{/images/products/alice-flower-box-6ft-x-4ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f3dc97a4-57ca-4029-9bc5-262c02045e75', 'Luxe Tote', 'luxe-tote', 'Luxe Tote.', '22fc9ccf-d5aa-4111-92de-81aab1b7fbe8', 'LUXE-TOTE-0023', 65000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/luxe-tote.jpg', '{/images/products/luxe-tote.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0f8569d3-f539-442e-8a49-26cf5bda7b3d', 'RED FLOWER WALL BACKDROP', 'red-flower-wall-backdrop', 'RED FLOWER WALL BACKDROP.', '0f40ee1b-212d-48e8-acd4-4c16bcdac978', 'RED-FLOWER-WALL-BACKDROP-0024', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/red-flower-wall-backdrop.jpg', '{/images/products/red-flower-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2967da0e-e7e6-42c4-ad70-613163f9ae75', 'Grand Flower Wall Backdrop', 'grand-flower-wall-backdrop', 'Grand Flower Wall Backdrop.', '0f40ee1b-212d-48e8-acd4-4c16bcdac978', 'GRAND-FLOWER-WALL-BACKDROP-0025', 40000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/grand-flower-wall-backdrop.jpg', '{/images/products/grand-flower-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('974f8816-db2f-42e2-9d39-7876e74069c5', 'FLOWER WALL & BALLOON', 'flower-wall-balloon', 'FLOWER WALL & BALLOON.', '0f40ee1b-212d-48e8-acd4-4c16bcdac978', 'FLOWER-WALL-BALLOON-0026', 58000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-wall-balloon.jpg', '{/images/products/flower-wall-balloon.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('61f9f8dc-8067-4cf7-ba9e-76a6fbf697e9', 'Flower Wall (Touch of Pink)', 'flower-wall-touch-of-pink', 'Flower Wall (Touch of Pink).', '0f40ee1b-212d-48e8-acd4-4c16bcdac978', 'FLOWER-WALL-TOUCH-OF-PINK-0027', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-wall-touch-of-pink.jpg', '{/images/products/flower-wall-touch-of-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b9bd75be-da97-463f-a45d-98b81f9a06b6', 'Shimmer Wall (Gold)', 'shimmer-wall-gold', 'Shimmer Wall (Gold).', 'c509f672-2463-46db-85d8-73c29112797c', 'SHIMMER-WALL-GOLD-0028', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/shimmer-wall-gold.jpg', '{/images/products/shimmer-wall-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('72f0a603-164a-453f-be47-57b0cc642f9a', 'Shimmer Wall (Black)', 'shimmer-wall-black', 'Shimmer Wall (Black).', 'c509f672-2463-46db-85d8-73c29112797c', 'SHIMMER-WALL-BLACK-0029', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/shimmer-wall-black.jpg', '{/images/products/shimmer-wall-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f91c8196-6040-412f-815f-a2df42571c21', 'Shimmer Wall (Silver)', 'shimmer-wall-silver', 'Shimmer Wall (Silver).', 'c509f672-2463-46db-85d8-73c29112797c', 'SHIMMER-WALL-SILVER-0030', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/shimmer-wall-silver.jpg', '{/images/products/shimmer-wall-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7d9544ec-bf6f-46cc-87d5-c4466dbe7925', 'Soft Touch Wall (Black)', 'soft-touch-wall-black', 'Soft Touch Wall (Black).', '9a012d58-8c10-4d34-935d-46459d933740', 'SOFT-TOUCH-WALL-BLACK-0031', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/soft-touch-wall-black.jpg', '{/images/products/soft-touch-wall-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('948b0453-48a9-4fe0-ae45-8aac8c791355', 'Malibu Bar 6ft', 'malibu-bar-6ft', 'Malibu Bar 6ft.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'MALIBU-BAR-6FT-0032', 32500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/malibu-bar-6ft.jpg', '{/images/products/malibu-bar-6ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('43711411-23da-4e18-aeb5-66bbda7e8b20', 'Lux Bar', 'lux-bar', 'Lux Bar.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'LUX-BAR-0033', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-bar.jpg', '{/images/products/lux-bar.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e6f5ff6f-b47a-42a5-9157-16341dd8e242', 'White CHAMPAGNE WALL', 'white-champagne-wall', 'White CHAMPAGNE WALL.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'WHITE-CHAMPAGNE-WALL-0034', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-champagne-wall.jpg', '{/images/products/white-champagne-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dac67771-2439-49d4-9c24-3969c05aef94', 'Black Champagne Wall', 'black-champagne-wall', 'Black Champagne Wall.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'BLACK-CHAMPAGNE-WALL-0035', 18000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-champagne-wall.jpg', '{/images/products/black-champagne-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b1dfef93-e221-4f82-91c2-fa21604dac2d', 'Walnut laminate bar', 'walnut-laminate-bar', 'Walnut laminate bar.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'WALNUT-LAMINATE-BAR-0036', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/walnut-laminate-bar.jpg', '{/images/products/walnut-laminate-bar.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7657c334-6f38-4c1d-b453-ad3bf1bd5ac8', 'White Formica Bar', 'white-formica-bar', 'White Formica Bar.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'WHITE-FORMICA-BAR-0037', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-formica-bar.jpg', '{/images/products/white-formica-bar.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('50ffa976-8167-4d3d-bd08-d957fad6f222', 'Laminate black bar', 'laminate-black-bar', 'Laminate black bar.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'LAMINATE-BLACK-BAR-0038', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/laminate-black-bar.jpg', '{/images/products/laminate-black-bar.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('eaf1c5e0-4b64-47f6-852b-a41115a7d758', 'GRASS BAR', 'grass-bar', 'GRASS BAR.', '1707c002-5fe3-49a9-924c-ff7ac503b754', 'GRASS-BAR-0039', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/grass-bar.jpg', '{/images/products/grass-bar.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5cb9ab07-a0ea-4210-8c22-7efc9a9ab183', 'LUX GOLD BAR STOOL', 'lux-gold-bar-stool', 'LUX GOLD BAR STOOL.', 'f675ad56-4e10-46bd-bd69-1741b96b5495', 'LUX-GOLD-BAR-STOOL-0040', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-gold-bar-stool.jpg', '{/images/products/lux-gold-bar-stool.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b935ae1a-9fa4-4be9-89ca-b5a9da820752', 'Stylish Vintage  Barstool 30”', 'stylish-vintage-barstool-30', 'Stylish Vintage  Barstool 30”.', 'f675ad56-4e10-46bd-bd69-1741b96b5495', 'STYLISH-VINTAGE-BARSTOOL-30-0041', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stylish-vintage-barstool-30.jpg', '{/images/products/stylish-vintage-barstool-30.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('76ccd107-03f8-41dd-bd5b-8dbc1ca97134', 'Stylish Vintage  Barstool 24”', 'stylish-vintage-barstool-24', 'Stylish Vintage  Barstool 24”.', 'f675ad56-4e10-46bd-bd69-1741b96b5495', 'STYLISH-VINTAGE-BARSTOOL-24-0042', 1200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stylish-vintage-barstool-24.jpg', '{/images/products/stylish-vintage-barstool-24.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0c3e8eda-06e5-4908-864f-24a7be4f2fa2', 'LUX SILVER BAR STOOL', 'lux-silver-bar-stool', 'LUX SILVER BAR STOOL.', 'f675ad56-4e10-46bd-bd69-1741b96b5495', 'LUX-SILVER-BAR-STOOL-0043', 2000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-silver-bar-stool.jpg', '{/images/products/lux-silver-bar-stool.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f80667ab-0e42-4878-b2c5-69e653de65e9', 'O Back Gold Bar Stool', 'o-back-gold-bar-stool', 'O Back Gold Bar Stool.', 'f675ad56-4e10-46bd-bd69-1741b96b5495', 'O-BACK-GOLD-BAR-STOOL-0044', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/o-back-gold-bar-stool.jpg', '{/images/products/o-back-gold-bar-stool.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9091a8ae-5854-4670-8908-4d5c560af621', 'White cocktail', 'white-cocktail', 'White cocktail.', '4fd0bdec-6340-49ab-984b-3ef410333037', 'WHITE-COCKTAIL-0045', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-cocktail.jpg', '{/images/products/white-cocktail.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4869bbfd-1361-42c9-ac42-468e7fdc2ba0', 'Led Champagne table', 'led-champagne-table', 'Led Champagne table.', '4fd0bdec-6340-49ab-984b-3ef410333037', 'LED-CHAMPAGNE-TABLE-0046', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-champagne-table.jpg', '{/images/products/led-champagne-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e36b3087-3cc4-4ed8-8dd0-7f90a78fe318', 'Highboy Cocktail Round Spandex Table cover', 'highboy-cocktail-round-spandex-table-cover', 'Highboy Cocktail Round Spandex Table cover.', '4fd0bdec-6340-49ab-984b-3ef410333037', 'HIGHBOY-COCKTAIL-ROUND-SPANDEX-TABLE-COV-0047', 1350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/highboy-cocktail-round-spandex-table-cover.jpg', '{/images/products/highboy-cocktail-round-spandex-table-cover.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f915521b-df93-4572-a397-914dc983ab29', 'COCKTAIL TABLES', 'cocktail-tables', 'COCKTAIL TABLES.', '4fd0bdec-6340-49ab-984b-3ef410333037', 'COCKTAIL-TABLES-0048', 1450, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cocktail-tables.jpg', '{/images/products/cocktail-tables.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dda9bbf7-767d-469e-b83a-d8c7d1c81bab', 'Spandex Tablecloth for Cocktail Tables', 'spandex-tablecloth-for-cocktail-tables', 'Spandex Tablecloth for Cocktail Tables.', '4fd0bdec-6340-49ab-984b-3ef410333037', 'SPANDEX-TABLECLOTH-FOR-COCKTAIL-TABLES-0049', 1350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-tablecloth-for-cocktail-tables.jpg', '{/images/products/spandex-tablecloth-for-cocktail-tables.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aec3db32-c5bf-4ecd-b0aa-53b17e2807cd', 'LED COCKTABLE  TABLE', 'led-cocktable-table', 'LED COCKTABLE  TABLE.', '4fd0bdec-6340-49ab-984b-3ef410333037', 'LED-COCKTABLE-TABLE-0050', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-cocktable-table.jpg', '{/images/products/led-cocktable-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.4957+00', '2026-08-27 01:47:02.4957+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4732a959-06ea-4448-838d-edfbca263c57', 'Trisha Bar Table (Silver)', 'trisha-bar-table-silver', 'Trisha Bar Table (Silver).', '4fd0bdec-6340-49ab-984b-3ef410333037', 'TRISHA-BAR-TABLE-SILVER-0051', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/trisha-bar-table-silver.jpg', '{/images/products/trisha-bar-table-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7d79b944-de19-4c6e-8bdb-eaeb215b5e4d', 'Trisha Bar Table (Gold)', 'trisha-bar-table-gold', 'Trisha Bar Table (Gold).', '4fd0bdec-6340-49ab-984b-3ef410333037', 'TRISHA-BAR-TABLE-GOLD-0052', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/trisha-bar-table-gold.jpg', '{/images/products/trisha-bar-table-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('09674cfd-b5df-4bd8-be29-d452130212a4', 'Circle Bar Table (Silver)', 'circle-bar-table-silver', 'Circle Bar Table (Silver).', '4fd0bdec-6340-49ab-984b-3ef410333037', 'CIRCLE-BAR-TABLE-SILVER-0053', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/circle-bar-table-silver.jpg', '{/images/products/circle-bar-table-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('beaee00b-cf0d-4641-af45-c4f49750c48f', 'Circle Bar Table (Gold)', 'circle-bar-table-gold', 'Circle Bar Table (Gold).', '4fd0bdec-6340-49ab-984b-3ef410333037', 'CIRCLE-BAR-TABLE-GOLD-0054', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/circle-bar-table-gold.jpg', '{/images/products/circle-bar-table-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9e40f831-574d-461b-a4ee-2f3169d93dd0', 'White Wagon Cart', 'white-wagon-cart', 'White Wagon Cart.', '58ed7eca-8957-4f24-a723-15efe03479e3', 'WHITE-WAGON-CART-0055', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-wagon-cart.jpg', '{/images/products/white-wagon-cart.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e00fd0df-c6b7-4323-9b1a-f5ef3307c73c', 'White Rustic cart', 'white-rustic-cart', 'White Rustic cart.', '58ed7eca-8957-4f24-a723-15efe03479e3', 'WHITE-RUSTIC-CART-0056', 30000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-rustic-cart.jpg', '{/images/products/white-rustic-cart.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('494edb4e-493f-48dc-b38b-4b8b038155bf', 'LED ROSES TABLE', 'led-roses-table', 'LED ROSES TABLE.', '58ed7eca-8957-4f24-a723-15efe03479e3', 'LED-ROSES-TABLE-0057', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-roses-table.jpg', '{/images/products/led-roses-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2c1436f3-208d-461e-9d7f-079567e7899d', 'Squeeze Me Stand (Blue)', 'squeeze-me-stand-blue', 'Squeeze Me Stand (Blue).', '58ed7eca-8957-4f24-a723-15efe03479e3', 'SQUEEZE-ME-STAND-BLUE-0058', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/squeeze-me-stand-blue.jpg', '{/images/products/squeeze-me-stand-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('48bafc1d-8e16-4f0e-8aeb-047279d8d180', 'Squeeze Me Stand (Pink)', 'squeeze-me-stand-pink', 'Squeeze Me Stand (Pink).', '58ed7eca-8957-4f24-a723-15efe03479e3', 'SQUEEZE-ME-STAND-PINK-0059', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/squeeze-me-stand-pink.jpg', '{/images/products/squeeze-me-stand-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bcc5a015-b743-43f9-8c4e-b33a8dee6223', 'GIRL Treat Table', 'girl-treat-table', 'GIRL Treat Table.', '58ed7eca-8957-4f24-a723-15efe03479e3', 'GIRL-TREAT-TABLE-0060', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/girl-treat-table.jpg', '{/images/products/girl-treat-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2536fb2d-720b-46c3-aeae-2b8f535acdb4', 'BOY Treat Table', 'boy-treat-table', 'BOY Treat Table.', '58ed7eca-8957-4f24-a723-15efe03479e3', 'BOY-TREAT-TABLE-0061', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/boy-treat-table.jpg', '{/images/products/boy-treat-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2b8c169b-0b41-4a24-a138-d0fee64d43ec', 'Diamond Cake Table (Gold)', 'diamond-cake-table-gold', 'Diamond Cake Table (Gold).', '58ed7eca-8957-4f24-a723-15efe03479e3', 'DIAMOND-CAKE-TABLE-GOLD-0062', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/diamond-cake-table-gold.jpg', '{/images/products/diamond-cake-table-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2b17a6c5-072e-43df-a086-39b18f939501', 'Green Tree', 'green-tree', 'Green Tree.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'GREEN-TREE-0063', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/green-tree.jpg', '{/images/products/green-tree.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('739c12d6-9ae7-4588-b49a-75e81b6f0d6d', 'Telephone Booth', 'telephone-booth', 'Telephone Booth.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'TELEPHONE-BOOTH-0064', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/telephone-booth.jpg', '{/images/products/telephone-booth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('34e8c4e3-9ebf-4828-9276-10eeef2782b0', 'Zebra', 'zebra', 'Zebra.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'ZEBRA-0065', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/zebra.jpg', '{/images/products/zebra.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('eeebefc0-9db2-4d8e-b51d-57e595906db9', 'Giraffe', 'giraffe', 'Giraffe.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'GIRAFFE-0066', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/giraffe.jpg', '{/images/products/giraffe.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f5a41fbc-a0c7-4a1f-a489-598f62d5a694', 'Elephant', 'elephant', 'Elephant.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'ELEPHANT-0067', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/elephant.jpg', '{/images/products/elephant.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('507c2b52-6951-4fc8-9000-ed6d71e66738', 'Table Top Elephant', 'table-top-elephant', 'Table Top Elephant.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'TABLE-TOP-ELEPHANT-0068', 1000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-top-elephant.jpg', '{/images/products/table-top-elephant.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6051aec4-b522-4660-a8cd-8dffb31047b0', 'Gold Number Stand', 'gold-number-stand', 'Gold Number Stand.', '48ddfc23-fb1e-47ef-9884-a15d22c1c7c6', 'GOLD-NUMBER-STAND-0069', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-number-stand.jpg', '{/images/products/gold-number-stand.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b54b7f97-e998-4f53-8848-d55198340df9', 'TRANSLUCENT CHIAVARI CHAIR', 'translucent-chiavari-chair', 'TRANSLUCENT CHIAVARI CHAIR.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'TRANSLUCENT-CHIAVARI-CHAIR-0070', 700, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/translucent-chiavari-chair.jpg', '{/images/products/translucent-chiavari-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('00a7853b-3a4a-40fb-a84f-e2f88e61c660', 'CLEAR ROUND ELEGANCE', 'clear-round-elegance', 'CLEAR ROUND ELEGANCE.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'CLEAR-ROUND-ELEGANCE-0071', 750, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/clear-round-elegance.jpg', '{/images/products/clear-round-elegance.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9a77fe39-2158-4e6e-a61f-69be6ad91f4d', 'Padded Folding Chair', 'padded-folding-chair', 'Padded Folding Chair.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'PADDED-FOLDING-CHAIR-0072', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/padded-folding-chair.jpg', '{/images/products/padded-folding-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2e5c770d-1a05-4fbe-98a9-a5dac010a13c', 'BLACK PADDED CHAIR', 'black-padded-chair', 'BLACK PADDED CHAIR.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'BLACK-PADDED-CHAIR-0073', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-padded-chair.jpg', '{/images/products/black-padded-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3690027e-bf82-4bfd-bd84-b1cee9c8f932', 'BLACK CHIAVARI CHAIR', 'black-chiavari-chair', 'BLACK CHIAVARI CHAIR.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'BLACK-CHIAVARI-CHAIR-0074', 700, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-chiavari-chair.jpg', '{/images/products/black-chiavari-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f7f32514-3e6d-4a3f-bfd2-549163e10ec5', 'PRIME PINK  ROYALTY CHAIR', 'prime-pink-royalty-chair', 'PRIME PINK  ROYALTY CHAIR.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'PRIME-PINK-ROYALTY-CHAIR-0075', 1800, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-pink-royalty-chair.jpg', '{/images/products/prime-pink-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9e72e4fd-0f7a-43d4-ba9e-2d76d1a00f01', 'White Samsonite Chair', 'white-samsonite-chair', 'White Samsonite Chair.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'WHITE-SAMSONITE-CHAIR-0076', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-samsonite-chair.jpg', '{/images/products/white-samsonite-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e0e5136c-8eed-44b6-96d7-f2e32edd82f0', 'O Back Gold Chair', 'o-back-gold-chair', 'O Back Gold Chair.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'O-BACK-GOLD-CHAIR-0077', 1800, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/o-back-gold-chair.jpg', '{/images/products/o-back-gold-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('236290ae-7112-44f2-b1ea-ab1af3b7c126', 'O Back Silver Chair', 'o-back-silver-chair', 'O Back Silver Chair.', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'O-BACK-SILVER-CHAIR-0078', 1800, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/o-back-silver-chair.jpg', '{/images/products/o-back-silver-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1cbbe824-a6b5-4746-b921-42ef5042b1d4', 'Heart Chair (Gold)', 'heart-chair-gold', 'Heart Chair (Gold).', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'HEART-CHAIR-GOLD-0079', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/heart-chair-gold.jpg', '{/images/products/heart-chair-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b0f95ba2-9408-46f7-9d68-92e7348b1cdd', 'Bamboo Chair (Gold)', 'bamboo-chair-gold', 'Bamboo Chair (Gold).', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'BAMBOO-CHAIR-GOLD-0080', 700, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/bamboo-chair-gold.jpg', '{/images/products/bamboo-chair-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cbd0212d-eaff-4868-96f0-0f7944d331c3', 'Bamboo Chair (Silver)', 'bamboo-chair-silver', 'Bamboo Chair (Silver).', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'BAMBOO-CHAIR-SILVER-0081', 700, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/bamboo-chair-silver.jpg', '{/images/products/bamboo-chair-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('086d6ff9-f752-454c-b494-8e35a187373e', 'Folding Acrylic Chair (Gold)', 'folding-acrylic-chair-gold', 'Folding Acrylic Chair (Gold).', '06bda734-1787-45d7-98a5-6dd19bd8a18f', 'FOLDING-ACRYLIC-CHAIR-GOLD-0082', 1125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/folding-acrylic-chair-gold.jpg', '{/images/products/folding-acrylic-chair-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2761ef59-98c3-4d08-95b3-f0fb13487f56', 'Wave sofa', 'wave-sofa', 'Wave sofa.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'WAVE-SOFA-0083', 29000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/wave-sofa.jpg', '{/images/products/wave-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('30d21be4-6e03-4d52-8524-7e737d638164', 'Hendrix Velvet Flared Arm Loveseats', 'hendrix-velvet-flared-arm-loveseats', 'Hendrix Velvet Flared Arm Loveseats.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'HENDRIX-VELVET-FLARED-ARM-LOVESEATS-0084', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/hendrix-velvet-flared-arm-loveseats.jpg', '{/images/products/hendrix-velvet-flared-arm-loveseats.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9c9ce030-a311-48ff-a49e-d1d59b01b138', 'Lux Sofa', 'lux-sofa', 'Lux Sofa.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'LUX-SOFA-0085', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-sofa.jpg', '{/images/products/lux-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('614bcd63-8a78-471d-a5aa-2af8da5f7d75', 'Cage sofa', 'cage-sofa', 'Cage sofa.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'CAGE-SOFA-0086', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cage-sofa.jpg', '{/images/products/cage-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f3195070-4e27-4ac7-b384-00a463b37d9f', '3 PIECE LUX SET', '3-piece-lux-set', '3 PIECE LUX SET.', '6b784ad8-1d87-41e0-94eb-1797b5681082', '3-PIECE-LUX-SET-0087', 30000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-piece-lux-set.jpg', '{/images/products/3-piece-lux-set.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('39c49434-2f2a-45fe-a679-3dee55a51ab7', 'Lux Pink sofa', 'lux-pink-sofa', 'Lux Pink sofa.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'LUX-PINK-SOFA-0088', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-pink-sofa.jpg', '{/images/products/lux-pink-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b174366a-769f-4db7-a4f8-6025e0b771f8', 'fancy Royal Sofa', 'fancy-royal-sofa', 'fancy Royal Sofa.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'FANCY-ROYAL-SOFA-0089', 29000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fancy-royal-sofa.jpg', '{/images/products/fancy-royal-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6607bd0e-80f6-4296-a381-0ecef0c2f62b', 'NUDE SOFA', 'nude-sofa', 'NUDE SOFA.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'NUDE-SOFA-0090', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/nude-sofa.jpg', '{/images/products/nude-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2222afc9-fd06-444d-b8d8-7f1b7802359a', 'Chic Sofa (Black)', 'chic-sofa-black', 'Chic Sofa (Black).', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'CHIC-SOFA-BLACK-0091', 30000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/chic-sofa-black.jpg', '{/images/products/chic-sofa-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1ee8ef4c-444d-4076-8901-8ac7a06a2177', 'White Dotted Throne Sofa', 'white-dotted-throne-sofa', 'White Dotted Throne Sofa.', '6b784ad8-1d87-41e0-94eb-1797b5681082', 'WHITE-DOTTED-THRONE-SOFA-0092', 30000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-dotted-throne-sofa.jpg', '{/images/products/white-dotted-throne-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f1923376-5053-4e78-a45a-a629c08b2911', 'Dreamland Train', 'dreamland-train', 'Dreamland Train.', '45abc142-0f76-440a-80f9-3c0528474878', 'DREAMLAND-TRAIN-0093', 42500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/dreamland-train.jpg', '{/images/products/dreamland-train.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f66c8c2a-65d9-455e-a619-6c5013e4f9fb', 'Princess Express Train', 'princess-express-train', 'Princess Express Train.', '45abc142-0f76-440a-80f9-3c0528474878', 'PRINCESS-EXPRESS-TRAIN-0094', 42500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/princess-express-train.jpg', '{/images/products/princess-express-train.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('286e5654-5f85-4670-a2ef-56553c532a21', 'Royal Castle', 'royal-castle', 'Royal Castle.', '45abc142-0f76-440a-80f9-3c0528474878', 'ROYAL-CASTLE-0095', 47500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/royal-castle.jpg', '{/images/products/royal-castle.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3736967b-750e-4955-8fdb-4bc0a4dd05d5', 'Blast Zone Magic Castle', 'blast-zone-magic-castle', 'Blast Zone Magic Castle.', '45abc142-0f76-440a-80f9-3c0528474878', 'BLAST-ZONE-MAGIC-CASTLE-0096', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/blast-zone-magic-castle.jpg', '{/images/products/blast-zone-magic-castle.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('275f55d5-f10e-498f-87dc-b5f8fd6a83b7', 'Kids Bow Back Chair', 'kids-bow-back-chair', 'Kids Bow Back Chair.', '1ea7c48a-2dc0-4712-9bd0-8e123ae750e2', 'KIDS-BOW-BACK-CHAIR-0097', 600, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-bow-back-chair.jpg', '{/images/products/kids-bow-back-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7c751651-cfbe-4446-be99-e1fe683b2419', 'kids Chiavari Blue Chair', 'kids-chiavari-blue-chair', 'kids Chiavari Blue Chair.', '1ea7c48a-2dc0-4712-9bd0-8e123ae750e2', 'KIDS-CHIAVARI-BLUE-CHAIR-0098', 500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-chiavari-blue-chair.jpg', '{/images/products/kids-chiavari-blue-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b3b69437-7abc-4589-9c6e-d45c58db16b6', 'KIDS White Samsonite Chair', 'kids-white-samsonite-chair', 'KIDS White Samsonite Chair.', '1ea7c48a-2dc0-4712-9bd0-8e123ae750e2', 'KIDS-WHITE-SAMSONITE-CHAIR-0099', 225, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-white-samsonite-chair.jpg', '{/images/products/kids-white-samsonite-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d126d932-e3db-4a51-9be3-89c036419dcb', 'Kids Bamboo Chair (Pink)', 'kids-bamboo-chair-pink', 'Kids Bamboo Chair (Pink).', '1ea7c48a-2dc0-4712-9bd0-8e123ae750e2', 'KIDS-BAMBOO-CHAIR-PINK-0100', 500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-bamboo-chair-pink.jpg', '{/images/products/kids-bamboo-chair-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.680293+00', '2026-08-27 01:47:02.680293+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d248262a-378b-4953-9fec-760dec841f7f', 'KIDS 6FT TABLE', 'kids-6ft-table', 'KIDS 6FT TABLE.', '940ba7fa-fe0c-4a16-83b8-883fe682ffca', 'KIDS-6FT-TABLE-0101', 1100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-6ft-table.jpg', '{/images/products/kids-6ft-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f69c2cf8-e548-4e0a-8cf5-38ca5ad2ca64', 'Kids King Throne Chair (White)', 'kids-king-throne-chair-white', 'Kids King Throne Chair (White).', 'd6ba76a3-2f34-49cf-8a8f-e78181020b4f', 'KIDS-KING-THRONE-CHAIR-WHITE-0102', 12000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-king-throne-chair-white.jpg', '{/images/products/kids-king-throne-chair-white.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('90414d49-83f7-4242-8200-058ae00777ff', 'Happy Birthday LED Sign', 'happy-birthday-led-sign', 'Happy Birthday LED Sign.', '9451dd7e-1dbc-4085-b64e-1c7b60ac564c', 'HAPPY-BIRTHDAY-LED-SIGN-0103', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/happy-birthday-led-sign.jpg', '{/images/products/happy-birthday-led-sign.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b2a240a2-934a-43a0-82a2-2cbf05108617', 'Let''s Party LED Sign', 'lets-party-led-sign', 'Let''s Party LED Sign.', '9451dd7e-1dbc-4085-b64e-1c7b60ac564c', 'LETS-PARTY-LED-SIGN-0104', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/let-s-party-led-sign.jpg', '{/images/products/let-s-party-led-sign.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f9949bf0-e501-40f4-98a5-7d942a4f84e3', 'BABY MARQUEE', 'baby-marquee', 'BABY MARQUEE.', '9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'BABY-MARQUEE-0105', 40000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/baby-marquee.jpg', '{/images/products/baby-marquee.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('218e3a0e-2593-43f8-84cb-5406eacfe9c0', 'OH BABY MARQUEE', 'oh-baby-marquee', 'OH BABY MARQUEE.', '9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'OH-BABY-MARQUEE-0106', 60000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/oh-baby-marquee.jpg', '{/images/products/oh-baby-marquee.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6a446e47-6610-4063-a10f-5b54d412a435', 'BLACK MARQUEE NUMBERS', 'black-marquee-numbers', 'BLACK MARQUEE NUMBERS.', '9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'BLACK-MARQUEE-NUMBERS-0107', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-marquee-numbers.jpg', '{/images/products/black-marquee-numbers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5685435d-5e32-4547-a888-aed67b329453', 'MARQUEE LETTER', 'marquee-letter', 'MARQUEE LETTER.', '9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'MARQUEE-LETTER-0108', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/marquee-letter.jpg', '{/images/products/marquee-letter.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0c501f8a-283c-4725-8151-4472bbd4da2e', 'LARGE MARQUEE CROSS WITH LIGHT', 'large-marquee-cross-with-light', 'LARGE MARQUEE CROSS WITH LIGHT.', '9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'LARGE-MARQUEE-CROSS-WITH-LIGHT-0109', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/large-marquee-cross-with-light.jpg', '{/images/products/large-marquee-cross-with-light.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('76234e3d-c95a-4cb1-8df8-2261bd7d74ed', 'WHITE MARQUEE NUMBER', 'white-marquee-number', 'WHITE MARQUEE NUMBER.', '9b81d498-9c4d-4adf-a1aa-0594ea2255f4', 'WHITE-MARQUEE-NUMBER-0110', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-marquee-number.jpg', '{/images/products/white-marquee-number.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8408e9da-3483-42d9-9f41-34590b9ffdf0', 'Gold Dust Throne', 'gold-dust-throne', 'Gold Dust Throne.', '4c1d4175-099b-4deb-876d-16b37b972444', 'GOLD-DUST-THRONE-0111', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-dust-throne.jpg', '{/images/products/gold-dust-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cacbb547-e889-4f86-bf26-fc272be0104c', 'Mid Night Throne', 'mid-night-throne', 'Mid Night Throne.', '4c1d4175-099b-4deb-876d-16b37b972444', 'MID-NIGHT-THRONE-0112', 18000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/mid-night-throne.jpg', '{/images/products/mid-night-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('619ae7d6-e7a9-49c6-9ea0-76c29a9ce23a', 'Emerald Pearl Throne', 'emerald-pearl-throne', 'Emerald Pearl Throne.', '4c1d4175-099b-4deb-876d-16b37b972444', 'EMERALD-PEARL-THRONE-0113', 18000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/emerald-pearl-throne.jpg', '{/images/products/emerald-pearl-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9531080a-96ab-45ab-aeea-be25ca27606f', 'Silver Pearl Throne', 'silver-pearl-throne', 'Silver Pearl Throne.', '4c1d4175-099b-4deb-876d-16b37b972444', 'SILVER-PEARL-THRONE-0114', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-pearl-throne.jpg', '{/images/products/silver-pearl-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a9410e2a-09ca-40fe-afc7-5b9bfd81f59c', 'White Peal Throne Chair', 'white-peal-throne-chair', 'White Peal Throne Chair.', '4c1d4175-099b-4deb-876d-16b37b972444', 'WHITE-PEAL-THRONE-CHAIR-0115', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-peal-throne-chair.jpg', '{/images/products/white-peal-throne-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9a241fa5-b63a-4625-aebd-088f9d3f7e3a', 'Red Throne', 'red-throne', 'Red Throne.', '4c1d4175-099b-4deb-876d-16b37b972444', 'RED-THRONE-0116', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/red-throne.jpg', '{/images/products/red-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b616500e-8970-4351-8487-094882e6b5c6', 'Kids Velvet Pink Throne', 'kids-velvet-pink-throne', 'Kids Velvet Pink Throne.', '4c1d4175-099b-4deb-876d-16b37b972444', 'KIDS-VELVET-PINK-THRONE-0117', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-velvet-pink-throne.jpg', '{/images/products/kids-velvet-pink-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8d0cb784-15df-481c-91c3-b7cfa412dc27', 'White Princess Throne Sofa Chair', 'white-princess-throne-sofa-chair', 'White Princess Throne Sofa Chair.', '4c1d4175-099b-4deb-876d-16b37b972444', 'WHITE-PRINCESS-THRONE-SOFA-CHAIR-0118', 18000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-princess-throne-sofa-chair.jpg', '{/images/products/white-princess-throne-sofa-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('30835374-4f41-49af-a49d-894274216a1c', 'King Throne sofa chair', 'king-throne-sofa-chair', 'King Throne sofa chair.', '4c1d4175-099b-4deb-876d-16b37b972444', 'KING-THRONE-SOFA-CHAIR-0119', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/king-throne-sofa-chair.jpg', '{/images/products/king-throne-sofa-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9c1d0f86-dba5-4a56-98cc-957a0a813fb3', 'Cassie Loveseat (Gold)', 'cassie-loveseat-gold', 'Cassie Loveseat (Gold).', '4c1d4175-099b-4deb-876d-16b37b972444', 'CASSIE-LOVESEAT-GOLD-0120', 29000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cassie-loveseat-gold.jpg', '{/images/products/cassie-loveseat-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c6a1b5c9-36d1-44c3-84c2-239c7fe51500', 'Cage Gold Chair (White Cushion)', 'cage-gold-chair-white-cushion', 'Cage Gold Chair (White Cushion).', '4c1d4175-099b-4deb-876d-16b37b972444', 'CAGE-GOLD-CHAIR-WHITE-CUSHION-0121', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cage-gold-chair-white-cushion.jpg', '{/images/products/cage-gold-chair-white-cushion.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cfb71294-4cb6-48f2-85f5-545fc73bcb91', 'Cage Gold Chair (Black Cushion)', 'cage-gold-chair-black-cushion', 'Cage Gold Chair (Black Cushion).', '4c1d4175-099b-4deb-876d-16b37b972444', 'CAGE-GOLD-CHAIR-BLACK-CUSHION-0122', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cage-gold-chair-black-cushion.jpg', '{/images/products/cage-gold-chair-black-cushion.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8d62a299-4e42-4a67-9fd6-796d7a990a3a', 'Lux Throne Chair (Black)', 'lux-throne-chair-black', 'Lux Throne Chair (Black).', '4c1d4175-099b-4deb-876d-16b37b972444', 'LUX-THRONE-CHAIR-BLACK-0123', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-throne-chair-black.jpg', '{/images/products/lux-throne-chair-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5cbc3167-39ea-45bf-a876-94e0fa2424e1', 'Canopy Throne Chair (White)', 'canopy-throne-chair-white', 'Canopy Throne Chair (White).', '4c1d4175-099b-4deb-876d-16b37b972444', 'CANOPY-THRONE-CHAIR-WHITE-0124', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/canopy-throne-chair-white.jpg', '{/images/products/canopy-throne-chair-white.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3e6131cd-fdf5-450e-ba34-b95ded8140d0', 'Lux Throne Chair (Gold)', 'lux-throne-chair-gold', 'Lux Throne Chair (Gold).', '4c1d4175-099b-4deb-876d-16b37b972444', 'LUX-THRONE-CHAIR-GOLD-0125', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-throne-chair-gold.jpg', '{/images/products/lux-throne-chair-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('291fe924-c59a-42de-9afb-e712cc231f05', 'Lux Throne Chair (Silver)', 'lux-throne-chair-silver', 'Lux Throne Chair (Silver).', '4c1d4175-099b-4deb-876d-16b37b972444', 'LUX-THRONE-CHAIR-SILVER-0126', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-throne-chair-silver.jpg', '{/images/products/lux-throne-chair-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c10a9a94-4140-4ee2-8c98-3bf817064946', 'GOLD CHIAVARI CHAIR', 'gold-chiavari-chair', 'GOLD CHIAVARI CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-CHIAVARI-CHAIR-0127', 700, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-chiavari-chair.jpg', '{/images/products/gold-chiavari-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('88ba3923-e2f5-4385-9af5-d73e7175f67a', 'Spandex Light Blue Chair Covers', 'spandex-light-blue-chair-covers', 'Spandex Light Blue Chair Covers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-LIGHT-BLUE-CHAIR-COVERS-0128', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-light-blue-chair-covers.jpg', '{/images/products/spandex-light-blue-chair-covers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('40acbbc0-8a07-4e2d-8916-9f112283963e', 'Treat wall', 'treat-wall', 'Treat wall.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TREAT-WALL-0129', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, 'https://placehold.co/600x400?text=Treat%20wall', '{https://placehold.co/600x400?text=Treat%20wall}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('71f46936-df8d-430f-8a5a-2dc43f11f13b', 'Table Napkin (Baby Blue)', 'table-napkin-baby-blue', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TABLE-NAPKIN-BABY-BLUE-0130', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-baby-blue.jpg', '{/images/products/table-napkin-baby-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('46588248-dc70-4869-bdc1-c613180c84f3', 'Acrylic Stage 8''x 8''', 'acrylic-stage-8x-8', 'Smooth & sturdy enough for dancingTranslucent platform allows light to pass throughOptional sound-activated LED light strip', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ACRYLIC-STAGE-8X-8-0131', 57500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-stage-8-x-8.jpg', '{/images/products/acrylic-stage-8-x-8.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b49b405f-9aa1-4fb2-8d40-8ffc3a18ba29', 'Chamberlain 3 pcs', 'chamberlain-3-pcs', 'Chamberlain 3 pcs.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CHAMBERLAIN-3-PCS-0132', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/chamberlain-3-pcs.jpg', '{/images/products/chamberlain-3-pcs.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a3b5f6ee-0470-4742-99a7-a7f962e75800', 'Ken &  Barbie box', 'ken-barbie-box', 'Ken &  Barbie box.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KEN-BARBIE-BOX-0133', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ken-barbie-box.jpg', '{/images/products/ken-barbie-box.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('06681e7a-573a-4471-b0cd-f95fc63007eb', 'GOLD SHIM SHIM BACKDROP', 'gold-shim-shim-backdrop', 'GOLD SHIM SHIM WALL# BALLOONS  NOT INCLUDED #', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-SHIM-SHIM-BACKDROP-0134', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-shim-shim-backdrop.jpg', '{/images/products/gold-shim-shim-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('58f28ba4-8ffa-4eea-9ffc-c28021fd2c5c', 'Cage Dome  Throne', 'cage-dome-throne', 'Cage Dome  Throne.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CAGE-DOME-THRONE-0135', 17000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cage-dome-throne.jpg', '{/images/products/cage-dome-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('96c63f12-5e06-472a-8ac3-7cb8e7850a35', 'BABY LETTER  TABLE', 'baby-letter-table', 'BABY LETTER  TABLE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BABY-LETTER-TABLE-0136', 20250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/baby-letter-table.jpg', '{/images/products/baby-letter-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0054ac5d-30f9-4fef-8229-8930fd2b3501', 'Classic Half Size Round Chafer', 'classic-half-size-round-chafer', 'Perfect for use at weddings, buffets, or other catered events, this Choice Classic 5 qt. half size round chafer will provide an elegant display piece for all your foods. The round shape will allow your customers to access the food from any angle while the 5 qt. capacity will keep all your foods in stock. Complete with a polished finish, this chafer will add to the presentation value of the foods you are offering.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CLASSIC-HALF-SIZE-ROUND-CHAFER-0137', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/classic-half-size-round-chafer.jpg', '{/images/products/classic-half-size-round-chafer.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('68f6a2ba-700a-4fbb-b123-abee47924ce9', 'Clear Beaded Chargers', 'clear-beaded-chargers', 'Clear Beaded Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CLEAR-BEADED-CHARGERS-0138', 399, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/clear-beaded-chargers.jpg', '{/images/products/clear-beaded-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2f0162c8-403c-4685-a03b-5f4163afa975', 'MENU', 'menu', 'MENU.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MENU-0139', 300, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/menu.jpg', '{/images/products/menu.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bc8f65b2-c081-4e07-9054-aea42c98dc07', 'BIRTHDAY PACKAGE', 'birthday-package', 'PERSONALIZED NAME PEDESTAL, BALLOON GARLAND, MARQUEE # (balloon color choice)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BIRTHDAY-PACKAGE-0140', 61200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/birthday-package.jpg', '{/images/products/birthday-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5b8f5835-9b68-4018-ada2-a05e1a32fae8', 'Mega Set Arch & Stage', 'mega-set-arch-stage', 'Arch measurements 8ft H by 112in LStages measurements 81in W. x 114in L.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MEGA-SET-ARCH-STAGE-0141', 95000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/mega-set-arch-stage.jpg', '{/images/products/mega-set-arch-stage.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d3428e02-d5df-43cc-ac04-1885783ba2d3', 'GREEN WALL N BALLOON PACKAGE', 'green-wall-n-balloon-package', 'BALLOONS GARLAND THRONE PEDESTAL W/DECAL', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GREEN-WALL-N-BALLOON-PACKAGE-0142', 79650, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/green-wall-n-balloon-package.jpg', '{/images/products/green-wall-n-balloon-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e17f57a0-290c-4516-8cf7-65ed3b8089a1', 'Artificial Fluffy Tree', 'artificial-fluffy-tree', '5.7'' Tall | Ivory |', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ARTIFICIAL-FLUFFY-TREE-0143', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/artificial-fluffy-tree.jpg', '{/images/products/artificial-fluffy-tree.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a1437de3-9571-43c9-9aec-94f411a73feb', 'White photo frame', 'white-photo-frame', 'White photo frame.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'WHITE-PHOTO-FRAME-0144', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-photo-frame.jpg', '{/images/products/white-photo-frame.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('95eff44c-1b91-4955-9ede-e9551040414a', 'Pink Columns', 'pink-columns', 'Pink Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PINK-COLUMNS-0145', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pink-columns.jpg', '{/images/products/pink-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('88e81e8a-ba85-422e-8f33-a9f5f3ca92b6', 'KIDS WHITE Chiavari  Chair', 'kids-white-chiavari-chair', 'KIDS WHITE Chiavari  Chair.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDS-WHITE-CHIAVARI-CHAIR-0146', 500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-white-chiavari-chair.jpg', '{/images/products/kids-white-chiavari-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ea4fd353-a91a-4cc2-a35e-8a4c1652731b', 'LED Cube', 'led-cube', 'LED Cube.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LED-CUBE-0147', 2000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-cube.jpg', '{/images/products/led-cube.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ac81e932-929a-4830-9077-6e484cffef2f', 'Purple Columns', 'purple-columns', 'Purple Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PURPLE-COLUMNS-0148', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/purple-columns.jpg', '{/images/products/purple-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bf81736c-0417-4e4c-a8c9-d822600e6dca', '3 PCS GOLD FLOWER BACKDROP W/TABLE', '3-pcs-gold-flower-backdrop-wtable', '3 PCS GOLD FLOWER BACKDROP W/TABLE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '3-PCS-GOLD-FLOWER-BACKDROP-WTABLE-0149', 67500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-pcs-gold-flower-backdrop-w-table.jpg', '{/images/products/3-pcs-gold-flower-backdrop-w-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8baca025-1787-41c7-9970-b9cabd40614a', 'Pure white Stage 8x8', 'pure-white-stage-8x8', 'Pure white Stage 8x8.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PURE-WHITE-STAGE-8X8-0150', 80000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pure-white-stage-8x8.jpg', '{/images/products/pure-white-stage-8x8.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.833528+00', '2026-08-27 01:47:02.833528+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('00b7dcfc-af4f-457c-ad6c-93d103d529f2', 'Kissing ball', 'kissing-ball', 'Kissing ball only', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KISSING-BALL-0151', 1000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kissing-ball.jpg', '{/images/products/kissing-ball.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('edba2e1c-a201-4f6a-9665-d91c72fb66c7', 'The INDY 3 Station', 'the-indy-3-station', 'The INDY 3 Station.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-INDY-3-STATION-0152', 180000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-indy-3-station.jpg', '{/images/products/the-indy-3-station.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('402e1b90-dd5f-4de2-a674-d690650099fd', 'Table Napkin (Willow Green)', 'table-napkin-willow-green', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TABLE-NAPKIN-WILLOW-GREEN-0153', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-willow-green.jpg', '{/images/products/table-napkin-willow-green.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('62a858da-2279-4fdb-9bcc-4021175725ee', 'MOIEA FLORAL WEDDING DESIGN', 'moiea-floral-wedding-design', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MOIEA-FLORAL-WEDDING-DESIGN-0154', 87500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/moiea-floral-wedding-design.jpg', '{/images/products/moiea-floral-wedding-design.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7a821418-6371-4e74-a453-7a402e551666', 'Bestie baby Thone', 'bestie-baby-thone', 'Bestie baby Thone.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BESTIE-BABY-THONE-0155', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/bestie-baby-thone.jpg', '{/images/products/bestie-baby-thone.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('875e484f-20e4-47e1-adee-647c96ab3d30', 'SILVER CLASSIC THRONE', 'silver-classic-throne', 'SILVER CLASSIC THRONE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SILVER-CLASSIC-THRONE-0156', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-classic-throne.jpg', '{/images/products/silver-classic-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ac5dbaa9-dd1f-4b75-8359-341af37b1b97', 'KIDDIES FRESH FLOWER W/VASE', 'kiddies-fresh-flower-wvase', 'KIDDIES FRESH FLOWER W/VASE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDDIES-FRESH-FLOWER-WVASE-0157', 3000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kiddies-fresh-flower-w-vase.jpg', '{/images/products/kiddies-fresh-flower-w-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5376a366-c265-499d-bf2e-d6efa6dfa6d5', 'Rustic Solid Pine Folding Farm Table', 'rustic-solid-pine-folding-farm-table', 'This Rustic Solid Pine Folding Farm Table is perfect for adding a touch of rustic charm to any event. It is made from solid pine wood and finished with a light stain for a unique, vintage look. The table is easy to set up and fold away, making it ideal for use at outdoor events or for storage in between uses. The table is strong and sturdy and can accommodate up to 10 people. Make your next party unforgettable with this beautiful Rustic Solid Pine Folding Farm Table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RUSTIC-SOLID-PINE-FOLDING-FARM-TABLE-0158', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rustic-solid-pine-folding-farm-table.jpg', '{/images/products/rustic-solid-pine-folding-farm-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a95b6343-a513-43f1-9346-6170226dba16', 'Podium', 'podium', 'Podium.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PODIUM-0159', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/podium.jpg', '{/images/products/podium.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8f427c41-27fc-4e9b-909c-f58e6472109b', 'Tumblers 10 oz', 'tumblers-10-oz', 'Tumblers 10 oz.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TUMBLERS-10-OZ-0160', 105, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/tumblers-10-oz.jpg', '{/images/products/tumblers-10-oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f22919a8-96e6-4a92-b0c0-81c9723e61a9', 'Crate pedestal', 'crate-pedestal', 'Crate pedestal.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CRATE-PEDESTAL-0161', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/crate-pedestal.jpg', '{/images/products/crate-pedestal.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5571530a-48bd-4069-96c0-47de1edf2c9a', 'Led table', 'led-table', 'Led table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LED-TABLE-0162', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-table.jpg', '{/images/products/led-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('60b46a4f-2f0c-499d-84fe-62674034fa4e', 'The Selfie 2 Station', 'the-selfie-2-station', 'The Selfie 2 Station.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-SELFIE-2-STATION-0163', 170000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-selfie-2-station.jpg', '{/images/products/the-selfie-2-station.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e5041eb7-582b-41ce-9322-87b288d5ec66', 'Chair Cushion', 'chair-cushion', 'Chair Cushion.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CHAIR-CUSHION-0164', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/chair-cushion.jpg', '{/images/products/chair-cushion.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bb396186-9559-4ece-a9ff-5fdf1e4fd457', 'Chloe''s arch', 'chloes-arch', 'Chloe''s arch.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CHLOES-ARCH-0165', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/chloe-s-arch.jpg', '{/images/products/chloe-s-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2d7e3507-ae92-44fc-8f2e-249b473070e3', 'Copper Mule  Mugs', 'copper-mule-mugs', 'Copper Mule  Mugs.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'COPPER-MULE-MUGS-0166', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/copper-mule-mugs.jpg', '{/images/products/copper-mule-mugs.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8b4b2024-3c12-4a56-a319-50b7d9a0b1c5', 'Mother 2 B Area', 'mother-2-b-area', 'Color Choice of2 Arch Wall2 Half WallWall DecalOrganic Balloon GarlandTheme AcessoriesLux Sofa3 PedestalRug', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MOTHER-2-B-AREA-0167', 180000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/mother-2-b-area.jpg', '{/images/products/mother-2-b-area.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e028690b-62ae-4002-a9d1-2fda3d0fa8d4', 'Lux Bubble Acrylic Wall Backdrop', 'lux-bubble-acrylic-wall-backdrop', 'Price is for each wall', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-BUBBLE-ACRYLIC-WALL-BACKDROP-0168', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-bubble-acrylic-wall-backdrop.jpg', '{/images/products/lux-bubble-acrylic-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4698b132-3b21-47ca-a3fc-40ce054367d6', 'Abstract Wall', 'abstract-wall', 'Abstract Wall.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ABSTRACT-WALL-0169', 37500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/abstract-wall.jpg', '{/images/products/abstract-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('33cf6368-c5ab-4ce3-9365-6ffedb8232f3', 'PONYTAIL BACKDROP', 'ponytail-backdrop', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PONYTAIL-BACKDROP-0170', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ponytail-backdrop.jpg', '{/images/products/ponytail-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('99884a1e-13d7-425a-97e0-7c54359de89c', 'SKYLINE BACKDROP', 'skyline-backdrop', 'SKYLINE BACKDROP.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SKYLINE-BACKDROP-0171', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/skyline-backdrop.jpg', '{/images/products/skyline-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('20396e1a-650c-4d21-b8b7-6501dcf91bb2', 'CIRCLE TIME BACKDROP', 'circle-time-backdrop', 'GOLD & BLACK and TABLE', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CIRCLE-TIME-BACKDROP-0172', 32500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/circle-time-backdrop.jpg', '{/images/products/circle-time-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('169d0a4f-6650-4666-a202-daf6adf19301', 'Miami Tree', 'miami-tree', 'Miami Tree.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MIAMI-TREE-0173', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/miami-tree.jpg', '{/images/products/miami-tree.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('93335af1-9966-4be8-8100-c3ad2426c0db', 'Spandex Royal Blue Chair Cover', 'spandex-royal-blue-chair-cover', 'Spandex Royal Blue Chair Cover.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-ROYAL-BLUE-CHAIR-COVER-0174', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-royal-blue-chair-cover.jpg', '{/images/products/spandex-royal-blue-chair-cover.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('85118180-7160-4344-8a45-f277100aad12', 'Lux Cocktail Table', 'lux-cocktail-table', 'Lux Cocktail Table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-COCKTAIL-TABLE-0175', 12793, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-cocktail-table.jpg', '{/images/products/lux-cocktail-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('39310c7b-e98e-4b75-bc3c-7203fcc84279', 'FRESH FLORAL W/VASE', 'fresh-floral-wvase', 'FRESH FLORAL W/VASE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FRESH-FLORAL-WVASE-0176', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fresh-floral-w-vase.jpg', '{/images/products/fresh-floral-w-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8b8c036f-b2ae-4e42-96e3-c3d9f96ef1ca', 'Single Velvet Lux', 'single-velvet-lux', 'Single Velvet Lux.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SINGLE-VELVET-LUX-0177', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/single-velvet-lux.jpg', '{/images/products/single-velvet-lux.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c0644882-8691-49b7-814e-11ffa3948fda', 'Natural Wall and Balloon BACKDROP', 'natural-wall-and-balloon-backdrop', 'wall Balloon Garland one side (color choice)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'NATURAL-WALL-AND-BALLOON-BACKDROP-0178', 58000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/natural-wall-and-balloon-backdrop.jpg', '{/images/products/natural-wall-and-balloon-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('533ded56-64c3-456e-9fe8-4fecde4d73f3', 'Pearl queen bench', 'pearl-queen-bench', 'Pearl queen bench.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PEARL-QUEEN-BENCH-0179', 24000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pearl-queen-bench.jpg', '{/images/products/pearl-queen-bench.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('86dbcaa2-4cd5-4efb-b816-938fa42cd9c8', 'GUEST TABLE SETTINGS', 'guest-table-settings', 'Setting for Up to 20 guest, chiavari chair, tables,chargers plates,dinner plates, napkins,cups,utensils and centerpieces ( color choice)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GUEST-TABLE-SETTINGS-0180', 49400, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/guest-table-settings.jpg', '{/images/products/guest-table-settings.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('85e1be8b-973a-4c94-981a-bd71452c9527', 'Spandex Metallic Gold & White Chair Covers', 'spandex-metallic-gold-white-chair-covers', 'Spandex Metallic Gold & White Chair Covers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-METALLIC-GOLD-WHITE-CHAIR-COVERS-0181', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-metallic-gold-white-chair-covers.jpg', '{/images/products/spandex-metallic-gold-white-chair-covers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('19e07835-94de-40a2-87c3-dca8625418d3', 'Acura Blue Package', 'acura-blue-package', 'Items included in package:3 Acura Blue WallBalloon GarlandGold Pedestal', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ACURA-BLUE-PACKAGE-0182', 67500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acura-blue-package.jpg', '{/images/products/acura-blue-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('23875565-b28b-4e3e-8efa-6f26c0f34d48', 'Marley 3D Open Arch', 'marley-3d-open-arch', '8x8', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MARLEY-3D-OPEN-ARCH-0183', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/marley-3d-open-arch.jpg', '{/images/products/marley-3d-open-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c23f50e9-ec1b-4841-8b49-91f8461373a5', 'Green Columns', 'green-columns', 'Green Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GREEN-COLUMNS-0184', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/green-columns.jpg', '{/images/products/green-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6a240d78-bcb0-46bc-94fb-3d5a6ceff67d', 'Gold Cake Stand', 'gold-cake-stand', 'Gold Cake Stand.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-CAKE-STAND-0185', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-cake-stand.jpg', '{/images/products/gold-cake-stand.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('de6e6183-ec61-40d2-a2fe-00d31542ee67', 'Butter Arch', 'butter-arch', 'decor not included', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BUTTER-ARCH-0186', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/butter-arch.jpg', '{/images/products/butter-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7a064dfb-0150-4aa7-bbc5-f65ee8be20c8', 'KIDS CHARACTERS DECOR', 'kids-characters-decor', '1 Bbackdrop and 3 pedestals', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDS-CHARACTERS-DECOR-0187', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-characters-decor.jpg', '{/images/products/kids-characters-decor.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ae5f05c4-d559-4f7b-9028-a895adc45ca7', '6 BURNER STOVE', '6-burner-stove', '6 BURNER STOVE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '6-BURNER-STOVE-0188', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/6-burner-stove.jpg', '{/images/products/6-burner-stove.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fdd63c19-10d1-4505-9534-c814c0db45b2', 'Crisscross Backdrop', 'crisscross-backdrop', 'Crisscross Backdrop adds glamour and a touch of grandeur style to your event. With a shiny gold coating and bars across, this panel has a beauty of its own. For a personalized look, pair it with custom signage, flowers, a string of lights, balloons, and photos.Dimensions: 6ft tallMaterials: ﻿Stainless SteelInventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CRISSCROSS-BACKDROP-0189', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/crisscross-backdrop.jpg', '{/images/products/crisscross-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ceafa427-eb95-4a35-a470-084763e462b5', 'Trendy Kids throne', 'trendy-kids-throne', 'Trendy Kids throne.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TRENDY-KIDS-THRONE-0190', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/trendy-kids-throne.jpg', '{/images/products/trendy-kids-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('07c9baa8-1d95-4712-9ec6-71476207d3a5', 'Ghost pedestal', 'ghost-pedestal', 'Ghost pedestal.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GHOST-PEDESTAL-0191', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ghost-pedestal.jpg', '{/images/products/ghost-pedestal.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3cce16bf-8ec1-4a13-9d12-0ff4ec29039e', 'Gold Bead Acrylic Chargers', 'gold-bead-acrylic-chargers', 'Stylish & ElegantAdd elegance and style to any tablescape and give an enhanced and neat look to your special and traditional dishes with our Beaded Clear Plastic Charger Plates.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-BEAD-ACRYLIC-CHARGERS-0192', 495, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-bead-acrylic-chargers.jpg', '{/images/products/gold-bead-acrylic-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('601efacf-7c9a-415a-ac9c-eef985dd010f', 'Arc Stands', 'arc-stands', 'This 2 Arc Stands provides amazing opportunities to decorate for a wedding sweetheart area, celebrant stage area, or ceremony area or even as a seating chart display!

Dimensions: 48 x 79" each stand

Materials: Stainless Steel

Inventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ARC-STANDS-0193', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/arc-stands.jpg', '{/images/products/arc-stands.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c2864ba8-4f14-4da6-bf50-b3cf2143f0fc', 'MOI BLACK VELVET', 'moi-black-velvet', 'MOI BLACK VELVET.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MOI-BLACK-VELVET-0194', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/moi-black-velvet.jpg', '{/images/products/moi-black-velvet.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('545817cd-28bf-4fd3-9029-ba70fba77874', 'Plastic Carafe 1 liter', 'plastic-carafe-1-liter', 'Plastic Carafe 1 liter.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PLASTIC-CARAFE-1-LITER-0195', 500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/plastic-carafe-1-liter.jpg', '{/images/products/plastic-carafe-1-liter.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f425db59-8be3-464c-89e5-2e1c9eabbfd1', 'PRIME GOLD  ROYALTY CHAIR', 'prime-gold-royalty-chair', 'PRIME GOLD  ROYALTY CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-GOLD-ROYALTY-CHAIR-0196', 1440, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-gold-royalty-chair.jpg', '{/images/products/prime-gold-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1643b6a9-6553-4434-a7e7-d477a06ed10b', 'Open Arch', 'open-arch', 'The Open Arch is a beautiful and elegant addition to any special event! It is spacious enough to accommodate a variety of decorations, from florals to balloons and more. The arch is made of durable and lightweight materials, making it easy to set up and take down. The Open Arch is sure to add a touch of sophistication to any event, no matter the occasion. With a range of colors to choose from, you can easily find the perfect arch to match your event theme. Let the Open Arch be the perfect backdrop for your next gathering 1 pcs arch included', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'OPEN-ARCH-0197', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/open-arch.jpg', '{/images/products/open-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('83f81fea-56b9-4723-ac39-7058318e31c6', 'Elite Dripless Rectangular Chafer with Gold', 'elite-dripless-rectangular-chafer-with-gold', 'Elite Dripless Rectangular Chafer with Gold.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ELITE-DRIPLESS-RECTANGULAR-CHAFER-WITH-G-0198', 4500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/elite-dripless-rectangular-chafer-with-gold.jpg', '{/images/products/elite-dripless-rectangular-chafer-with-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9329d9dc-7274-4714-a3bc-0d813d12c6c3', 'WHITE QUEEN SOFA FOR WEDDING', 'white-queen-sofa-for-wedding', 'I''m a product description. I’m a great place to include more information about your product. Buyers like to know what they’re getting before they purchase.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'WHITE-QUEEN-SOFA-FOR-WEDDING-0199', 24000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-queen-sofa-for-wedding.jpg', '{/images/products/white-queen-sofa-for-wedding.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('41a07095-1f92-4397-9c0e-3ea54427daae', 'Black Dome', 'black-dome', 'Black Dome.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BLACK-DOME-0200', 13125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-dome.jpg', '{/images/products/black-dome.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:02.975944+00', '2026-08-27 01:47:02.975944+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a4b752c0-0038-4aaf-972e-59cac1dff4b8', 'CURVE ARCHWAY', 'curve-archway', 'Curve ArchwayMaterial: WoodDimensions: 84”H X 48”WArches are custom painted to the client’s specification. Color change fee applies per color needed.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CURVE-ARCHWAY-0201', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/curve-archway.jpg', '{/images/products/curve-archway.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dfcc0964-ed18-4add-afa3-9fd523d34249', 'Gold  Tunnel Arch', 'gold-tunnel-arch', 'Tunnel  arch 7 feet high 4 feet wide', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-TUNNEL-ARCH-0202', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-tunnel-arch.jpg', '{/images/products/gold-tunnel-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6cebe6e2-fe5b-4a6a-bb87-a137a15d4690', 'Char Griller', 'char-griller', 'Char Griller.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CHAR-GRILLER-0203', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/char-griller.jpg', '{/images/products/char-griller.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e6290607-e6d7-49a4-b6a1-64e7117e088b', 'PRIME EMS  ROYALTY CHAIR', 'prime-ems-royalty-chair', 'PRIME EMS  ROYALTY CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-EMS-ROYALTY-CHAIR-0204', 1440, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-ems-royalty-chair.jpg', '{/images/products/prime-ems-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('275d26c2-724f-473d-b17c-5db51b3b088b', 'KING AND QUEEN PACKAGE', 'king-and-queen-package', '2 CHAIR, BACKDROP, PEDESTAL,RUG,PILLOWS, 2 CHANDELIER STANDS(choose your color choice)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KING-AND-QUEEN-PACKAGE-0205', 88650, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/king-and-queen-package.jpg', '{/images/products/king-and-queen-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1eddefd5-9788-4614-ba8d-b7bea2fe3519', 'Deluxe 4 Qt. Round Gold Accent Chafer', 'deluxe-4-qt-round-gold-accent-chafer', 'Other Available Sizes:
4 qt.
8 qt.
14 qt.

Durable stainless steel with mirror finish
Round shape for 360 degree serving
Elegant gold details
Half-circle lid handle for secure gripping
Two side handles for easy transportation
Fuel can holder ensures patron and staff safety
Water pan, food pan, cover, frame, and fuel holders included', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'DELUXE-4-QT-ROUND-GOLD-ACCENT-CHAFER-0206', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/deluxe-4-qt-round-gold-accent-chafer.jpg', '{/images/products/deluxe-4-qt-round-gold-accent-chafer.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3b184fcb-0a74-4582-add6-53abf97bc9f3', 'BLACK SHIMMY WALL BACKDROP', 'black-shimmy-wall-backdrop', 'SHIMMY WALL ONLY', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BLACK-SHIMMY-WALL-BACKDROP-0207', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-shimmy-wall-backdrop.jpg', '{/images/products/black-shimmy-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c6e83554-d82e-49cb-8924-b128e7ba956d', 'Heart Of Love Backdrop', 'heart-of-love-backdrop', 'PERFECT FOR WEDDING BACKDROP #HEART ONLY', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HEART-OF-LOVE-BACKDROP-0208', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/heart-of-love-backdrop.jpg', '{/images/products/heart-of-love-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('53622682-e528-44ca-ad1f-336783f216bb', 'Golden Flower Bomb Backdrop', 'golden-flower-bomb-backdrop', 'Golden Flower Bomb Backdrop.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLDEN-FLOWER-BOMB-BACKDROP-0209', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/golden-flower-bomb-backdrop.jpg', '{/images/products/golden-flower-bomb-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('27682994-2119-4779-b5a4-f43e46063507', 'Deluxe 8 Qt. Full Size Gold Accent Chafer', 'deluxe-8-qt-full-size-gold-accent-chafer', 'Durable stainless steel with mirror finishUniversal full size chaferElegant gold detailsHalf-circle lid handle for secure grippingTwo side handles for easy transportationTwo fuel can holders ensures patron and staff safetyCover holder clips keep lid propped back', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'DELUXE-8-QT-FULL-SIZE-GOLD-ACCENT-CHAFER-0210', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/deluxe-8-qt-full-size-gold-accent-chafer.jpg', '{/images/products/deluxe-8-qt-full-size-gold-accent-chafer.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('32505b22-9202-4d13-9475-b387224d71b4', 'BLACK CIRCLE WALL BACKDROP', 'black-circle-wall-backdrop', 'ALL BLACK.......... WALL ONLY', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BLACK-CIRCLE-WALL-BACKDROP-0211', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-circle-wall-backdrop.jpg', '{/images/products/black-circle-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8cc48472-da74-4e24-8999-ef4fb45b36c2', 'Lux Champagne wall', 'lux-champagne-wall', 'Lux Champagne wall.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-CHAMPAGNE-WALL-0212', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-champagne-wall.jpg', '{/images/products/lux-champagne-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3ad149c7-e3ba-4b08-9b24-5dfc7bd30e30', '360 PHOTO BOOTH', '360-photo-booth', 'WHAT’S INCLUDED:  XL platform that fit upto 4 people Delivery ,setup and BreakdownLed lightingUnlimited  slow Mo High resolution video Custom  overlay and musicPropsiPad sharing stationStations and velvet ropes', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '360-PHOTO-BOOTH-0213', 50000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/360-photo-booth.jpg', '{/images/products/360-photo-booth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8114e176-3cda-4e89-ae72-4833453a9906', '3D Grass Wall BACKDROP', '3d-grass-wall-backdrop', '3D Grass Wall BACKDROP.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '3D-GRASS-WALL-BACKDROP-0214', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3d-grass-wall-backdrop.jpg', '{/images/products/3d-grass-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9409e443-35ff-44f4-bb19-ddf5d689f1e8', '2 seater white Bench', '2-seater-white-bench', '2 seater white Bench.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '2-SEATER-WHITE-BENCH-0215', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/2-seater-white-bench.jpg', '{/images/products/2-seater-white-bench.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e690b71a-75b8-438d-9bf3-ec3b8cedb687', 'COMING 2 AMERICA', 'coming-2-america', '*PERSONALIZED BACKDROP*BALLOON GARLAND*LEXINGTON*RUG*PILLOWS*THRONE(color choice)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'COMING-2-AMERICA-0216', 85500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/coming-2-america.jpg', '{/images/products/coming-2-america.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7d7a0137-bd3c-4adb-b972-60fa0b5c0ba5', 'GOLD VASE', 'gold-vase', 'GOLD VASE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-VASE-0217', 1800, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-vase.jpg', '{/images/products/gold-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2aca2f31-a879-4735-8299-af43d3429364', 'Tufted Back - Flat Seat  sofa 3pcs', 'tufted-back-flat-seat-sofa-3pcs', 'Tufted Back - Flat Seat  sofa 3pcs.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TUFTED-BACK-FLAT-SEAT-SOFA-3PCS-0218', 40000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/tufted-back-flat-seat-sofa-3pcs.jpg', '{/images/products/tufted-back-flat-seat-sofa-3pcs.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e3fe24be-a32b-4228-9a0b-6ba67f058156', 'Light pink rug', 'light-pink-rug', 'Light pink rug.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LIGHT-PINK-RUG-0219', 4000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/light-pink-rug.jpg', '{/images/products/light-pink-rug.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d952db17-b427-41a4-93a8-f158577c7a0c', 'DOTS TABLECLOTH', 'dots-tablecloth', 'DOTS TABLECLOTH.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'DOTS-TABLECLOTH-0220', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/dots-tablecloth.jpg', '{/images/products/dots-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bc68fa17-f108-4f3a-aa0c-2a12c5cb3506', 'Dance Floor 3x3', 'dance-floor-3x3', 'This Dance Floor is the perfect way to turn any event into a party! It measures 16'' x 16'' and can accommodate up to 50 guests, giving everyone plenty of space to move and groove. The black and white checkered design is classic and timeless, making it ideal for weddings and other formal events. Our durable Dance Floor is easy to install, with a low-maintenance design that won''t require any extra care. Let the good times roll with this must-have party rental', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'DANCE-FLOOR-3X3-0221', 3200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/dance-floor-3x3.jpg', '{/images/products/dance-floor-3x3.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4b28c4d0-16e0-4116-bc26-e56b4bf6c27a', 'QuickLock Staging 8''x8'' Indoor/Outdoor Stage System', 'quicklock-staging-8x8-indooroutdoor-stage-system', 'QuickLock Staging 8''x8'' Indoor/Outdoor Stage System.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'QUICKLOCK-STAGING-8X8-INDOOROUTDOOR-STAG-0222', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/quicklock-staging-8-x8-indoor-outdoor-stage-system.jpg', '{/images/products/quicklock-staging-8-x8-indoor-outdoor-stage-system.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8f89faf8-b083-4dc3-891a-beb963519872', 'Infinity dinning chair', 'infinity-dinning-chair', 'Infinity dinning chair.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'INFINITY-DINNING-CHAIR-0223', 1800, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/infinity-dinning-chair.jpg', '{/images/products/infinity-dinning-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c2f4b9bf-fe98-4d4d-ad8f-7c843ce6a7f0', 'Patio Heater', 'patio-heater', 'Patio Heater.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PATIO-HEATER-0224', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/patio-heater.jpg', '{/images/products/patio-heater.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('45450f5d-20d3-4f5e-9301-a9ab951012be', 'SIDE PART BACKDROP', 'side-part-backdrop', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SIDE-PART-BACKDROP-0225', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/side-part-backdrop.jpg', '{/images/products/side-part-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9aed31ee-cf5f-41e4-939f-5202f08ad9e9', 'Excape throne', 'excape-throne', 'Excape throne.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'EXCAPE-THRONE-0226', 14875, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/excape-throne.jpg', '{/images/products/excape-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3fb71ae1-ac5e-4511-a0d5-ef011c720252', 'Macy Stand', 'macy-stand', 'This Macy Stand is a gold panel that can be decorated easily with flowers or any decoration piece. It may also be used as a frame for the celebrant''s picture.   


Dimensions: 150 x 200 cm | Inside of Frame: 42 x 71"

Materials: Stainless Steel

Inventory: 2', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MACY-STAND-0227', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/macy-stand.jpg', '{/images/products/macy-stand.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b99a5059-354d-4f21-9e41-1c6e80c82a83', 'White China Rim', 'white-china-rim', 'White China Rim.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'WHITE-CHINA-RIM-0228', 55, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-china-rim.jpg', '{/images/products/white-china-rim.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('20b3eeb4-e12d-48e9-949d-6fd2568df38c', 'Circle Winter Wonderland Arch Backdrop', 'circle-winter-wonderland-arch-backdrop', 'Circle Winter Wonderland Arch Backdrop.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CIRCLE-WINTER-WONDERLAND-ARCH-BACKDROP-0229', 19500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/circle-winter-wonderland-arch-backdrop.jpg', '{/images/products/circle-winter-wonderland-arch-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aa82abc0-7443-4a25-a440-a9dd57a6bfb8', 'Good life Mirror Polished Gold Silverware', 'good-life-mirror-polished-gold-silverware', 'Good life Mirror Polished Gold Silverware.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOOD-LIFE-MIRROR-POLISHED-GOLD-SILVERWAR-0230', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/good-life-mirror-polished-gold-silverware.jpg', '{/images/products/good-life-mirror-polished-gold-silverware.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ca0351bf-e295-4db4-940a-d28f60e5e48a', 'Acrylic Wall (White)', 'acrylic-wall-white', 'Prettify your event with a glossy circular backdrop stand  - Acrylic Wall (White).   Pair it with a fab balloon garland, floral arrangements, signs, and/or add pedestals to spice it up!
 Dimensions: 6ft tallMaterials: ﻿AcrylicInventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ACRYLIC-WALL-WHITE-0231', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-wall-white.jpg', '{/images/products/acrylic-wall-white.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3d1571a0-49dc-4aa4-afbc-a4b980320d11', 'BABY BLOCKS', 'baby-blocks', 'BABY BLOCKS.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BABY-BLOCKS-0232', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/baby-blocks.jpg', '{/images/products/baby-blocks.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f0a14f72-f1bb-4659-967c-7cbe8c0de494', 'SILVER SHIMMY BACKDROP', 'silver-shimmy-backdrop', 'Shimmy Shimmy Wall and 3 Pedestal', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SILVER-SHIMMY-BACKDROP-0233', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-shimmy-backdrop.jpg', '{/images/products/silver-shimmy-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('eb721d18-0c22-4fa3-bff6-8cd5d7eea676', 'Hot Air Balloon', 'hot-air-balloon', 'Hot Air Balloon.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HOT-AIR-BALLOON-0234', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/hot-air-balloon.jpg', '{/images/products/hot-air-balloon.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('629471c3-63ee-4aae-960b-feb58d33803e', 'Lux boho chair', 'lux-boho-chair', 'Lux boho chair.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-BOHO-CHAIR-0272', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-boho-chair.jpg', '{/images/products/lux-boho-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1bb42372-a92e-4774-921e-3844435cfa0e', '🌸 La Belle Façade', 'la-belle-facade', '🌸 La Belle FaçadeSize: 12 ft wide x 10 ft highStep into the charm of Paris with La Belle Façade, a stunning 12x10 ft backdrop designed to transport your event guests straight to the streets of the City of Light. Featuring classic Parisian storefront details and elegant accents, this backdrop is perfect for weddings, bridal showers, photo shoots, and chic themed parties.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LA-BELLE-FACADE-0235', 100000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/la-belle-fa-ade.jpg', '{/images/products/la-belle-fa-ade.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0cdc1897-4f8b-46b4-a030-3f5c75ffb290', 'Glitz Sequin Spandex Chair Band', 'glitz-sequin-spandex-chair-band', 'Elevate your chair decor with our Glitz Sequin Spandex Chair Bands!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GLITZ-SEQUIN-SPANDEX-CHAIR-BAND-0236', 125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/glitz-sequin-spandex-chair-band.jpg', '{/images/products/glitz-sequin-spandex-chair-band.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e9a9c338-467b-4e0b-8c7e-7ee6f5583913', 'Gold Peal Throne', 'gold-peal-throne', 'Gold Peal Throne.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-PEAL-THRONE-0237', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-peal-throne.jpg', '{/images/products/gold-peal-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dd647b8f-bcc6-472f-a8a5-91cfacb0aa28', 'Barbie Head Shelf', 'barbie-head-shelf', 'Barbie Head Shelf.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BARBIE-HEAD-SHELF-0238', 8000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/barbie-head-shelf.jpg', '{/images/products/barbie-head-shelf.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('75cc75ba-f8f2-4bfc-ab78-1ff342d95f91', 'Majestic Velvet chair', 'majestic-velvet-chair', 'Majestic Velvet chair.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MAJESTIC-VELVET-CHAIR-0239', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/majestic-velvet-chair.jpg', '{/images/products/majestic-velvet-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b742f210-a6cf-4264-9886-49a92fe80a32', 'Classic Bowl Black 6 in', 'classic-bowl-black-6-in', 'Classic Bowl Black 6 in.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CLASSIC-BOWL-BLACK-6-IN-0240', 99, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/classic-bowl-black-6-in.jpg', '{/images/products/classic-bowl-black-6-in.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('929800ce-47e2-445e-bd52-5479d90cc934', 'White Wine 20 oz', 'white-wine-20-oz', 'White Wine 20 oz.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'WHITE-WINE-20-OZ-0241', 135, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-wine-20-oz.jpg', '{/images/products/white-wine-20-oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4c7003ca-c832-4692-a19c-7bdb94f65f05', 'PRIME AQUA ROYALTY CHAIR', 'prime-aqua-royalty-chair', 'PRIME AQUA ROYALTY CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-AQUA-ROYALTY-CHAIR-0242', 1440, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-aqua-royalty-chair.jpg', '{/images/products/prime-aqua-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6409e269-a8b7-4cf5-8396-133047307ab5', '3 WAY IN CANOPY BACKDROP', '3-way-in-canopy-backdrop', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '3-WAY-IN-CANOPY-BACKDROP-0243', 87500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-way-in-canopy-backdrop.jpg', '{/images/products/3-way-in-canopy-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('db290efb-ff69-41e2-b6ea-3d88e81d6d78', 'Emerald Sofa', 'emerald-sofa', 'Emerald Sofa.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'EMERALD-SOFA-0244', 26000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/emerald-sofa.jpg', '{/images/products/emerald-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4dc9edbf-bbce-4dad-9f3a-7d96ca08158f', 'The VIP Single Stall', 'the-vip-single-stall', 'VIP Standard Features:Solar poweredFlushable toilet w/Teflon sealHeavy-duty auto-off faucetAcrylic-coated metallic ABS sinkAcrylic mirrorLED Interior and exterior "in use" lightCoat hookSwitch mat and latch activated powerProprietary aluminum structural elementsNo wood constructionPolyethylene plastic wallsProprietary roto-cast tanksWeatherproof carpetDurable plastic skidsMade in the U.S.A.﻿Specifications (each unit)Exterior Ht: 91”Int Ht: 79”Width: 48”Depth: 43.5”Weight: 600 lbs.Waste tank: 65GFresh tank: 40GDoor opening: 72″x24”Average number of uses: 125', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-VIP-SINGLE-STALL-0245', 90000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-vip-single-stall.jpg', '{/images/products/the-vip-single-stall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d5b57a9b-b32f-48ca-9a58-d593fe483f8c', 'Glory Day', 'glory-day', 'Glory Day.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GLORY-DAY-0246', 57500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/glory-day.jpg', '{/images/products/glory-day.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e9e2c60d-94d8-4a3e-8ee4-dfcf884ac958', 'Big Barn Wall Backdrop', 'big-barn-wall-backdrop', 'Big Barn Wall Backdrop.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BIG-BARN-WALL-BACKDROP-0247', 50000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/big-barn-wall-backdrop.jpg', '{/images/products/big-barn-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('538d6497-2ffe-45db-a7ab-9960f17d4f7c', 'Flowering Dogwood Tree - Pink - 11 Feet Tall x 8 Feet Wide "Sideswept" - Create', 'flowering-dogwood-tree-pink-11-feet-tall-x-8-feet-wide-sideswept-create', 'Weight: 73.40 LBSFeatures: Very Full, Sturdy, Branches BendHeight: 11 FeetWidth: 8 FeetColor Family: Pink,White', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWERING-DOGWOOD-TREE-PINK-11-FEET-TALL-0248', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flowering-dogwood-tree-pink-11-feet-tall-x-8-feet-wide-sideswept-create.jpg', '{/images/products/flowering-dogwood-tree-pink-11-feet-tall-x-8-feet-wide-sideswept-create.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('efad64f0-2b76-434d-be1d-fbf81f703188', 'Ach Wall', 'ach-wall', '1 pcs  arch ( customize any color)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ACH-WALL-0249', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ach-wall.jpg', '{/images/products/ach-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f026a40f-3cf2-4218-8846-49472ad8f010', 'Chrome Stanchion', 'chrome-stanchion', '* PER POLE* ROPE NOT INCLUDED', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CHROME-STANCHION-0250', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/chrome-stanchion.jpg', '{/images/products/chrome-stanchion.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.111523+00', '2026-08-27 01:47:03.111523+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b6718205-feed-4a00-bf51-9881b6743c9c', 'Round  Stage 8ft x8ft', 'round-stage-8ft-x8ft', 'Round  Stage 8ft x8ft.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ROUND-STAGE-8FT-X8FT-0251', 67500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/round-stage-8ft-x8ft.jpg', '{/images/products/round-stage-8ft-x8ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('03dcbcf9-9508-41df-9d67-7db7b6c848ae', 'Spandex Banquet Chair Cover', 'spandex-banquet-chair-cover', 'Spandex Banquet Chair Cover.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-BANQUET-CHAIR-COVER-0252', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-banquet-chair-cover.jpg', '{/images/products/spandex-banquet-chair-cover.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('43866a10-c692-42f0-8acf-a25b4dcb69d1', 'LUX TRIANGLE W/FLOWERS', 'lux-triangle-wflowers', 'LUX TRIANGLE W/FLOWERS.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-TRIANGLE-WFLOWERS-0253', 8500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, 'https://placehold.co/600x400?text=LUX%20TRIANGLE%20W%2FFLOWERS', '{https://placehold.co/600x400?text=LUX%20TRIANGLE%20W%2FFLOWERS}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('92960b40-1f64-4545-9a74-4f926f2b66b2', 'Closed Back 3D Arch', 'closed-back-3d-arch', 'Closed Back 3D Arch.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CLOSED-BACK-3D-ARCH-0254', 42500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/closed-back-3d-arch.jpg', '{/images/products/closed-back-3d-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('807c10fc-3482-4bf3-aeba-20cf9a579a5c', 'KIDS PACKAGE', 'kids-package', '*THEME AND COLORS CHOICE*CART*BALLOON GARLAND*KIDS TABLE*10 KIDS CHAIR*PEDESTAL', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDS-PACKAGE-0255', 77500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-package.jpg', '{/images/products/kids-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2fa031c3-7078-4af1-ae4e-33cee1b5c611', 'Table Napkin (Red)', 'table-napkin-red', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TABLE-NAPKIN-RED-0256', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-red.jpg', '{/images/products/table-napkin-red.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('59c563dc-ac7c-460a-9a6b-287c0bac007a', '3 Angles', '3-angles', '3 Angles.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '3-ANGLES-0257', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-angles.jpg', '{/images/products/3-angles.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('73afef06-6c09-48c1-9067-aa64ce2159cb', 'GENDER REVEAL PACKAGE', 'gender-reveal-package', '*THRONE*FLOWER WALL*COLOR WALL*BALLOON GARLAND*PEDETAL*PILLOWS  *BABY TABLE. (COLORS CHOICE FROM OUR SELECTION)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GENDER-REVEAL-PACKAGE-0258', 158000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gender-reveal-package.jpg', '{/images/products/gender-reveal-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c208d864-fefe-4c20-8254-a51d7f87473c', 'Lux swing', 'lux-swing', 'Lux swing.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-SWING-0259', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-swing.jpg', '{/images/products/lux-swing.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('eeccc173-6c3f-4eb9-bf75-8a34cae03c35', 'Spandex Tablecloths for 6 ft Home Rectangular', 'spandex-tablecloths-for-6-ft-home-rectangular', 'Spandex Tablecloths for 6 ft Home Rectangular.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-TABLECLOTHS-FOR-6-FT-HOME-RECTAN-0260', 1699, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-tablecloths-for-6-ft-home-rectangular.jpg', '{/images/products/spandex-tablecloths-for-6-ft-home-rectangular.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cd400cff-6852-44cc-a1b4-13aa03bc97fb', 'Renaissance Chafer', 'renaissance-chafer', 'Renaissance Chafer.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RENAISSANCE-CHAFER-0261', 3000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/renaissance-chafer.jpg', '{/images/products/renaissance-chafer.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('140f857a-aada-40ea-95b8-1aa8ca24c12a', 'Heart Backdrop', 'heart-backdrop', 'This Heart Backdrop is an elegant heart-shaped backdrop made of stainless steel. This can be easily decorated with flowers or balloons. Dimensions: 240 x 210 cmMaterials: Stainless SteelInventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HEART-BACKDROP-0262', 26000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/heart-backdrop.jpg', '{/images/products/heart-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4b1a203f-73be-4572-85d4-b2779cf27c61', 'MEYA', 'meya', 'MEYA.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MEYA-0263', 25500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/meya.jpg', '{/images/products/meya.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ad3256be-313a-453f-adc7-793e42323cbe', 'MIDNIGHT DOUBLE BACKDROP', 'midnight-double-backdrop', '(3) PEDESTAL AND BACKDROP', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MIDNIGHT-DOUBLE-BACKDROP-0264', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/midnight-double-backdrop.jpg', '{/images/products/midnight-double-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8f806209-33cb-40e5-beec-dc264b295e15', 'Silver Beaded Chargers', 'silver-beaded-chargers', 'Silver Beaded Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SILVER-BEADED-CHARGERS-0265', 399, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-beaded-chargers.jpg', '{/images/products/silver-beaded-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5fddfea9-95f0-49d8-9076-545e184d18af', 'Acrylic Wall (Black)', 'acrylic-wall-black', 'Beautify your event with a glossy circular backdrop stand - Acrylic Wall (Black). Pair it with a fab balloon garland, floral arrangements, signs, and/or add pedestals to spice it up! Dimensions: 6ft tallMaterials: ﻿AcrylicInventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ACRYLIC-WALL-BLACK-0266', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-wall-black.jpg', '{/images/products/acrylic-wall-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9e20cb2e-720b-425b-8969-ea7ecda0ba7e', 'Lexington Gold HighBoys', 'lexington-gold-highboys', 'Lexington Gold HighBoys.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LEXINGTON-GOLD-HIGHBOYS-0267', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lexington-gold-highboys.jpg', '{/images/products/lexington-gold-highboys.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('14851cdc-730f-4ff0-96f8-b2f4da0a429f', 'Elegance  Lux Loveseat', 'elegance-lux-loveseat', 'Elegance  Lux Loveseat.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ELEGANCE-LUX-LOVESEAT-0268', 19500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/elegance-lux-loveseat.jpg', '{/images/products/elegance-lux-loveseat.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bc9709cb-36e9-40fa-b221-9fd5f90f91df', 'Store Front', 'store-front', 'Store Front.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'STORE-FRONT-0269', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/store-front.jpg', '{/images/products/store-front.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0f61afe8-8a63-42e3-a57d-441ac52b5626', 'Flower Runner (Purple & Pink)', 'flower-runner-purple-pink', 'Use this Flower Runner (Purple & Pink) to be an accent of elegance to your event. This will definitely beautify your table setting. You can simply put It in the middle of the table, and hang them from a backdrop. Use your creativity to use it as a decoration in any part of your setup!Inventory: 2', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWER-RUNNER-PURPLE-PINK-0270', 37500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-runner-purple-pink.jpg', '{/images/products/flower-runner-purple-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0e53d332-803f-4a86-be2e-9618e39ff3d6', 'BABY BLUE COLUMN', 'baby-blue-column', 'BABY BLUE COLUMN.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BABY-BLUE-COLUMN-0271', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/baby-blue-column.jpg', '{/images/products/baby-blue-column.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7ac28248-46d9-4693-9f02-c04be48a81fe', 'Table Napkin (Fuchsia)', 'table-napkin-fuchsia', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TABLE-NAPKIN-FUCHSIA-0273', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-fuchsia.jpg', '{/images/products/table-napkin-fuchsia.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('469b637b-e705-4584-9ae3-a6dcc56dd889', 'SILVER CHIAVARI CHAIR', 'silver-chiavari-chair', 'SILVER CHIAVARI CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SILVER-CHIAVARI-CHAIR-0274', 700, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-chiavari-chair.jpg', '{/images/products/silver-chiavari-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('db266a09-0c65-4bd8-99a7-ece5bc51fbfa', 'Sterno Gel Chafing Fuel', 'sterno-gel-chafing-fuel', 'Sterno 20660 2 Hour Handy Fuel Methanol Gel Chafing Fuel', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'STERNO-GEL-CHAFING-FUEL-0275', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sterno-gel-chafing-fuel.jpg', '{/images/products/sterno-gel-chafing-fuel.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bc63bb29-aaf9-49f6-838d-1f05d003b4ff', 'Stainless Steel Wedding Arch', 'stainless-steel-wedding-arch', 'Stainless Steel Wedding Arch.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'STAINLESS-STEEL-WEDDING-ARCH-0276', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stainless-steel-wedding-arch.jpg', '{/images/products/stainless-steel-wedding-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('db7396e5-503f-475a-a1f6-dd71f83c4501', 'Ice Table', 'ice-table', 'Ice Table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ICE-TABLE-0277', 8000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ice-table.jpg', '{/images/products/ice-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('717d2c7d-214b-4934-b027-20db29088638', 'LUXURY LIFE RUNNER', 'luxury-life-runner', 'LUXURY LIFE RUNNER.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUXURY-LIFE-RUNNER-0278', 500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/luxury-life-runner.jpg', '{/images/products/luxury-life-runner.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('37ba7225-f8b2-4ce9-b94e-537902604662', 'Poly Napkins', 'poly-napkins', 'Poly Napkins.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'POLY-NAPKINS-0279', 125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/poly-napkins.jpg', '{/images/products/poly-napkins.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7173735e-0845-4706-828f-626f308ca1b5', 'Table Napkin (Leopard)', 'table-napkin-leopard', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TABLE-NAPKIN-LEOPARD-0280', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-leopard.jpg', '{/images/products/table-napkin-leopard.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('36fd8c95-54df-4649-aa50-919bf82b24c4', 'Gold Ruffle Chargers', 'gold-ruffle-chargers', 'Gold Ruffle Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-RUFFLE-CHARGERS-0281', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-ruffle-chargers.jpg', '{/images/products/gold-ruffle-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('93a19012-0965-449e-a460-a28e6c5cf7f5', 'Economy 8 Qt. Full Size Stainless Steel Chafer', 'economy-8-qt-full-size-stainless-steel-chafer', 'Economy 8 Qt. Full Size Stainless Steel Chafer.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ECONOMY-8-QT-FULL-SIZE-STAINLESS-STEEL-C-0282', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/economy-8-qt-full-size-stainless-steel-chafer.jpg', '{/images/products/economy-8-qt-full-size-stainless-steel-chafer.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b9fb43a5-4ded-4be6-a3cf-dcc97859e7e3', 'Love table', 'love-table', 'Love table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LOVE-TABLE-0283', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/love-table.jpg', '{/images/products/love-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('135c64e2-3eea-4832-86ea-387d34d45c81', 'Food warmer', 'food-warmer', 'Food warmer.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FOOD-WARMER-0284', 4500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/food-warmer.jpg', '{/images/products/food-warmer.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d85a1deb-0a0d-4bd3-9644-98c1b355d842', 'Pocket Arch', 'pocket-arch', 'Pocket  ArchwayMaterial: WoodDimensions: 84”H X 48”WArches are custom painted to the client’s specification. Color change fee applies per color needed.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'POCKET-ARCH-0285', 32500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pocket-arch.jpg', '{/images/products/pocket-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c1753967-c293-46bd-86fa-fa3bcf55fb67', 'Natural Backdrop and Balloon', 'natural-backdrop-and-balloon', '2 Grass 3D Walls3 Nude WallsOrganic Balloon Garland', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'NATURAL-BACKDROP-AND-BALLOON-0286', 116000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/natural-backdrop-and-balloon.jpg', '{/images/products/natural-backdrop-and-balloon.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0b9774d9-72a5-4ba7-a613-4b1f5dd6cc11', 'All black pearl', 'all-black-pearl', 'All black pearl.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ALL-BLACK-PEARL-0287', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/all-black-pearl.jpg', '{/images/products/all-black-pearl.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8189f923-e0d7-4a9c-8c0f-69b55bbd78ef', 'White Dome Party', 'white-dome-party', 'White Dome Party.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'WHITE-DOME-PARTY-0288', 13125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-dome-party.jpg', '{/images/products/white-dome-party.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5afd5883-31a3-4eac-84aa-d6e7f36378c2', 'Tiger props', 'tiger-props', 'Tiger props.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TIGER-PROPS-0289', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/tiger-props.jpg', '{/images/products/tiger-props.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fbef3fcc-4818-4590-b27d-fab146b0d094', 'Rainbow Arch Wall 7ft x 4ft', 'rainbow-arch-wall-7ft-x-4ft', 'Rainbow Arch Wall 7ft x 4ft.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RAINBOW-ARCH-WALL-7FT-X-4FT-0290', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rainbow-arch-wall-7ft-x-4ft.jpg', '{/images/products/rainbow-arch-wall-7ft-x-4ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9a58a08f-3217-4644-b1fa-b414eb83b21b', 'Blush Columns', 'blush-columns', 'Blush Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BLUSH-COLUMNS-0291', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/blush-columns.jpg', '{/images/products/blush-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9d38bc26-b12c-46b3-9b27-3f5f6b77dc9f', 'Vintage table', 'vintage-table', 'Vintage table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'VINTAGE-TABLE-0292', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/vintage-table.jpg', '{/images/products/vintage-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9086a43a-9a55-4464-aa89-2ae549849e48', 'Led Coffee Table', 'led-coffee-table', 'Led Coffee Table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LED-COFFEE-TABLE-0293', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-coffee-table.jpg', '{/images/products/led-coffee-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('93c47ba1-cde1-4816-a8f9-9db64f5b5274', 'Bubble gum  love seat', 'bubble-gum-love-seat', 'Bubble gum  love seat.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BUBBLE-GUM-LOVE-SEAT-0294', 29000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/bubble-gum-love-seat.jpg', '{/images/products/bubble-gum-love-seat.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c7170ddc-d608-4eb8-a72f-4f7c912a7ba7', 'Lightning wall', 'lightning-wall', '8x 6', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LIGHTNING-WALL-0295', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lightning-wall.jpg', '{/images/products/lightning-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('19ee9c9b-9b2e-4e78-a61a-78dc6f4fd67c', 'Rose lux sofa', 'rose-lux-sofa', 'Rose lux sofa.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ROSE-LUX-SOFA-0296', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rose-lux-sofa.jpg', '{/images/products/rose-lux-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2ca94cf9-b368-483d-b452-cbca142e539a', 'Red Snug sofa', 'red-snug-sofa', 'Red Snug sofa.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RED-SNUG-SOFA-0297', 40000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/red-snug-sofa.jpg', '{/images/products/red-snug-sofa.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6ede6604-9b07-476c-9beb-6899fda2e4f5', 'Farmhouse Bench', 'farmhouse-bench', 'Farmhouse Bench.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FARMHOUSE-BENCH-0298', 3000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/farmhouse-bench.jpg', '{/images/products/farmhouse-bench.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e9e78e88-2276-4bf1-a52d-0952f79feee7', 'Flower Runner (Purple)', 'flower-runner-purple', 'Use this Flower Runner (Purple) to be an accent of elegance to your event. This will definitely beautify your table setting. You can simply put it in the middle of the table, and hang them from a backdrop. Use your creativity to use it as a decoration in any part of your setup!Inventory: 10', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWER-RUNNER-PURPLE-0299', 12000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-runner-purple.jpg', '{/images/products/flower-runner-purple.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cb55737c-8a81-497c-b5c0-eabea4395f8e', 'NUDE COLUMNS', 'nude-columns', 'NUDE COLUMNS.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'NUDE-COLUMNS-0300', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/nude-columns.jpg', '{/images/products/nude-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.246866+00', '2026-08-27 01:47:03.246866+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('61c64911-1fcd-451b-a1b0-c2281bb29d82', '5 White Columns', '5-white-columns', '5 White Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '5-WHITE-COLUMNS-0301', 19500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/5-white-columns.jpg', '{/images/products/5-white-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d8d5ee41-613f-41d7-b4f2-09d6604a7731', 'CIRCLE BACKDROP', 'circle-backdrop', 'No flowers included', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CIRCLE-BACKDROP-0302', 9500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/circle-backdrop.jpg', '{/images/products/circle-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5536701e-2fc0-49be-94e3-e17773d67274', 'PERSONALIZED BACKROP', 'personalized-backrop', 'PERSONALIZED BACKROP.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PERSONALIZED-BACKROP-0303', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/personalized-backrop.jpg', '{/images/products/personalized-backrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('84bdd7ae-5de7-46c6-a5bd-374f78ee56a1', 'Full Size Chafer Choice Classic 8 Qt.', 'full-size-chafer-choice-classic-8-qt', '8 qt. full size capacityDurable, corrosion-resistant 18/8 stainless steel with mirror finishWood-looking plastic handlesStylish lid handle for aesthetics and safe access to the foodElevated fuel shelf ensures the heat remains close to the chaferElegant beveled legs for optimum stabilityWater pan, food pan, cover, frame, and fuel holders included', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FULL-SIZE-CHAFER-CHOICE-CLASSIC-8-QT-0304', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/full-size-chafer-choice-classic-8-qt.jpg', '{/images/products/full-size-chafer-choice-classic-8-qt.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f1687039-1590-46f5-b193-f825a4567f1a', 'Halo Wall', 'halo-wall', 'Halo Wall.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HALO-WALL-0305', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/halo-wall.jpg', '{/images/products/halo-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ba29961a-74ca-41c1-92b8-6e7ac85cfe75', 'Lotus Backdrop', 'lotus-backdrop', 'Lotus Backdrop is a lotus-shaped backdrop, that has a combination of white and gold colors. It is perfect for intimate and romantic celebrations like engagements and weddings.Dimensions: 300 x 240 cmInventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LOTUS-BACKDROP-0306', 32500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lotus-backdrop.jpg', '{/images/products/lotus-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0965e567-5102-477b-bfba-a705519bc5ff', 'Tunnel walkway (led )', 'tunnel-walkway-led', 'Tunnel walkway (led ).', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TUNNEL-WALKWAY-LED-0307', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/tunnel-walkway-led.jpg', '{/images/products/tunnel-walkway-led.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4484075f-3929-481e-957b-e9e6cb67832e', 'SILVER CAGE THRONE', 'silver-cage-throne', 'SILVER CAGE THRONE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SILVER-CAGE-THRONE-0308', 20625, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-cage-throne.jpg', '{/images/products/silver-cage-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('67160666-cc90-4226-8ced-e5c04c09b8d9', 'Carpet Runners', 'carpet-runners', 'Carpet Runners.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CARPET-RUNNERS-0309', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/carpet-runners.jpg', '{/images/products/carpet-runners.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('615a9e1d-2bbf-4cd2-8c6b-271adefb7c47', 'Treat Storefront', 'treat-storefront', 'Treat Storefront.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TREAT-STOREFRONT-0310', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/treat-storefront.jpg', '{/images/products/treat-storefront.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ed606f26-091f-4d0e-9885-a11982a49dcd', 'Farm Table', 'farm-table', '60 x 36 x 30 inches', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FARM-TABLE-0311', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/farm-table.jpg', '{/images/products/farm-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4c3764ae-162c-48f0-8582-b226b160994b', 'Spandex Black Chair Covers', 'spandex-black-chair-covers', 'Spandex Black Chair Covers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-BLACK-CHAIR-COVERS-0312', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-black-chair-covers.jpg', '{/images/products/spandex-black-chair-covers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3d119d3b-da4d-40b9-b1dd-38be15bbacbd', 'Plain Rose Gold charger', 'plain-rose-gold-charger', 'Plain Rose Gold charger.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PLAIN-ROSE-GOLD-CHARGER-0313', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/plain-rose-gold-charger.jpg', '{/images/products/plain-rose-gold-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('592d7142-aaed-4e07-9ff6-ef83b943227c', 'Stacy Backdrop', 'stacy-backdrop', 'Stacy Backdrop consists of 3 pink panels of similar sizes. Use your creativity to set this up in various ways for your event. You can incorporate balloons, flowers, and other decals.Dimensions: 120 x 220 cm (each)Inventory:', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'STACY-BACKDROP-0314', 37500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stacy-backdrop.jpg', '{/images/products/stacy-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ea6767b0-8e66-4636-bd83-143ae00d2ecb', 'Classic throne', 'classic-throne', 'Classic throne.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CLASSIC-THRONE-0315', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/classic-throne.jpg', '{/images/products/classic-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8a10eb59-5c3f-44d0-9f74-88865939dc01', 'Hendrix 52" Velvet Flared Arm Loveseat', 'hendrix-52-velvet-flared-arm-loveseat', 'Hendrix 52" Velvet Flared Arm Loveseat', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HENDRIX-52-VELVET-FLARED-ARM-LOVESEAT-0316', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/hendrix-52-velvet-flared-arm-loveseat.jpg', '{/images/products/hendrix-52-velvet-flared-arm-loveseat.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2615bd03-4ff5-45fd-b89a-311ac19240db', 'FLOWER FRESH W/VASE', 'flower-fresh-wvase', 'FLOWER FRESH W/VASE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWER-FRESH-WVASE-0317', 6500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-fresh-w-vase.jpg', '{/images/products/flower-fresh-w-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ac779ce3-da13-4bdf-8742-eda90b6be091', 'FIVE TOP CRYSTAL', 'five-top-crystal', 'FIVE TOP CRYSTAL.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FIVE-TOP-CRYSTAL-0318', 3000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/five-top-crystal.jpg', '{/images/products/five-top-crystal.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7bd7f5f2-bcf6-4bb4-b8c9-14fa90921308', 'MOI PINK VELVET', 'moi-pink-velvet', 'MOI PINK VELVET.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MOI-PINK-VELVET-0319', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/moi-pink-velvet.jpg', '{/images/products/moi-pink-velvet.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('888c7f3f-f31d-47c4-8209-d64dc7a309f2', 'Pink Elegance Loveseat', 'pink-elegance-loveseat', 'Pink Elegance Loveseat.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PINK-ELEGANCE-LOVESEAT-0320', 19500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pink-elegance-loveseat.jpg', '{/images/products/pink-elegance-loveseat.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e1f5dee6-0f91-4cce-b310-58630aede5d7', 'Plain Silver Chargers', 'plain-silver-chargers', 'Plain Silver Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PLAIN-SILVER-CHARGERS-0321', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/plain-silver-chargers.jpg', '{/images/products/plain-silver-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a7a7c909-7aca-44aa-aa8a-b314f36c14d5', 'Flower Wall (Blue)', 'flower-wall-blue', 'The Flower Wall (Blue) is a stand-alone backdrop that is sure to be a perfect spot for photo opting for your event!
This Flower Wall has matching Flower Runners & Flower Balls
Dimensions: 8ft (W) x 8ft (H)Materials:  High-Quality Faux FlowersInventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWER-WALL-BLUE-0322', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-wall-blue.jpg', '{/images/products/flower-wall-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('53ed38bd-8bb8-4c1a-ab36-1fd33491827d', 'Bamboo Loveseat', 'bamboo-loveseat', 'If you are aiming to have a modern and dramatic twist on the traditional loveseat used during events, then the Bamboo Loveseat is the perfect sofa that will surely turn heads at your party. It has a white velvet cushion, gold polished, and reflective frame finish which can seat 3 adults.Dimension: 64” W x 24” Depth x 52” HInventory: 2 pcs for White Cushion and 1 pc on the rest of the cushion colors', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BAMBOO-LOVESEAT-0323', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/bamboo-loveseat.jpg', '{/images/products/bamboo-loveseat.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4686b202-cbf7-48e7-9d35-d53cc5b9c1f7', 'CLASSIC FOUR BACKDROP', 'classic-four-backdrop', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CLASSIC-FOUR-BACKDROP-0324', 30000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/classic-four-backdrop.jpg', '{/images/products/classic-four-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fc0e5507-d642-4895-a398-092adf1cc7ea', 'Flower Wall Backdrop', 'flower-wall-backdrop', 'Flower Wall Backdrop.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWER-WALL-BACKDROP-0325', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-wall-backdrop.jpg', '{/images/products/flower-wall-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8963c2c0-dca6-40e5-a779-61a43cc93c48', 'LUX CAKE TABLE', 'lux-cake-table', 'LUX CAKE TABLE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-CAKE-TABLE-0326', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-cake-table.jpg', '{/images/products/lux-cake-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('42375e76-bfb6-4832-9a8b-facc5871f540', 'cold sparkler fountain', 'cold-sparkler-fountain', 'cold sparkler fountain.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'COLD-SPARKLER-FOUNTAIN-0327', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cold-sparkler-fountain.jpg', '{/images/products/cold-sparkler-fountain.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('95b9431e-b914-4b5f-a72d-f34510201b15', 'Lux mirror  swing', 'lux-mirror-swing', 'Lux mirror  swing.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-MIRROR-SWING-0328', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-mirror-swing.jpg', '{/images/products/lux-mirror-swing.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('42470b15-5815-46f6-9b39-8ad000c1bdd6', 'Triangle Treats wall', 'triangle-treats-wall', 'Triangle Treats wall.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TRIANGLE-TREATS-WALL-0329', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/triangle-treats-wall.jpg', '{/images/products/triangle-treats-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e2610ac2-d5f0-44ef-bf36-d5d7395d5944', 'Magazine Photo Box', 'magazine-photo-box', '8x8 magazine photo box', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MAGAZINE-PHOTO-BOX-0330', 80000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/magazine-photo-box.jpg', '{/images/products/magazine-photo-box.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('683cf203-0263-4a12-9d6f-f72867ba067e', 'PRIME WHITE  ROYALTY CHAIR', 'prime-white-royalty-chair', 'PRIME WHITE  ROYALTY CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-WHITE-ROYALTY-CHAIR-0331', 1440, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-white-royalty-chair.jpg', '{/images/products/prime-white-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b04bdd1d-9709-49e2-a510-0047ae732024', 'Grass Wall', 'grass-wall', 'Grass Wall.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GRASS-WALL-0332', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/grass-wall.jpg', '{/images/products/grass-wall.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b54757cc-81f4-46aa-813a-a798faa8781a', 'Wedding cross', 'wedding-cross', 'Wedding cross.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'WEDDING-CROSS-0333', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/wedding-cross.jpg', '{/images/products/wedding-cross.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fa2966df-cb46-46f8-b289-5c9874b0f61a', '3 WAY BACKDROP', '3-way-backdrop', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '3-WAY-BACKDROP-0334', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-way-backdrop.jpg', '{/images/products/3-way-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('451a7b8e-7fdb-441a-ba99-7ece081ee26b', 'Sweet Lux Station 4ft', 'sweet-lux-station-4ft', 'Sweet Lux Station 4ft.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SWEET-LUX-STATION-4FT-0335', 47500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sweet-lux-station-4ft.jpg', '{/images/products/sweet-lux-station-4ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c056f533-3c72-45ce-8b3a-1b9481cbe6ee', 'Kids Table ( 4ft )', 'kids-table-4ft', 'Kids Table ( 4ft ).', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDS-TABLE-4FT-0336', 1000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-table-4ft.jpg', '{/images/products/kids-table-4ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0da4dba0-4a02-4966-9528-0aa0ae9b17c0', 'Lotus flower ( Changing light )', 'lotus-flower-changing-light', 'price is per section,if 2 pieces is needed add 2 to cart', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LOTUS-FLOWER-CHANGING-LIGHT-0337', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lotus-flower-changing-light.jpg', '{/images/products/lotus-flower-changing-light.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('db99dfb3-bdcc-4f93-86f7-3722cc526525', 'Ripple Arch Wall (Blue)', 'ripple-arch-wall-blue', 'Ripple Arch Wall (Blue).', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RIPPLE-ARCH-WALL-BLUE-0338', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ripple-arch-wall-blue.jpg', '{/images/products/ripple-arch-wall-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('18b459ca-c387-4840-b1a4-567d96fdb45b', 'Back drop poles', 'back-drop-poles', 'Back drop poles.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BACK-DROP-POLES-0339', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/back-drop-poles.jpg', '{/images/products/back-drop-poles.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c6d417b4-ffdf-4ca7-81d7-865ca007c07c', 'Lounge Circles', 'lounge-circles', 'Lounge Circles.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LOUNGE-CIRCLES-0340', 6500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lounge-circles.jpg', '{/images/products/lounge-circles.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3793f109-900f-4df1-ae43-a74f08259117', 'Single Angle', 'single-angle', 'Single Angle.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SINGLE-ANGLE-0341', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/single-angle.jpg', '{/images/products/single-angle.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('caf0bc54-26be-4a62-8f13-70699dc0edb0', 'Table Napkin (Ivory)', 'table-napkin-ivory', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'TABLE-NAPKIN-IVORY-0342', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-ivory.jpg', '{/images/products/table-napkin-ivory.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7a5a9195-755a-43cd-bf76-91416d4e0acf', 'PRIME LAV ROYALTY CHAIR', 'prime-lav-royalty-chair', 'PRIME LAV ROYALTY CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-LAV-ROYALTY-CHAIR-0343', 1440, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-lav-royalty-chair.jpg', '{/images/products/prime-lav-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3e581164-94fb-4b2e-92b2-15f03449125c', 'EARTH TONE', 'earth-tone', 'EARTH TONE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'EARTH-TONE-0344', 47500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/earth-tone.jpg', '{/images/products/earth-tone.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('35c2ae5c-c8be-4513-bcc3-12a36487d700', 'Lux affair', 'lux-affair', 'Lux affair.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LUX-AFFAIR-0345', 120000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-affair.jpg', '{/images/products/lux-affair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4557af33-f295-430b-b1fe-954bb9eedaae', 'Snow White table', 'snow-white-table', 'Snow White table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SNOW-WHITE-TABLE-0346', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/snow-white-table.jpg', '{/images/products/snow-white-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cc9cf513-b021-461e-aa06-1db0f57eaa62', 'KIDS THRONE', 'kids-throne', 'GOLD N WHITESILVER N WHITEROYAL BLUE N GOLD', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDS-THRONE-0347', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-throne.jpg', '{/images/products/kids-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('356be1a3-a5bf-48bf-8560-d45b6a955710', 'Lexington mini', 'lexington-mini', 'Lexington mini.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LEXINGTON-MINI-0348', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lexington-mini.jpg', '{/images/products/lexington-mini.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('53a85316-1799-45a3-9e3a-c6c90727ff0e', 'OLD FASHION HAGING BACKDROP', 'old-fashion-haging-backdrop', 'CHOOSE YOUR COLOR', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'OLD-FASHION-HAGING-BACKDROP-0349', 17500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/old-fashion-haging-backdrop.jpg', '{/images/products/old-fashion-haging-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4db5f2c8-3b1c-4337-9d35-059f04c2cd22', 'Elegance  Folding Chairs', 'elegance-folding-chairs', 'Elegance  Folding Chairs.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ELEGANCE-FOLDING-CHAIRS-0350', 1400, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/elegance-folding-chairs.jpg', '{/images/products/elegance-folding-chairs.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.613426+00', '2026-08-27 01:47:03.613426+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('eb9c212a-3b57-42b3-a4a9-2695a42fe75e', 'Champagne Arch', 'champagne-arch', 'Champagne Arch.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CHAMPAGNE-ARCH-0351', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/champagne-arch.jpg', '{/images/products/champagne-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('94f2d066-9235-4ee9-9f06-5fbc7c060696', 'Oval wedding Bench', 'oval-wedding-bench', 'Oval wedding Bench.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'OVAL-WEDDING-BENCH-0352', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/oval-wedding-bench.jpg', '{/images/products/oval-wedding-bench.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('50071d49-948b-4b32-8556-76a582016913', 'THE CURVE THRONE', 'the-curve-throne', 'THE CURVE THRONE.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-CURVE-THRONE-0353', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-curve-throne.jpg', '{/images/products/the-curve-throne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dfdb5bdc-57ce-4b53-945e-5b26907bc91c', 'Marci Backdrop', 'marci-backdrop', 'Marci Backdrop has a combination of pink and white panels with gold accents. This backdrop is perfect for your upcoming event. Decorate it with balloons, flowers, or any event prop.


 Dimensions:620 x 200 cm (All together)

Inventory: 1', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MARCI-BACKDROP-0354', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/marci-backdrop.jpg', '{/images/products/marci-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('266b3c99-36a0-4e5f-960b-8a50dd98fb2a', 'Kids trendy Table packages', 'kids-trendy-table-packages', 'Here is our lovely kids setup tablepadded chairchargesnapkins table runnerforal centepeice', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'KIDS-TRENDY-TABLE-PACKAGES-0355', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/kids-trendy-table-packages.jpg', '{/images/products/kids-trendy-table-packages.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0c05c4ba-300f-4379-a2b4-6f438c6faee7', 'Solo Sections ( set of 3 )', 'solo-sections-set-of-3', 'per set (3pcs)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SOLO-SECTIONS-SET-OF-3-0356', 15750, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/solo-sections-set-of-3.jpg', '{/images/products/solo-sections-set-of-3.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6909f315-4727-4c38-9075-c493d9a1dab4', 'Spandex Pink Chair Covers', 'spandex-pink-chair-covers', 'Spandex Pink Chair Covers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SPANDEX-PINK-CHAIR-COVERS-0357', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spandex-pink-chair-covers.jpg', '{/images/products/spandex-pink-chair-covers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('239c3e3b-ea7b-440b-a3fa-5d7f7ea091b0', 'REEF CHARGER', 'reef-charger', 'REEF CHARGER.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'REEF-CHARGER-0358', 699, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger.jpg', '{/images/products/reef-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e7cab3ac-9eaa-46c1-9bf5-14854ca53cb5', 'Ice cream props', 'ice-cream-props', 'Ice cream props.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ICE-CREAM-PROPS-0359', 8000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ice-cream-props.jpg', '{/images/products/ice-cream-props.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5d30fb0d-f39c-4428-8eff-a1ef55ea2d71', '3D Letters', '3d-letters', '3D Letters.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', '3D-LETTERS-0360', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3d-letters.jpg', '{/images/products/3d-letters.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5414720e-c800-4ce1-9b7c-772155735b0a', 'SWEET 16 PACKAGE', 'sweet-16-package', '*SINGLE THRONE*BACKDROP DECAL*BALLOON GARLAND*MARQUEE*PEDESTAL  .(color/theme choice)', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SWEET-16-PACKAGE-0361', 104400, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sweet-16-package.jpg', '{/images/products/sweet-16-package.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f5349435-934d-409a-a91a-48258e5f9f21', 'The Royal Pour', 'the-royal-pour', '🌟 Perfect For:•Signature cocktail stations•Champagne or wine displays•Brand activations•VIP & lounge experiences•Luxury weddings or corporate mixers', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-ROYAL-POUR-0362', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-royal-pour.jpg', '{/images/products/the-royal-pour.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('211aa27b-5f5c-4a26-b852-578f88755a9f', 'Cotton Nakins', 'cotton-nakins', 'Cotton Nakins.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'COTTON-NAKINS-0363', 400, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cotton-nakins.jpg', '{/images/products/cotton-nakins.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('70212802-cf5b-4ff9-a2c5-0901cc38a227', 'Plain Gold Chargers', 'plain-gold-chargers', 'Plain Gold Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PLAIN-GOLD-CHARGERS-0364', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/plain-gold-chargers.jpg', '{/images/products/plain-gold-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6eaaf3db-b4c8-40cf-b896-bdf3150ebb5f', 'Led Cloud  6x6', 'led-cloud-6x6', 'Led Cloud  6x6.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LED-CLOUD-6X6-0365', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-cloud-6x6.jpg', '{/images/products/led-cloud-6x6.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('66c437e1-744b-42b2-9055-c7829e162e77', 'Barbie Ready', 'barbie-ready', 'Barbie Ready.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BARBIE-READY-0366', 57500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/barbie-ready.jpg', '{/images/products/barbie-ready.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('250a7246-0067-4010-9295-d0a7ef7253aa', 'The Majestic Backdrop', 'the-majestic-backdrop', '👑 The Majestic BackdropSize: 14 ft wide x 8 ft highCustom Color Available (+$125 paint fee)Elevate your event with The Majestic Backdrop — a stunning 14x8 ft display that brings a royal touch to any celebration. Whether you’re hosting a wedding, baby shower, birthday, or brand launch, this elegant wall creates the perfect photo moment or decor focal point.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-MAJESTIC-BACKDROP-0367', 65000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-majestic-backdrop.jpg', '{/images/products/the-majestic-backdrop.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9dcd11d4-5800-4f24-9c5d-64ab2dcacb91', 'THE CHEST OF GOLD', 'the-chest-of-gold', 'THE CHEST OF GOLD.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'THE-CHEST-OF-GOLD-0368', 29000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-chest-of-gold.jpg', '{/images/products/the-chest-of-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('addef665-a1d4-46fc-b8c5-ee1a17812191', 'Oval lux gold table', 'oval-lux-gold-table', 'Size L 240cm W 120cm H 75 cm', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'OVAL-LUX-GOLD-TABLE-0369', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/oval-lux-gold-table.jpg', '{/images/products/oval-lux-gold-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8fe6b12e-8ed0-489d-aa33-70131d11e85a', 'Ripple Arch Wall (Pink)', 'ripple-arch-wall-pink', 'Ripple Arch Wall (Pink) is a 3 pc backdrop that is ideal for your special celebration. It is perfectly paired with balloon garlands and floral arrangements.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RIPPLE-ARCH-WALL-PINK-0370', 45000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ripple-arch-wall-pink.jpg', '{/images/products/ripple-arch-wall-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e794f308-26af-4cb5-8be8-944495549e1d', 'Flower Runner (Pink)', 'flower-runner-pink', 'Use this Flower Runner (Pink) to be an accent of elegance to your event. This will definitely beautify your table setting. You can simply put it in the middle of the table, and hang them from a backdrop. Use your creativity to use it as a decoration in any part of your setup! Inventory: 10', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'FLOWER-RUNNER-PINK-0371', 12000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-runner-pink.jpg', '{/images/products/flower-runner-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('244af647-da40-4e3d-9f2f-dd94476cb5fb', 'Tent 20x20', 'tent-20x20', 'Tent 20x20.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'TENT-20X20-0489', 47500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/tent-20x20.jpg', '{/images/products/tent-20x20.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ab9407ce-dcf2-46ef-900b-b962742dc86d', 'Prime Pure White Arch', 'prime-pure-white-arch', 'COMES IN PINK ALSO', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-PURE-WHITE-ARCH-0372', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-pure-white-arch.jpg', '{/images/products/prime-pure-white-arch.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8c4dce26-70f8-4cef-b0f3-6f26dc55c450', 'HIGH ROLLER SOFA SET (3)', 'high-roller-sofa-set-3', 'HIGH ROLLER SOFA SET (3).', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HIGH-ROLLER-SOFA-SET-3-0373', 18000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/high-roller-sofa-set-3.jpg', '{/images/products/high-roller-sofa-set-3.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ab8d3c7d-f41a-4d8b-967b-60178ee73318', 'PRIME BLACK ROYALTY CHAIR', 'prime-black-royalty-chair', 'PRIME BLACK ROYALTY CHAIR.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'PRIME-BLACK-ROYALTY-CHAIR-0374', 1440, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-black-royalty-chair.jpg', '{/images/products/prime-black-royalty-chair.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f16194e1-34c2-40d3-a7bc-361e73ab1fad', 'Rose Gold Beaded Chargers', 'rose-gold-beaded-chargers', 'Rose Gold Beaded Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ROSE-GOLD-BEADED-CHARGERS-0375', 399, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rose-gold-beaded-chargers.jpg', '{/images/products/rose-gold-beaded-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('52f95ea4-36f6-4204-bd79-ecac748430c1', 'Crystals Trumpet Vase', 'crystals-trumpet-vase', 'This beaded crystal vase features rows and rows of glinting beaded acrylic crystals in luxurious metal wire frame for a pure royal look and feel.  Our dazzling jewel embedded vase is artistically crafted with faceted round acrylic crystals wired intricately in an elegant trumpet shape.  Glam your wedding tables up by lighting candles and LEDs inside and placing this precious crystal vase atop decorative mirrors and chandelier centerpiece risers.  Place a kissing ball or a rose bouquet atop to create a mesmeric floral tabletop presentation. Pair it with other beaded crystal decorative vases, candle holders, candlesticks, and tower vases available in modish designs and affordable rates.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'CRYSTALS-TRUMPET-VASE-0376', 2000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/crystals-trumpet-vase.jpg', '{/images/products/crystals-trumpet-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f144b0c0-28ac-493e-b47c-9d1d23738495', 'Side table', 'side-table', 'Side table.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SIDE-TABLE-0377', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/side-table.jpg', '{/images/products/side-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d2886790-8ee2-4cbd-a87f-29f163ace862', 'manzanita', 'manzanita', 'manzanita.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'MANZANITA-0378', 4000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/manzanita.jpg', '{/images/products/manzanita.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('720901c8-c6f5-4ac7-8f94-3c8afd570fea', 'Red Wine 13.5oz', 'red-wine-135oz', 'Red Wine 13.5oz.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'RED-WINE-135OZ-0379', 135, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/red-wine-13-5oz.jpg', '{/images/products/red-wine-13-5oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2da9ba2c-3308-40f5-889d-6985b0ba1c8e', 'LED CLOUD WALL 4X5FT', 'led-cloud-wall-4x5ft', 'LED CLOUD WALL 4X5FT.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'LED-CLOUD-WALL-4X5FT-0380', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-cloud-wall-4x5ft.jpg', '{/images/products/led-cloud-wall-4x5ft.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a5ca3cf1-757f-4db7-9ed6-63ac561aed43', 'BRIDES SPECIAL', 'brides-special', '*2 THRONE*BACKDROP*BACKDROP FLOWER GARLAND*2 TREES*FLOWER RUNNER*CANDLE SETS*SPECIALTY TABLE', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BRIDES-SPECIAL-0381', 121050, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/brides-special.jpg', '{/images/products/brides-special.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('47f4f411-535d-4450-bd11-bf7efc3979c5', 'Gold Columns', 'gold-columns', 'Gold Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'GOLD-COLUMNS-0382', 6500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-columns.jpg', '{/images/products/gold-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7986477a-9d9c-4acd-81cf-93481551f3e1', 'Hot Pink Columns', 'hot-pink-columns', 'Hot Pink Columns.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'HOT-PINK-COLUMNS-0383', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/hot-pink-columns.jpg', '{/images/products/hot-pink-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6159d0ce-4275-424e-b9d4-2c398c0d3b18', 'ELEGANT CANDLES', 'elegant-candles', 'ELEGANT CANDLES.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'ELEGANT-CANDLES-0384', 6500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/elegant-candles.jpg', '{/images/products/elegant-candles.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('95e5fb2e-b9e4-43e2-a084-f802867f3a83', 'Black Beaded Chargers', 'black-beaded-chargers', 'Black Beaded Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'BLACK-BEADED-CHARGERS-0385', 399, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-beaded-chargers.jpg', '{/images/products/black-beaded-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f135e6a2-52d8-4174-898e-5b7ea7715874', 'Silver Ruffle Chargers', 'silver-ruffle-chargers', 'Silver Ruffle Chargers.', 'b7e70a32-61d9-49b2-85c6-fb99f57b0af5', 'SILVER-RUFFLE-CHARGERS-0386', 200, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-ruffle-chargers.jpg', '{/images/products/silver-ruffle-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aec1df6e-09c4-4d26-a092-6812c6852683', 'Slatted  Pedestal', 'slatted-pedestal', 'Slatted  Pedestal.', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'SLATTED-PEDESTAL-0387', 10000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/slatted-pedestal.jpg', '{/images/products/slatted-pedestal.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('045b00e0-c24e-437d-8857-b5dd463bc3b5', 'Sliver Pedestal', 'sliver-pedestal', 'Sliver Pedestal.', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'SLIVER-PEDESTAL-0388', 6000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sliver-pedestal.jpg', '{/images/products/sliver-pedestal.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2ce4b22e-6497-4ee3-b733-9fae68e71332', 'BLACK COLUMNS', 'black-columns', 'BLACK COLUMNS.', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'BLACK-COLUMNS-0389', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/black-columns.jpg', '{/images/products/black-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('df4d8596-4c5c-4466-9373-6c39377b6658', '3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER', '3-piece-set-of-metal-cylinder-pedestals-display-silver', '3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER.', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', '3-PIECE-SET-OF-METAL-CYLINDER-PEDESTALS--0390', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-piece-set-of-metal-cylinder-pedestals-display-silver.jpg', '{/images/products/3-piece-set-of-metal-cylinder-pedestals-display-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0d8c78aa-9c4e-47ae-b5c2-31020bde1d67', 'Royal Blue Columns', 'royal-blue-columns', 'Royal Blue Columns.', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'ROYAL-BLUE-COLUMNS-0391', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/royal-blue-columns.jpg', '{/images/products/royal-blue-columns.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('164094c3-5cd8-4aa0-aea7-8757a0eb0cd8', 'Ruth Pedestals (Gold)', 'ruth-pedestals-gold', 'Ruth Pedestals (Gold).', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'RUTH-PEDESTALS-GOLD-0392', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ruth-pedestals-gold.jpg', '{/images/products/ruth-pedestals-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fd2c06af-77d6-4cad-94e1-f6922643cbe9', 'Gold Square Pedestals', 'gold-square-pedestals', 'Gold Square Pedestals.', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'GOLD-SQUARE-PEDESTALS-0393', 8000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-square-pedestals.jpg', '{/images/products/gold-square-pedestals.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('24aeafe5-88ee-40fb-8ebe-a7e17ce03c13', 'Ruth Pedestals (Silver)', 'ruth-pedestals-silver', 'Ruth Pedestals (Silver).', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'RUTH-PEDESTALS-SILVER-0394', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/ruth-pedestals-silver.jpg', '{/images/products/ruth-pedestals-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1be980ba-f27b-49f9-b347-bc1cc3230e1a', 'Cylinder Acrylic Pedestals (White)', 'cylinder-acrylic-pedestals-white', 'Cylinder Acrylic Pedestals (White).', 'b0b7b0b1-5c0c-4be1-8bff-78a6d4d482c2', 'CYLINDER-ACRYLIC-PEDESTALS-WHITE-0395', 16000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cylinder-acrylic-pedestals-white.jpg', '{/images/products/cylinder-acrylic-pedestals-white.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('70fad228-311b-45b8-81ad-faaa939b0823', 'Charice Shelf', 'charice-shelf', 'Charice Shelf.', '15d31198-66fb-4abf-b8a7-91f88e6502b1', 'CHARICE-SHELF-0396', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/charice-shelf.jpg', '{/images/products/charice-shelf.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('97b7f418-5ac6-4c5b-9dff-e3d5da74dd96', 'Prime cycle cart', 'prime-cycle-cart', 'Prime cycle cart.', '05ce8e78-c7e9-4fad-b3e6-6e9f4972ff32', 'PRIME-CYCLE-CART-0397', 30000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/prime-cycle-cart.jpg', '{/images/products/prime-cycle-cart.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e19b8609-f211-4079-ab8d-942907cb0fee', 'Pumpkin Cart', 'pumpkin-cart', 'Pumpkin Cart.', '05ce8e78-c7e9-4fad-b3e6-6e9f4972ff32', 'PUMPKIN-CART-0398', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pumpkin-cart.jpg', '{/images/products/pumpkin-cart.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e0b280d3-4b3a-4c79-9af0-6b58e73e86a6', 'All White Cart', 'all-white-cart', 'All White Cart.', '05ce8e78-c7e9-4fad-b3e6-6e9f4972ff32', 'ALL-WHITE-CART-0399', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/all-white-cart.jpg', '{/images/products/all-white-cart.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d60c5664-92ec-4632-9e8b-96852bc5a1f2', 'Plain Red Chargers', 'plain-red-chargers', 'Plain Red Chargers.', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'PLAIN-RED-CHARGERS-0400', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/plain-red-chargers.jpg', '{/images/products/plain-red-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.717738+00', '2026-08-27 01:47:03.717738+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1890008c-ea18-4f9b-b12e-3714193540bb', 'Eclipse Gold Charger', 'eclipse-gold-charger', 'Eclipse Gold Charger.', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'ECLIPSE-GOLD-CHARGER-0401', 650, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/eclipse-gold-charger.jpg', '{/images/products/eclipse-gold-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e09a7a18-7f90-4790-89ea-5122b6157c3f', 'Natural Tone Charger', 'natural-tone-charger', 'Natural Tone Charger.', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'NATURAL-TONE-CHARGER-0402', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/natural-tone-charger.jpg', '{/images/products/natural-tone-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e1c2eb72-d703-439c-8bf9-a62acfccba0f', 'Reef Charger Plate (Pink)', 'reef-charger-plate-pink', 'Reef Charger Plate (Pink).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-PINK-0403', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-pink.jpg', '{/images/products/reef-charger-plate-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a2878b98-45ae-4771-b562-22389020747e', 'Reef Charger Plate (Navy Blue)', 'reef-charger-plate-navy-blue', 'Reef Charger Plate (Navy Blue).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-NAVY-BLUE-0404', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-navy-blue.jpg', '{/images/products/reef-charger-plate-navy-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('126e7584-aa82-47f0-8b25-b652f006f1db', 'Reef Charger Plate (Purple)', 'reef-charger-plate-purple', 'Reef Charger Plate (Purple).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-PURPLE-0405', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-purple.jpg', '{/images/products/reef-charger-plate-purple.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('68dff3f7-9a7b-4ca1-9fb2-dfbb78f4876e', 'Reef Charger Plate (Gold)', 'reef-charger-plate-gold', 'Reef Charger Plate (Gold).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-GOLD-0406', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-gold.jpg', '{/images/products/reef-charger-plate-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('21196bc1-48c4-4021-b809-e11fcb1c0cc4', 'Reef Charger Plate (Black)', 'reef-charger-plate-black', 'Reef Charger Plate (Black).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-BLACK-0407', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-black.jpg', '{/images/products/reef-charger-plate-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('68de7c1e-1ded-4cbf-b5e4-7b9d0d549d46', 'Reef Charger Plate (Aqua Blue)', 'reef-charger-plate-aqua-blue', 'Reef Charger Plate (Aqua Blue).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-AQUA-BLUE-0408', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-aqua-blue.jpg', '{/images/products/reef-charger-plate-aqua-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0fd6b66d-8678-4971-9f95-773f43f1b95c', 'Reef Charger Plate (Baby Blue)', 'reef-charger-plate-baby-blue', 'Reef Charger Plate (Baby Blue).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-BABY-BLUE-0409', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-baby-blue.jpg', '{/images/products/reef-charger-plate-baby-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dd3912ac-33d7-48e4-a935-03fe8d347026', 'Reef Charger Plate (Burgundy)', 'reef-charger-plate-burgundy', 'Reef Charger Plate (Burgundy).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-BURGUNDY-0410', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-burgundy.jpg', '{/images/products/reef-charger-plate-burgundy.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('26a9c3f3-93f7-4531-9966-1a304d44419a', 'Reef Charger Plate (Silver)', 'reef-charger-plate-silver', 'Reef Charger Plate (Silver).', 'c7a98428-bda4-404a-92c4-25f3c2cc3252', 'REEF-CHARGER-PLATE-SILVER-0411', 350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/reef-charger-plate-silver.jpg', '{/images/products/reef-charger-plate-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aa6957b8-6fa2-49ec-8a55-a3a203b7d5e6', '3 Piece Cylinder Centerpiece', '3-piece-cylinder-centerpiece', '3 Piece Cylinder Centerpiece.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', '3-PIECE-CYLINDER-CENTERPIECE-0412', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-piece-cylinder-centerpiece.jpg', '{/images/products/3-piece-cylinder-centerpiece.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6897a218-3c04-46fa-904e-397bf97d9aac', 'GOLD  VASE', 'gold-vase-1', 'GOLD  VASE.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'GOLD-VASE-1-0413', 1800, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-vase.jpg', '{/images/products/gold-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('6a269fd6-1b40-4636-ba36-55c0cc86e872', 'Peach Time Centerpiece', 'peach-time-centerpiece', 'Peach Time Centerpiece.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'PEACH-TIME-CENTERPIECE-0414', 4500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/peach-time-centerpiece.jpg', '{/images/products/peach-time-centerpiece.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1d5457c9-c365-4a72-94a3-9cc80c223a40', 'The Elegance  Centerpiece', 'the-elegance-centerpiece', 'The Elegance  Centerpiece.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'THE-ELEGANCE-CENTERPIECE-0415', 4500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-elegance-centerpiece.jpg', '{/images/products/the-elegance-centerpiece.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a0d7629a-8058-481b-af6b-08ad31b87dbc', 'Spring Valley Centerpiece', 'spring-valley-centerpiece', 'Spring Valley Centerpiece.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'SPRING-VALLEY-CENTERPIECE-0416', 4500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/spring-valley-centerpiece.jpg', '{/images/products/spring-valley-centerpiece.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c2b08d1d-c09c-4b28-a08a-d06a51dbce45', 'Silver Vase', 'silver-vase', 'Silver Vase.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'SILVER-VASE-0417', 1500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-vase.jpg', '{/images/products/silver-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('755700af-1b4a-4468-88ea-257637fecf96', 'ROUND CRYSTAL VASE', 'round-crystal-vase', 'ROUND CRYSTAL VASE.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'ROUND-CRYSTAL-VASE-0418', 1000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/round-crystal-vase.jpg', '{/images/products/round-crystal-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b44c106c-7bd3-4408-8712-09ca2a05a2f0', 'SILVER FRESH FLOWERS W/ VASE', 'silver-fresh-flowers-w-vase', 'SILVER FRESH FLOWERS W/ VASE.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'SILVER-FRESH-FLOWERS-W-VASE-0419', 6500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silver-fresh-flowers-w-vase.jpg', '{/images/products/silver-fresh-flowers-w-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('40dc3706-6a37-49d8-9844-b2e715872f37', '3 GOBLETS', '3-goblets', '3 GOBLETS.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', '3-GOBLETS-0420', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-goblets.jpg', '{/images/products/3-goblets.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7bae9644-83fa-41be-b0b5-e43817083f5b', 'FLORAL BALL', 'floral-ball', 'FLORAL BALL.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'FLORAL-BALL-0421', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/floral-ball.jpg', '{/images/products/floral-ball.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bc2ed649-07bb-4bff-944e-35a84b88adbf', 'FLORAL CARRIAGE CENTERPIECE', 'floral-carriage-centerpiece', 'FLORAL CARRIAGE CENTERPIECE.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'FLORAL-CARRIAGE-CENTERPIECE-0422', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/floral-carriage-centerpiece.jpg', '{/images/products/floral-carriage-centerpiece.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('674dd381-732f-436d-8bc1-7b83c60894e4', 'BALLOON CENTERPIECE', 'balloon-centerpiece', 'BALLOON CENTERPIECE.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'BALLOON-CENTERPIECE-0423', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/balloon-centerpiece.jpg', '{/images/products/balloon-centerpiece.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('62784fad-bfa1-4f19-99eb-7fb6cc2ac2fc', 'FLOWER QUEEN W/VASE', 'flower-queen-wvase', 'FLOWER QUEEN W/VASE.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'FLOWER-QUEEN-WVASE-0424', 6500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-queen-w-vase.jpg', '{/images/products/flower-queen-w-vase.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('66b6db38-17f4-4706-96be-b7bc9f997f4d', '3 SET CORAL', '3-set-coral', '3 SET CORAL.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', '3-SET-CORAL-0425', 3500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/3-set-coral.jpg', '{/images/products/3-set-coral.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3d039cc2-1182-438e-8c38-95e73b7a22c0', 'FRESH FLOWER', 'fresh-flower', 'FRESH FLOWER.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'FRESH-FLOWER-0426', 5500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fresh-flower.jpg', '{/images/products/fresh-flower.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ab3270f1-eb3d-4e22-b31f-410110d605fb', 'GREEN GARDEN FLOWER', 'green-garden-flower', 'GREEN GARDEN FLOWER.', '797bd9df-45cc-4d6d-b6a5-3d3e287a945a', 'GREEN-GARDEN-FLOWER-0427', 4500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/green-garden-flower.jpg', '{/images/products/green-garden-flower.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('11f6921d-ba7d-4d50-a602-aac759bcc6fd', 'SOLID STRIPE TABLECLOTH', 'solid-stripe-tablecloth', 'SOLID STRIPE TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'SOLID-STRIPE-TABLECLOTH-0428', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/solid-stripe-tablecloth.jpg', '{/images/products/solid-stripe-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c8d6ad0d-8366-48c2-bfce-f4edf94460c0', 'BEETHOVEN TABLECLOTH', 'beethoven-tablecloth', 'BEETHOVEN TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'BEETHOVEN-TABLECLOTH-0429', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/beethoven-tablecloth.jpg', '{/images/products/beethoven-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('586d15ff-49c4-4797-955b-5043e42da67a', 'CHECKS TABLECLOTH', 'checks-tablecloth', 'CHECKS TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'CHECKS-TABLECLOTH-0430', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/checks-tablecloth.jpg', '{/images/products/checks-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ade75cf7-d56b-42de-8388-91cfa0c2926b', 'PLAID TABLECLOTH', 'plaid-tablecloth', 'PLAID TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'PLAID-TABLECLOTH-0431', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/plaid-tablecloth.jpg', '{/images/products/plaid-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4e5e5a8d-31c6-48ca-8eb2-5dc28ed93e76', 'AWNING STRIPE TABLECLOTH', 'awning-stripe-tablecloth', 'AWNING STRIPE TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'AWNING-STRIPE-TABLECLOTH-0432', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/awning-stripe-tablecloth.jpg', '{/images/products/awning-stripe-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dfd8577b-1d2c-45e8-90cf-dd31d84bbc62', 'VELVET TABLECLOTH', 'velvet-tablecloth', 'VELVET TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'VELVET-TABLECLOTH-0433', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, 'https://placehold.co/600x400?text=VELVET%20TABLECLOTH', '{https://placehold.co/600x400?text=VELVET%20TABLECLOTH}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2d3916a1-d63b-455c-83e4-eda41e4e35c8', 'RACE CAR TABLECLOTH', 'race-car-tablecloth', 'RACE CAR TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'RACE-CAR-TABLECLOTH-0434', 3300, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/race-car-tablecloth.jpg', '{/images/products/race-car-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bf3f5984-8be1-4bf4-9a61-c73dcf2126f3', 'SEQUINS TABLECLOTH', 'sequins-tablecloth', 'SEQUINS TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'SEQUINS-TABLECLOTH-0435', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/sequins-tablecloth.jpg', '{/images/products/sequins-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8091a040-3f8c-4807-b249-e422e652c572', 'Flower on Sequin Taffeta Tablecloth 120" Round - Blush/Rose Gold', 'flower-on-sequin-taffeta-tablecloth-120-round-blushrose-gold', 'Flower on Sequin Taffeta Tablecloth 120" Round - Blush/Rose Gold.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'FLOWER-ON-SEQUIN-TAFFETA-TABLECLOTH-120--0436', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/flower-on-sequin-taffeta-tablecloth-120-round-blush-rose-gold.jpg', '{/images/products/flower-on-sequin-taffeta-tablecloth-120-round-blush-rose-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ed898f37-bd6c-4d38-b96e-9932039941f6', 'Large Rosette Flower Tablecloth', 'large-rosette-flower-tablecloth', 'Large Rosette Flower Tablecloth.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'LARGE-ROSETTE-FLOWER-TABLECLOTH-0437', 5000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/large-rosette-flower-tablecloth.jpg', '{/images/products/large-rosette-flower-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dcfe29e9-8ead-4479-9608-cb6e2aa17ae3', 'ROUND PINTUCK TABLECLOTH', 'round-pintuck-tablecloth', 'Keep it classy with our elegant line of affordable pintuck tablecloths. Perfect for banquet events like weddings, Bar Mitzvahs, and Quinceaneras, a 108 in. Round Pintuck Tablecloth offers a smart, sophisticated look for any tablescape. Featuring intricately tucked rows of rich satin, our pintuck table linens are made from high quality, taffeta fabric,', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'ROUND-PINTUCK-TABLECLOTH-0438', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/round-pintuck-tablecloth.jpg', '{/images/products/round-pintuck-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('285df256-788c-4610-85ed-4744f7756d70', 'ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT', 'round-payette-sequin-tablecloth-iridescent', 'ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'ROUND-PAYETTE-SEQUIN-TABLECLOTH-IRIDESCE-0439', 4000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/round-payette-sequin-tablecloth-iridescent.jpg', '{/images/products/round-payette-sequin-tablecloth-iridescent.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('602c5299-41c2-4450-90e6-22e523d2e11a', '1.	RECTANGULAR POLYESTER TABLECLOTH IN DIFFERENT COLOR', '1-rectangular-polyester-tablecloth-in-different-color', 'A dual-duty banquet tablecloth, this linen fits 6 ft. and 8 ft. long tables. Besides the affordable price tag, our polyester material is the toughest fabric we''ve got. Rectangular tables are perfect for conserving precious floor space at banquet venues and serving meals family-style', '075f52d8-e10b-420b-89a9-d8c58fddbd68', '1-RECTANGULAR-POLYESTER-TABLECLOTH-IN-DI-0440', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/1-rectangular-polyester-tablecloth-in-different-color.jpg', '{/images/products/1-rectangular-polyester-tablecloth-in-different-color.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('91bfecfa-2233-4784-a718-aa941db7235d', 'ROUND POLYESTER TABLECLOTH', 'round-polyester-tablecloth', 'round polyester tablecloths are our most popular table clothes. This Party Linen is perfect for a Wedding Reception, a Party, Banquets or any other Fine Event. It fits the most common 5 ft. (60in.) round tables with an elegant drop all the way to the floor. Besides the affordable price tag, our polyester material is the toughest fabric we''ve got. Round tables can be decorated with either round or square tablecloths, and are traditionally used at weddings because circles are symbolic of eternal unity. Our 120 in. Round Polyester Tablecloth features a serged hem, seamless design, and durable fabric quality ideal for withstanding high-volume banquet events and restaurants', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'ROUND-POLYESTER-TABLECLOTH-0441', 0, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/round-polyester-tablecloth.jpg', '{/images/products/round-polyester-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('92b1a0b1-0a9d-4bf5-97c9-ad766200ee9d', 'ROUND SILK EMBROIDERED POLYESTER TABLECLOTH', 'round-silk-embroidered-polyester-tablecloth', 'ROUND SILK EMBROIDERED POLYESTER TABLECLOTH.', '075f52d8-e10b-420b-89a9-d8c58fddbd68', 'ROUND-SILK-EMBROIDERED-POLYESTER-TABLECL-0442', 2500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/round-silk-embroidered-polyester-tablecloth.jpg', '{/images/products/round-silk-embroidered-polyester-tablecloth.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bd41a0b3-bc31-4422-baf2-6d8babab5327', 'Table Napkin (Burnt Orange)', 'table-napkin-burnt-orange', 'Table Napkin (Burnt Orange).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-BURNT-ORANGE-0443', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-burnt-orange.jpg', '{/images/products/table-napkin-burnt-orange.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c95cdee6-e3be-441f-a187-56ee5a1d88b8', 'Table Napkin (Emerald Green)', 'table-napkin-emerald-green', 'Table Napkin (Emerald Green).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-EMERALD-GREEN-0444', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-emerald-green.jpg', '{/images/products/table-napkin-emerald-green.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fe94ed23-530e-445f-bd64-9d6af07c13c1', 'Table Napkin (Aqua Blue)', 'table-napkin-aqua-blue', 'Table Napkin (Aqua Blue).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-AQUA-BLUE-0445', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-aqua-blue.jpg', '{/images/products/table-napkin-aqua-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4dc65db2-7047-41fe-8258-218617091506', 'Table Napkin (Lavender)', 'table-napkin-lavender', 'Table Napkin (Lavender).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-LAVENDER-0446', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-lavender.jpg', '{/images/products/table-napkin-lavender.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7e99b322-aeb4-4284-ac4c-2bf1cca44b30', 'Table Napkin (Medium Pink)', 'table-napkin-medium-pink', 'Table Napkin (Medium Pink).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-MEDIUM-PINK-0447', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-medium-pink.jpg', '{/images/products/table-napkin-medium-pink.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('abbb9959-506d-4349-9eec-32d823314c94', 'Table Napkin (Silver)', 'table-napkin-silver', 'Table Napkin (Silver).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-SILVER-0448', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-silver.jpg', '{/images/products/table-napkin-silver.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8661dfe6-29e3-47ff-8c53-b3384b0e0ba5', 'Table Napkin (Purple)', 'table-napkin-purple', 'Table Napkin (Purple).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-PURPLE-0449', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-purple.jpg', '{/images/products/table-napkin-purple.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fec63399-3c7a-4125-9239-e7d84ca515cf', 'Table Napkin (White)', 'table-napkin-white', 'Table Napkin (White).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-WHITE-0450', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-white.jpg', '{/images/products/table-napkin-white.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.843172+00', '2026-08-27 01:47:03.843172+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b2842e77-88aa-493c-b020-e17db556dc50', 'Table Napkin (Champagne)', 'table-napkin-champagne', 'Table Napkin (Champagne).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-CHAMPAGNE-0451', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-champagne.jpg', '{/images/products/table-napkin-champagne.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e513d0df-7332-425a-9da4-81e8cd15159b', 'Table Napkin (Coral)', 'table-napkin-coral', 'Table Napkin (Coral).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-CORAL-0452', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-coral.jpg', '{/images/products/table-napkin-coral.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a183b33e-3597-402a-a034-3666967492b3', 'Table Napkin (Magenta Violet)', 'table-napkin-magenta-violet', 'Table Napkin (Magenta Violet).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-MAGENTA-VIOLET-0453', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-magenta-violet.jpg', '{/images/products/table-napkin-magenta-violet.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ee2ebd74-0876-44cf-b9de-3cdf06eb9ede', 'Table Napkin (Pewter)', 'table-napkin-pewter', 'Table Napkin (Pewter).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-PEWTER-0454', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-pewter.jpg', '{/images/products/table-napkin-pewter.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('51455b69-bf27-4227-afbc-f88e8bd8dedd', 'Table Napkin (Gold Antique)', 'table-napkin-gold-antique', 'Table Napkin (Gold Antique).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-GOLD-ANTIQUE-0455', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-gold-antique.jpg', '{/images/products/table-napkin-gold-antique.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('882746f5-5b1d-4044-ae54-ee644d76f658', 'Table Napkin (Burgundy)', 'table-napkin-burgundy', 'Table Napkin (Burgundy).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-BURGUNDY-0456', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-burgundy.jpg', '{/images/products/table-napkin-burgundy.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d576420b-4b6c-4537-a1fc-86ff21524d00', 'Table Napkin (Chocolate Brown)', 'table-napkin-chocolate-brown', 'Table Napkin (Chocolate Brown).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-CHOCOLATE-BROWN-0457', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-chocolate-brown.jpg', '{/images/products/table-napkin-chocolate-brown.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('c4c0425a-2dc3-438e-b860-1bd0a235b723', 'Table Napkin (Apple Red)', 'table-napkin-apple-red', 'Table Napkin (Apple Red).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-APPLE-RED-0458', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-apple-red.jpg', '{/images/products/table-napkin-apple-red.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fc170ffd-6138-4096-8f0c-9a6b1f803951', 'Table Napkin (Black)', 'table-napkin-black', 'Table Napkin (Black).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-BLACK-0459', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-black.jpg', '{/images/products/table-napkin-black.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('89656f6c-7222-4f41-8ce5-4fd973916934', 'Table Napkin (Royal Blue)', 'table-napkin-royal-blue', 'Table Napkin (Royal Blue).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-ROYAL-BLUE-0460', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-royal-blue.jpg', '{/images/products/table-napkin-royal-blue.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('025cd4c6-f590-43e8-a35b-84f1b614271a', 'Table Napkin (Bright Gold)', 'table-napkin-bright-gold', 'Table Napkin (Bright Gold).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-BRIGHT-GOLD-0461', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-bright-gold.jpg', '{/images/products/table-napkin-bright-gold.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7e373907-384d-4ff7-86fa-8d6c45b5ac2b', 'Table Napkin (Kelly Green)', 'table-napkin-kelly-green', 'Table Napkin (Kelly Green).', '0cacdce0-79cf-4d00-ab20-a04ea8fe67a5', 'TABLE-NAPKIN-KELLY-GREEN-0462', 250, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/table-napkin-kelly-green.jpg', '{/images/products/table-napkin-kelly-green.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cad72a92-a285-4cd8-875b-581e6e6eee06', 'White lux table', 'white-lux-table', 'White lux table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'WHITE-LUX-TABLE-0463', 20000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-lux-table.jpg', '{/images/products/white-lux-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0387dd66-3672-4b0f-b218-18a150d50c19', 'BANQUET ROUND PARTY TABLES', 'banquet-round-party-tables', 'BANQUET ROUND PARTY TABLES.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'BANQUET-ROUND-PARTY-TABLES-0464', 1100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/banquet-round-party-tables.jpg', '{/images/products/banquet-round-party-tables.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('cf8b484b-0a5a-457a-94e9-7aa675b307a5', 'RECTANGULAR BANQUET TABLES', 'rectangular-banquet-tables', 'RECTANGULAR BANQUET TABLES.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'RECTANGULAR-BANQUET-TABLES-0465', 1100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rectangular-banquet-tables.jpg', '{/images/products/rectangular-banquet-tables.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('59c70295-7de2-4356-a0bc-cfb6bb32acaf', 'gold mirrior table', 'gold-mirrior-table', 'gold mirrior table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'GOLD-MIRRIOR-TABLE-0466', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-mirrior-table.jpg', '{/images/products/gold-mirrior-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('686c86c5-da3e-49fa-aa4e-860c1f720acf', 'Gold Serpentine table', 'gold-serpentine-table', 'Gold Serpentine table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'GOLD-SERPENTINE-TABLE-0467', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-serpentine-table.jpg', '{/images/products/gold-serpentine-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('31c6939e-1d19-4f17-a29f-6dd07243abd2', 'Vogue Triangular Table', 'vogue-triangular-table', 'Vogue Triangular Table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'VOGUE-TRIANGULAR-TABLE-0468', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/vogue-triangular-table.jpg', '{/images/products/vogue-triangular-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('95d22e54-d91c-4442-a70b-43947f609bf3', 'Fab Glass Table', 'fab-glass-table', 'Fab Glass Table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'FAB-GLASS-TABLE-0469', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fab-glass-table.jpg', '{/images/products/fab-glass-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('bb90f40b-984d-4a54-b01f-13e702e1d88a', 'Clear Rectangular Table', 'clear-rectangular-table', 'Clear Rectangular Table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'CLEAR-RECTANGULAR-TABLE-0470', 25000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/clear-rectangular-table.jpg', '{/images/products/clear-rectangular-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aebf96ec-2692-419f-9757-daa4b2b6d586', 'Olivia Rectangular Table', 'olivia-rectangular-table', 'Olivia Rectangular Table.', '18f26338-231e-4780-b22d-c472c6fb18c8', 'OLIVIA-RECTANGULAR-TABLE-0471', 35000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/olivia-rectangular-table.jpg', '{/images/products/olivia-rectangular-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('264f0f43-2aac-414e-8ffb-1b15dad11fd5', 'Pickup Security Deposit', 'pickup-security-deposit', 'Pickup Security Deposit.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'PICKUP-SECURITY-DEPOSIT-0472', 7500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/pickup-security-deposit.jpg', '{/images/products/pickup-security-deposit.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a24b8368-64b7-4747-8496-525fcd1b7f2f', 'Tent Installation', 'tent-installation', 'Tent Installation.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'TENT-INSTALLATION-0473', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/tent-installation.jpg', '{/images/products/tent-installation.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('93c8386f-2a92-449b-a348-d2c781e5daf0', 'Instillation', 'instillation', 'Instillation.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'INSTILLATION-0474', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/instillation.jpg', '{/images/products/instillation.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1b6d1a12-cafd-46d1-b283-3debb29b797f', 'White Bounce House  - 3in1  bouncey House for Kids', 'white-bounce-house-3in1-bouncey-house-for-kids', 'White Bounce House  - 3in1  bouncey House for Kids.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'WHITE-BOUNCE-HOUSE-3IN1-BOUNCEY-HOUSE-FO-0475', 37500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-bounce-house-3in1-bouncey-house-for-kids.jpg', '{/images/products/white-bounce-house-3in1-bouncey-house-for-kids.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('09fdbe5c-2434-4ced-88f9-2b182e65d72f', 'OUTDOOR SETTINGS #1', 'outdoor-settings-1', 'OUTDOOR SETTINGS #1.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'OUTDOOR-SETTINGS-1-0476', 86100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/outdoor-settings-1.jpg', '{/images/products/outdoor-settings-1.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a6eb1e54-797f-4fad-bb0b-a390521c8e0c', 'OUTDOOR SETTINGS #2', 'outdoor-settings-2', 'OUTDOOR SETTINGS #2.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'OUTDOOR-SETTINGS-2-0477', 121000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/outdoor-settings-2.jpg', '{/images/products/outdoor-settings-2.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7a05378c-f90c-4714-a94f-eb67de0a6119', 'LED CABANA', 'led-cabana', 'LED CABANA.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'LED-CABANA-0478', 71500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/led-cabana.jpg', '{/images/products/led-cabana.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aba8daf4-3705-4efd-a7d8-61b3f1991bdc', 'SINGLE CABANA W/SOFA & TABLE', 'single-cabana-wsofa-table', 'SINGLE CABANA W/SOFA & TABLE.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'SINGLE-CABANA-WSOFA-TABLE-0479', 65000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/single-cabana-w-sofa-table.jpg', '{/images/products/single-cabana-w-sofa-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('dfadb91b-29fc-46a0-9c04-89d498c588ca', '10X10 TENT', '10x10-tent', '10X10 TENT.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', '10X10-TENT-0480', 15000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/10x10-tent.jpg', '{/images/products/10x10-tent.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d9fd96c1-476e-4e6f-bc8f-9eb7d8f207ac', '20X30 TENT', '20x30-tent', '20X30 TENT.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', '20X30-TENT-0481', 67500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/20x30-tent.jpg', '{/images/products/20x30-tent.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d5d0f334-16aa-43ca-a55b-5808aa0ec135', 'OUTDOOR PACKAGE #4', 'outdoor-package-4', 'OUTDOOR PACKAGE #4.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'OUTDOOR-PACKAGE-4-0482', 168150, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/outdoor-package-4.jpg', '{/images/products/outdoor-package-4.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('35fa45cf-f873-4cbc-b6b0-4be1a5d625f9', 'OUTDOOR PACKAGE #3', 'outdoor-package-3', 'OUTDOOR PACKAGE #3.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'OUTDOOR-PACKAGE-3-0483', 114500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/outdoor-package-3.jpg', '{/images/products/outdoor-package-3.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fdad86f9-eb14-4ec9-b922-807834d5325e', 'OUTDOOR PACKAGE #2', 'outdoor-package-2', 'OUTDOOR PACKAGE #2.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'OUTDOOR-PACKAGE-2-0484', 129350, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/outdoor-package-2.jpg', '{/images/products/outdoor-package-2.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('85c77053-5467-406e-8ca4-232deaadcf69', 'OUTDOOR PACKAGE #1', 'outdoor-package-1', 'OUTDOOR PACKAGE #1.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'OUTDOOR-PACKAGE-1-0485', 99000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/outdoor-package-1.jpg', '{/images/products/outdoor-package-1.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('aa0e97b4-af78-4b25-badd-b245efaff36d', 'Fringe Umbrella', 'fringe-umbrella', 'Fringe Umbrella.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'FRINGE-UMBRELLA-0486', 12500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/fringe-umbrella.jpg', '{/images/products/fringe-umbrella.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b3dac527-126e-453e-b048-2b46ce605a03', 'Market Umbrella', 'market-umbrella', 'Market Umbrella.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', 'MARKET-UMBRELLA-0487', 5500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/market-umbrella.jpg', '{/images/products/market-umbrella.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('87c4ee5c-24e8-4328-abbf-d134d2d1a83e', '20x 40 Tent', '20x-40-tent', '20x 40 Tent.', '670743ae-daa2-4af6-a90f-1f030ac4e7e8', '20X-40-TENT-0488', 87500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/20x-40-tent.jpg', '{/images/products/20x-40-tent.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('f8df127a-817e-4929-88b2-0f2cb5825403', 'White Dessert Plate', 'white-dessert-plate', 'White Dessert Plate.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'WHITE-DESSERT-PLATE-0490', 105, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-dessert-plate.jpg', '{/images/products/white-dessert-plate.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('d7302698-3c36-424f-9332-4b09a2ee14a7', 'Blanc  Wine Glass', 'blanc-wine-glass', 'Blanc  Wine Glass.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'BLANC-WINE-GLASS-0491', 135, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/blanc-wine-glass.jpg', '{/images/products/blanc-wine-glass.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('1994dd83-a297-42f5-8db6-09744f6e0b64', 'Rocks / Old Fashioned Glass', 'rocks-old-fashioned-glass', 'Rocks / Old Fashioned Glass.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'ROCKS-OLD-FASHIONED-GLASS-0492', 135, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/rocks-old-fashioned-glass.jpg', '{/images/products/rocks-old-fashioned-glass.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('55024e10-a6ff-4fe6-9177-1def3e8bf51e', 'Champagne Flute 6.25oz', 'champagne-flute-625oz', 'Champagne Flute 6.25oz.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'CHAMPAGNE-FLUTE-625OZ-0493', 125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/champagne-flute-6-25oz.jpg', '{/images/products/champagne-flute-6-25oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('7a80223b-2005-4cf4-8718-2d1abbc9471d', 'Modern luxury Matte Gold Silverware', 'modern-luxury-matte-gold-silverware', 'Modern luxury Matte Gold Silverware.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'MODERN-LUXURY-MATTE-GOLD-SILVERWARE-0494', 195, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/modern-luxury-matte-gold-silverware.jpg', '{/images/products/modern-luxury-matte-gold-silverware.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('93273328-8742-48fe-8722-67abdcf1b970', 'Stoneware Mug 12oz', 'stoneware-mug-12oz', 'Stoneware Mug 12oz.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'STONEWARE-MUG-12OZ-0495', 99, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stoneware-mug-12oz.jpg', '{/images/products/stoneware-mug-12oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b28a92e1-8b62-4da7-9293-13afbf3851b9', 'Stemless Glass 20.5oz', 'stemless-glass-205oz', 'Stemless Glass 20.5oz.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'STEMLESS-GLASS-205OZ-0496', 135, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stemless-glass-20-5oz.jpg', '{/images/products/stemless-glass-20-5oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4ac0a738-8af7-4b8f-b558-ae4a343d6677', 'Stainless Steel Steak Knives', 'stainless-steel-steak-knives', 'Stainless Steel Steak Knives.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'STAINLESS-STEEL-STEAK-KNIVES-0497', 99, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stainless-steel-steak-knives.jpg', '{/images/products/stainless-steel-steak-knives.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3319cb8d-b982-4aaf-8cda-c0db81806559', 'The Drop  Flatware Stainless Steel Silverware', 'the-drop-flatware-stainless-steel-silverware', 'The Drop  Flatware Stainless Steel Silverware.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'THE-DROP-FLATWARE-STAINLESS-STEEL-SILVER-0498', 105, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-drop-flatware-stainless-steel-silverware.jpg', '{/images/products/the-drop-flatware-stainless-steel-silverware.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('ad721538-4e7e-4be9-82de-127e64da9c04', 'Bentley stainless steel spoon', 'bentley-stainless-steel-spoon', 'Bentley stainless steel spoon.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'BENTLEY-STAINLESS-STEEL-SPOON-0499', 95, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/bentley-stainless-steel-spoon.jpg', '{/images/products/bentley-stainless-steel-spoon.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('0508ed69-aa2a-4fb1-a409-59f489e6c00e', 'White Plate 7.5 in', 'white-plate-75-in', 'White Plate 7.5 in.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'WHITE-PLATE-75-IN-0500', 99, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-plate-7-5-in.jpg', '{/images/products/white-plate-7-5-in.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:03.976999+00', '2026-08-27 01:47:03.976999+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('19d90b2c-6062-4e3b-82ca-370b3a8d99bf', 'White Dinner Plate 10.5 in', 'white-dinner-plate-105-in', 'White Dinner Plate 10.5 in.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'WHITE-DINNER-PLATE-105-IN-0501', 105, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-dinner-plate-10-5-in.jpg', '{/images/products/white-dinner-plate-10-5-in.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('90b350c9-7107-45e0-b257-8e7f041bd7a0', 'Classic Black Plate 10.5 in', 'classic-black-plate-105-in', 'Classic Black Plate 10.5 in.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'CLASSIC-BLACK-PLATE-105-IN-0502', 105, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/classic-black-plate-10-5-in.jpg', '{/images/products/classic-black-plate-10-5-in.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('133734c3-6835-490a-ae63-0503b7f7d513', 'Classic Black Plate 7.5 in', 'classic-black-plate-75-in', 'Classic Black Plate 7.5 in.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'CLASSIC-BLACK-PLATE-75-IN-0503', 99, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/classic-black-plate-7-5-in.jpg', '{/images/products/classic-black-plate-7-5-in.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b6be8cde-dc28-4886-a79b-06b2d20052c6', 'White serving Coupe Bone China Plate', 'white-serving-coupe-bone-china-plate', 'White serving Coupe Bone China Plate.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'WHITE-SERVING-COUPE-BONE-CHINA-PLATE-0504', 95, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/white-serving-coupe-bone-china-plate.jpg', '{/images/products/white-serving-coupe-bone-china-plate.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('876ff606-1bd4-460d-875b-2e398dbfbaec', 'Gold Rim Dinner Plates 10.5 in', 'gold-rim-dinner-plates-105-in', 'Gold Rim Dinner Plates 10.5 in.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'GOLD-RIM-DINNER-PLATES-105-IN-0505', 125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-rim-dinner-plates-10-5-in.jpg', '{/images/products/gold-rim-dinner-plates-10-5-in.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('8090033f-ef2a-40c1-9c54-0634212108ee', 'Glass Pint Jar 16oz', 'glass-pint-jar-16oz', 'Glass Pint Jar 16oz.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'GLASS-PINT-JAR-16OZ-0506', 125, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/glass-pint-jar-16oz.jpg', '{/images/products/glass-pint-jar-16oz.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('fdf34e7f-3fc2-4bcb-a479-0025368cfef9', 'Glass Carafe 1 liter', 'glass-carafe-1-liter', 'Glass Carafe 1 liter.', 'a7d7c19f-5919-4548-8d7a-1b09ba8fa4da', 'GLASS-CARAFE-1-LITER-0507', 600, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/glass-carafe-1-liter.jpg', '{/images/products/glass-carafe-1-liter.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('02bbe537-1d27-46ea-9486-314eaf3b9299', 'Gold Fancy Chargers', 'gold-fancy-chargers', 'Gold Fancy Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'GOLD-FANCY-CHARGERS-0508', 199, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-fancy-chargers.jpg', '{/images/products/gold-fancy-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('e4e78907-a196-4ecd-b388-d911c95bd53d', 'Metallic Silver Charger', 'metallic-silver-charger', 'Metallic Silver Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'METALLIC-SILVER-CHARGER-0509', 199, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/metallic-silver-charger.jpg', '{/images/products/metallic-silver-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('49f4eefe-38e9-499e-ae70-7038ffa6483f', 'Acrylic Reef Silver Charger', 'acrylic-reef-silver-charger', 'Acrylic Reef Silver Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ACRYLIC-REEF-SILVER-CHARGER-0510', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-reef-silver-charger.jpg', '{/images/products/acrylic-reef-silver-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('4f2f88db-db0e-40b8-a0ec-f6d7275608a5', 'Acrylic Reef Black Charger', 'acrylic-reef-black-charger', 'Acrylic Reef Black Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ACRYLIC-REEF-BLACK-CHARGER-0511', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-reef-black-charger.jpg', '{/images/products/acrylic-reef-black-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2bf34a1a-447b-498c-95e6-7c5c16db226d', 'Acrylic Reef Dusty Rose Charger', 'acrylic-reef-dusty-rose-charger', 'Acrylic Reef Dusty Rose Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ACRYLIC-REEF-DUSTY-ROSE-CHARGER-0512', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-reef-dusty-rose-charger.jpg', '{/images/products/acrylic-reef-dusty-rose-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('236e8467-c8e6-48b5-99b1-da14b807ed93', 'Acrylic Reef Pink Charger', 'acrylic-reef-pink-charger', 'Acrylic Reef Pink Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ACRYLIC-REEF-PINK-CHARGER-0513', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/acrylic-reef-pink-charger.jpg', '{/images/products/acrylic-reef-pink-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5484d5ff-8b2e-49f0-bafe-47f77e11995a', 'Silverware Chargers', 'silverware-chargers', 'Silverware Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'SILVERWARE-CHARGERS-0514', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/silverware-chargers.jpg', '{/images/products/silverware-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('99253826-30bc-429b-8d32-1995009a2735', 'Accent Silver Chargers', 'accent-silver-chargers', 'Accent Silver Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ACCENT-SILVER-CHARGERS-0515', 399, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/accent-silver-chargers.jpg', '{/images/products/accent-silver-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('5f5784d7-c7b3-4812-9d10-1bbf3328fa72', 'Gold and Black Ruffle Chargers', 'gold-and-black-ruffle-chargers', 'Gold and Black Ruffle Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'GOLD-AND-BLACK-RUFFLE-CHARGERS-0516', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-and-black-ruffle-chargers.jpg', '{/images/products/gold-and-black-ruffle-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('079ebe57-380d-4ce1-b643-535d966984f8', 'Blue Ruffle Chargers', 'blue-ruffle-chargers', 'Blue Ruffle Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'BLUE-RUFFLE-CHARGERS-0517', 299, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/blue-ruffle-chargers.jpg', '{/images/products/blue-ruffle-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('834008d5-9e79-46c2-9fad-a2bc0d467a97', 'Accent Black Chargers', 'accent-black-chargers', 'Accent Black Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ACCENT-BLACK-CHARGERS-0518', 399, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/accent-black-chargers.jpg', '{/images/products/accent-black-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('b1869cc4-093a-4175-9cb4-54f9bb0f0416', 'Stone Tone Chargers', 'stone-tone-chargers', 'Stone Tone Chargers.', '66b21615-e23f-439b-8706-c3d0243f697f', 'STONE-TONE-CHARGERS-0519', 100, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/stone-tone-chargers.jpg', '{/images/products/stone-tone-chargers.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2add1203-0f53-48d4-b751-0ced685824ea', 'Gold Glass Charger', 'gold-glass-charger', 'Gold Glass Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'GOLD-GLASS-CHARGER-0520', 600, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/gold-glass-charger.jpg', '{/images/products/gold-glass-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('3ce31a36-ce14-4a07-aeff-623226df4a5b', 'Lux Gold Charger', 'lux-gold-charger', 'Lux Gold Charger.', '66b21615-e23f-439b-8706-c3d0243f697f', 'LUX-GOLD-CHARGER-0521', 650, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/lux-gold-charger.jpg', '{/images/products/lux-gold-charger.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('061a1dcb-db84-4269-990a-9a936042562e', 'The Mint Haven Display 🌿', 'the-mint-haven-display', 'The Mint Haven Display 🌿.', '66b21615-e23f-439b-8706-c3d0243f697f', 'THE-MINT-HAVEN-DISPLAY-0522', 22500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/the-mint-haven-display.jpg', '{/images/products/the-mint-haven-display.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('70688b34-f06a-4278-b923-90c8043bd981', 'Crystal Glow Table', 'crystal-glow-table', 'Crystal Glow Table.', '66b21615-e23f-439b-8706-c3d0243f697f', 'CRYSTAL-GLOW-TABLE-0523', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/crystal-glow-table.jpg', '{/images/products/crystal-glow-table.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('a7d696f2-74ed-4d0a-9eca-70f641f1dce9', 'Cloud Stage', 'cloud-stage', 'Cloud Stage.', '66b21615-e23f-439b-8706-c3d0243f697f', 'CLOUD-STAGE-0524', 65000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/cloud-stage.jpg', '{/images/products/cloud-stage.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('9dd3fc02-ba42-41a5-8c06-244d4762e106', 'Aurora Stage', 'aurora-stage', 'Aurora Stage.', '66b21615-e23f-439b-8706-c3d0243f697f', 'AURORA-STAGE-0525', 65000, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/aurora-stage.jpg', '{/images/products/aurora-stage.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);
INSERT INTO public.products (id, name, slug, description, category_id, sku, price_cents, cost_cents, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, requires_special_handling, minimum_rental_period, image_url, gallery_images, specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved) VALUES ('2ac28bf3-a6fb-4a3c-ae8d-a4f5ce51744d', 'Angel wings', 'angel-wings', 'Angel wings.', '66b21615-e23f-439b-8706-c3d0243f697f', 'ANGEL-WINGS-0526', 27500, NULL, NULL, NULL, NULL, NULL, NULL, false, 1, '/images/products/angel-wings.jpg', '{/images/products/angel-wings.jpg}', '{"source": "primeluxevents-scrape-v2", "quantity_available": 10}', true, '2026-08-27 01:47:04.096402+00', '2026-08-27 01:47:04.096402+00', 1, 0);


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.promo_codes (id, code, description, discount_type, discount_value_cents, minimum_order_amount_cents, max_uses, used_count, valid_from, valid_until, is_active, created_at) VALUES ('7c4d7805-3129-4ffc-ab61-d4e4566a86a7', 'WELCOME10', 'Welcome discount for new customers', 'percentage', 1000, 50000, 100, 0, '2025-08-26', '2026-08-26', true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.promo_codes (id, code, description, discount_type, discount_value_cents, minimum_order_amount_cents, max_uses, used_count, valid_from, valid_until, is_active, created_at) VALUES ('267e2bb9-bcca-41eb-b8fb-f3d64259affd', 'LUXURY15', 'Luxury event discount', 'percentage', 1500, 100000, 50, 0, '2025-08-26', '2026-02-26', true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.promo_codes (id, code, description, discount_type, discount_value_cents, minimum_order_amount_cents, max_uses, used_count, valid_from, valid_until, is_active, created_at) VALUES ('58ac59ee-f15f-455b-b3d4-da3b2bdce95d', 'SPRING20', 'Spring celebration discount', 'percentage', 2000, 75000, 75, 0, '2025-08-26', '2025-11-26', true, '2025-08-26 05:35:50.464441+00');
INSERT INTO public.promo_codes (id, code, description, discount_type, discount_value_cents, minimum_order_amount_cents, max_uses, used_count, valid_from, valid_until, is_active, created_at) VALUES ('725be0bd-7fbf-415a-bb67-647e042c7511', 'FIRSTTIME', 'First time customer discount', 'percentage', 2500, 80000, 200, 0, '2025-08-26', '2026-08-26', true, '2025-08-26 05:35:50.464441+00');


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_permissions (id, role_id, permission_id, created_at) VALUES ('d54042e7-311c-40b3-a5a2-7e63d68651e3', '71ac0aaa-4571-4a74-a50b-b7f1fc89139d', '813c83c6-947d-43dd-a13e-43b988d9ff0a', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.role_permissions (id, role_id, permission_id, created_at) VALUES ('816f8425-e324-42ee-b055-e7540613fa49', '71ac0aaa-4571-4a74-a50b-b7f1fc89139d', '5a700f3b-57f8-4dc0-b1cc-055e05710dc9', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.role_permissions (id, role_id, permission_id, created_at) VALUES ('7ce165de-ef65-4dad-b7ed-b6502d299ac6', '71ac0aaa-4571-4a74-a50b-b7f1fc89139d', '064111c0-d1b2-497f-9684-379153909ec9', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.role_permissions (id, role_id, permission_id, created_at) VALUES ('d2e8844f-1af5-40d9-8840-31cb468f7b55', '71ac0aaa-4571-4a74-a50b-b7f1fc89139d', 'b94282a1-02b4-4253-9a38-e26b0978be04', '2026-08-27 03:50:30.841799+00');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles (id, name, display_name, description, color, is_system_role, created_at, updated_at) VALUES ('71ac0aaa-4571-4a74-a50b-b7f1fc89139d', 'admin', 'Administrator', 'Full system access with all permissions', '#ef4444', true, '2026-08-27 03:50:30.841799+00', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.roles (id, name, display_name, description, color, is_system_role, created_at, updated_at) VALUES ('82904350-d833-43d0-83f7-70cf7a1065dc', 'manager', 'Manager', 'Manage operations and team', '#f59e0b', true, '2026-08-27 03:50:30.841799+00', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.roles (id, name, display_name, description, color, is_system_role, created_at, updated_at) VALUES ('3f658b8f-1e6c-46f0-88bf-35b093c837d4', 'staff', 'Staff', 'Day-to-day warehouse and logistics access', '#3b82f6', true, '2026-08-27 03:50:30.841799+00', '2026-08-27 03:50:30.841799+00');
INSERT INTO public.roles (id, name, display_name, description, color, is_system_role, created_at, updated_at) VALUES ('d68d8581-4968-4378-b277-19edf6deb2fa', 'partner', 'Preferred Partner', 'Event planner or decorator in the Preferred Vendor program', '#a67c52', true, '2026-08-27 19:41:52.991858+00', '2026-08-27 19:41:52.991858+00');


--
-- Data for Name: staff_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('283cb16c-357e-4e8a-8111-8ce4db3b0d49', '26732726-49c0-4ea8-bded-6eee81b472f5', 'ADMIN_ACCESS', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('4cf74b7a-0f54-4150-882d-85a1d353f23a', '26732726-49c0-4ea8-bded-6eee81b472f5', 'STAFF_MANAGE', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('63d4aa08-89d7-4ca2-a209-8f5dd1ad92ed', '26732726-49c0-4ea8-bded-6eee81b472f5', 'ORDERS_MANAGE', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('bf1c20ce-2302-44a1-b47a-b6c0f2d853f1', '9e9865af-0fa5-4a70-b714-4271f3828b83', 'ORDERS_VIEW', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('4a4d734c-fb83-429c-ae01-88aea3c0d802', '9e9865af-0fa5-4a70-b714-4271f3828b83', 'INVENTORY_VIEW', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('a11638cd-baee-459e-918e-72d006edde04', '9e9865af-0fa5-4a70-b714-4271f3828b83', 'STAFF_VIEW', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('9616ffa3-0f2f-4d75-8ff7-7c2c633287a1', '4de37633-e067-46af-9afb-7c970b2904b4', 'ORDERS_VIEW', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('f41df959-b29d-44d6-b57b-e78722055824', '4de37633-e067-46af-9afb-7c970b2904b4', 'INVENTORY_VIEW', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('527d2ac1-d035-4760-ba16-fff3a9c5b13a', '10c5153b-0c21-4aa8-ba16-5ad434292a15', 'ORDERS_VIEW', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('410c6b72-bc19-42bf-86c0-6f95f67aa35e', 'ccfb3f86-c989-4fa1-9a38-f2b1d6ffa4b0', 'DESIGN_ACCESS', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.staff_permissions (id, user_id, permission_key, granted_by, granted_at) VALUES ('5747d75d-3ca0-4189-852f-7a2c6db17005', '66da8e32-769c-46ac-b75b-eab744810d28', 'EVENTS_MANAGE', '26732726-49c0-4ea8-bded-6eee81b472f5', '2025-08-26 05:35:50.464441+00');


--
-- Data for Name: staff_shifts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: team_invitations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tour_progress; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_addresses (id, user_id, address_line_1, address_line_2, city, state, zip_code, country, is_primary, created_at, updated_at) VALUES ('e68ff294-8cf8-47ba-9759-74f4d7c791b7', '56d27700-160f-4cb1-b0b7-81ddc96bf842', '123 Admin Street', NULL, 'Shelton', 'CT', '06484', 'United States', true, '2025-09-24 21:21:17.846324+00', '2025-09-24 21:21:17.846324+00');


--
-- Data for Name: user_favorites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_profiles (id, email, full_name, avatar_url, phone, job_title, department, hire_date, is_active, last_login_at, created_at, updated_at) VALUES ('4658683e-0250-470e-8015-b01d04a5304e', 'admin@admin.com', 'System Administrator', NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-08-27 03:50:30.841799+00', '2026-08-27 03:50:30.841799+00');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_roles (id, user_id, role_id, assigned_by, assigned_at) VALUES ('e477591c-55f0-4012-9783-e692de761217', '4658683e-0250-470e-8015-b01d04a5304e', '71ac0aaa-4571-4a74-a50b-b7f1fc89139d', NULL, '2026-08-27 03:50:30.841799+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('26732726-49c0-4ea8-bded-6eee81b472f5', 'admin@primeluxevents.com', '$2b$10$example_hash', 'Alex', 'Johnson', NULL, 'admin', 'Management', true, false, false, NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('9e9865af-0fa5-4a70-b714-4271f3828b83', 'manager@primeluxevents.com', '$2b$10$example_hash', 'Sarah', 'Williams', NULL, 'manager', 'Operations', true, false, false, NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('4de37633-e067-46af-9afb-7c970b2904b4', 'staff1@primeluxevents.com', '$2b$10$example_hash', 'Michael', 'Brown', NULL, 'staff', 'Setup', true, false, false, NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('10c5153b-0c21-4aa8-ba16-5ad434292a15', 'staff2@primeluxevents.com', '$2b$10$example_hash', 'Emily', 'Davis', NULL, 'staff', 'Delivery', true, false, false, NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('ccfb3f86-c989-4fa1-9a38-f2b1d6ffa4b0', 'designer@primeluxevents.com', '$2b$10$example_hash', 'David', 'Miller', NULL, 'designer', 'Design', true, false, false, NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('66da8e32-769c-46ac-b75b-eab744810d28', 'coordinator@primeluxevents.com', '$2b$10$example_hash', 'Jessica', 'Wilson', NULL, 'coordinator', 'Events', true, false, false, NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, department, is_active, email_verified, two_factor_enabled, two_factor_secret, last_login, created_at, updated_at) VALUES ('56d27700-160f-4cb1-b0b7-81ddc96bf842', 'superadmin@primeluxevents.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', 'Super', 'Administrator', NULL, 'super_admin', 'Administration', true, true, false, NULL, NULL, '2025-09-24 21:21:17.846324+00', '2025-09-24 21:21:17.846324+00');


--
-- Data for Name: venue_bookings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.venues (id, name, description, address_line_1, address_line_2, city, state, zip_code, capacity_min, capacity_max, base_price_cents, hourly_rate_cents, amenities, images, floor_plan_url, is_active, created_at) VALUES ('3ec5f4d5-5199-4403-b61d-6e1c2ea61fb2', 'Prime Lux Event Hall', 'Connecticut''s premier luxury indoor event venue featuring elegant glassmorphism design, climate control, and state-of-the-art amenities. Perfect for weddings, corporate events, and milestone celebrations.', '500 Prime Lux Drive', NULL, 'Shelton', 'CT', '06484', 50, 300, 250000, 20000, '{"Climate Control","Professional Sound System","LED Lighting","Bridal Suite","Catering Kitchen","Ample Parking","Wheelchair Accessible",WiFi,"A/V Equipment"}', '{venue-main.jpg,venue-interior.jpg,venue-reception.jpg,venue-ceremony.jpg}', NULL, true, '2025-08-26 05:35:50.464441+00');


--
-- Data for Name: warehouse_task_templates; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: work_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.work_schedules (id, staff_id, schedule_date, start_time, end_time, schedule_type, status, location, notes, created_by, created_at, updated_at) VALUES ('3f19217e-ddde-4f46-b664-b8dc8df58869', '4de37633-e067-46af-9afb-7c970b2904b4', '2025-08-27', '08:00:00', '17:00:00', 'setup', 'scheduled', 'Main Warehouse', NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.work_schedules (id, staff_id, schedule_date, start_time, end_time, schedule_type, status, location, notes, created_by, created_at, updated_at) VALUES ('513a8d69-59ec-4e6f-aaee-0379e78aacab', '10c5153b-0c21-4aa8-ba16-5ad434292a15', '2025-08-27', '09:00:00', '18:00:00', 'delivery', 'scheduled', 'Customer Location', NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.work_schedules (id, staff_id, schedule_date, start_time, end_time, schedule_type, status, location, notes, created_by, created_at, updated_at) VALUES ('e4357c67-05b1-4fa7-83b4-72ffa3b2aec4', '4de37633-e067-46af-9afb-7c970b2904b4', '2025-08-28', '08:00:00', '17:00:00', 'setup', 'scheduled', 'Main Warehouse', NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');
INSERT INTO public.work_schedules (id, staff_id, schedule_date, start_time, end_time, schedule_type, status, location, notes, created_by, created_at, updated_at) VALUES ('f4d0684b-4572-4ea6-8978-37f844f5cc35', '10c5153b-0c21-4aa8-ba16-5ad434292a15', '2025-08-28', '09:00:00', '18:00:00', 'delivery', 'scheduled', 'Customer Location', NULL, NULL, '2025-08-26 05:35:50.464441+00', '2025-08-26 05:35:50.464441+00');


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: content content_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_key_key UNIQUE (key);


--
-- Name: content content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content
    ADD CONSTRAINT content_pkey PRIMARY KEY (id);


--
-- Name: delivery_notifications delivery_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notifications
    ADD CONSTRAINT delivery_notifications_pkey PRIMARY KEY (id);


--
-- Name: delivery_routes delivery_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_routes
    ADD CONSTRAINT delivery_routes_pkey PRIMARY KEY (id);


--
-- Name: delivery_schedule_orders delivery_schedule_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_schedule_orders
    ADD CONSTRAINT delivery_schedule_orders_pkey PRIMARY KEY (id);


--
-- Name: delivery_schedules delivery_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_schedules
    ADD CONSTRAINT delivery_schedules_pkey PRIMARY KEY (id);


--
-- Name: delivery_tracking delivery_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tracking
    ADD CONSTRAINT delivery_tracking_pkey PRIMARY KEY (id);


--
-- Name: driver_locations driver_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_pkey PRIMARY KEY (id);


--
-- Name: email_notifications email_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_serial_number_key UNIQUE (serial_number);


--
-- Name: maintenance_checklists maintenance_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_checklists
    ADD CONSTRAINT maintenance_checklists_pkey PRIMARY KEY (id);


--
-- Name: maintenance_records maintenance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_promo_codes order_promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_promo_codes
    ADD CONSTRAINT order_promo_codes_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: partner_profiles partner_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_profiles
    ADD CONSTRAINT partner_profiles_pkey PRIMARY KEY (id);


--
-- Name: partner_profiles partner_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_profiles
    ADD CONSTRAINT partner_profiles_user_id_key UNIQUE (user_id);


--
-- Name: partner_shared_carts partner_shared_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shared_carts
    ADD CONSTRAINT partner_shared_carts_pkey PRIMARY KEY (id);


--
-- Name: partner_shared_carts partner_shared_carts_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shared_carts
    ADD CONSTRAINT partner_shared_carts_share_token_key UNIQUE (share_token);


--
-- Name: partner_tier_settings partner_tier_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_tier_settings
    ADD CONSTRAINT partner_tier_settings_pkey PRIMARY KEY (tier);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pick_list_items pick_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_list_items
    ADD CONSTRAINT pick_list_items_pkey PRIMARY KEY (id);


--
-- Name: pick_lists pick_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_lists
    ADD CONSTRAINT pick_lists_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: promo_codes promo_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_code_key UNIQUE (code);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: staff_permissions staff_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_permissions
    ADD CONSTRAINT staff_permissions_pkey PRIMARY KEY (id);


--
-- Name: staff_permissions staff_permissions_user_id_permission_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_permissions
    ADD CONSTRAINT staff_permissions_user_id_permission_key_key UNIQUE (user_id, permission_key);


--
-- Name: staff_shifts staff_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_shifts
    ADD CONSTRAINT staff_shifts_pkey PRIMARY KEY (id);


--
-- Name: staff_shifts staff_shifts_user_id_shift_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_shifts
    ADD CONSTRAINT staff_shifts_user_id_shift_date_key UNIQUE (user_id, shift_date);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invitation_token_key UNIQUE (invitation_token);


--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);


--
-- Name: tour_progress tour_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_progress
    ADD CONSTRAINT tour_progress_pkey PRIMARY KEY (id);


--
-- Name: tour_progress tour_progress_user_id_tour_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_progress
    ADD CONSTRAINT tour_progress_user_id_tour_type_key UNIQUE (user_id, tour_type);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (id);


--
-- Name: user_favorites user_favorites_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: venue_bookings venue_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venue_bookings
    ADD CONSTRAINT venue_bookings_pkey PRIMARY KEY (id);


--
-- Name: venue_bookings venue_bookings_venue_id_event_date_start_time_end_time_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venue_bookings
    ADD CONSTRAINT venue_bookings_venue_id_event_date_start_time_end_time_key UNIQUE (venue_id, event_date, start_time, end_time);


--
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);


--
-- Name: warehouse_task_templates warehouse_task_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_task_templates
    ADD CONSTRAINT warehouse_task_templates_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: work_schedules work_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_schedules
    ADD CONSTRAINT work_schedules_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_delivery_notifications_tracking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_notifications_tracking_id ON public.delivery_notifications USING btree (delivery_tracking_id);


--
-- Name: idx_delivery_schedules_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_schedules_date ON public.delivery_schedules USING btree (schedule_date);


--
-- Name: idx_delivery_schedules_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_schedules_status ON public.delivery_schedules USING btree (status);


--
-- Name: idx_delivery_tracking_driver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tracking_driver_id ON public.delivery_tracking USING btree (driver_id);


--
-- Name: idx_delivery_tracking_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tracking_order_id ON public.delivery_tracking USING btree (order_id);


--
-- Name: idx_delivery_tracking_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delivery_tracking_status ON public.delivery_tracking USING btree (status);


--
-- Name: idx_driver_locations_driver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_driver_locations_driver_id ON public.driver_locations USING btree (driver_id);


--
-- Name: idx_driver_locations_recorded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_driver_locations_recorded_at ON public.driver_locations USING btree (recorded_at);


--
-- Name: idx_inventory_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_product_id ON public.inventory USING btree (product_id);


--
-- Name: idx_inventory_reservations_inventory_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_reservations_inventory_id ON public.inventory_reservations USING btree (inventory_id);


--
-- Name: idx_inventory_reservations_order_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_reservations_order_item_id ON public.inventory_reservations USING btree (order_item_id);


--
-- Name: idx_inventory_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_status ON public.inventory USING btree (status);


--
-- Name: idx_maintenance_records_inventory_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maintenance_records_inventory_id ON public.maintenance_records USING btree (inventory_id);


--
-- Name: idx_maintenance_records_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maintenance_records_status ON public.maintenance_records USING btree (status);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_event_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_event_date ON public.orders USING btree (event_date);


--
-- Name: idx_orders_partner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_partner_id ON public.orders USING btree (partner_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_partner_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_profiles_status ON public.partner_profiles USING btree (status);


--
-- Name: idx_partner_profiles_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_profiles_tier ON public.partner_profiles USING btree (tier);


--
-- Name: idx_partner_shared_carts_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_shared_carts_partner ON public.partner_shared_carts USING btree (partner_id);


--
-- Name: idx_partner_shared_carts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_shared_carts_status ON public.partner_shared_carts USING btree (status);


--
-- Name: idx_partner_shared_carts_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_shared_carts_token ON public.partner_shared_carts USING btree (share_token);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_pick_list_items_pick_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pick_list_items_pick_list_id ON public.pick_list_items USING btree (pick_list_id);


--
-- Name: idx_pick_lists_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pick_lists_date ON public.pick_lists USING btree (list_date);


--
-- Name: idx_pick_lists_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pick_lists_status ON public.pick_lists USING btree (status);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_refunds_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_order_id ON public.refunds USING btree (order_id);


--
-- Name: idx_refunds_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refunds_payment_id ON public.refunds USING btree (payment_id);


--
-- Name: idx_staff_permissions_permission_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_permissions_permission_key ON public.staff_permissions USING btree (permission_key);


--
-- Name: idx_staff_permissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_permissions_user_id ON public.staff_permissions USING btree (user_id);


--
-- Name: idx_staff_shifts_shift_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_shifts_shift_date ON public.staff_shifts USING btree (shift_date);


--
-- Name: idx_staff_shifts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_shifts_user_id ON public.staff_shifts USING btree (user_id);


--
-- Name: idx_tasks_assigned_role_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_assigned_role_due_date ON public.tasks USING btree (assigned_role_id, due_date);


--
-- Name: idx_tasks_assigned_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_assigned_role_id ON public.tasks USING btree (assigned_role_id);


--
-- Name: idx_tasks_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);


--
-- Name: idx_tasks_assigned_to_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_assigned_to_due_date ON public.tasks USING btree (assigned_to, due_date);


--
-- Name: idx_tasks_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);


--
-- Name: idx_tasks_due_date_warehouse_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_due_date_warehouse_category ON public.tasks USING btree (due_date, warehouse_category);


--
-- Name: idx_tasks_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_order_id ON public.tasks USING btree (order_id);


--
-- Name: idx_tasks_parent_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_parent_task_id ON public.tasks USING btree (parent_task_id);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- Name: idx_tasks_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_type ON public.tasks USING btree (task_type);


--
-- Name: idx_team_invitations_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_email ON public.team_invitations USING btree (email);


--
-- Name: idx_team_invitations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_status ON public.team_invitations USING btree (status);


--
-- Name: idx_team_invitations_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_token ON public.team_invitations USING btree (invitation_token);


--
-- Name: idx_tour_progress_tour_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tour_progress_tour_type ON public.tour_progress USING btree (tour_type);


--
-- Name: idx_tour_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tour_progress_user_id ON public.tour_progress USING btree (user_id);


--
-- Name: idx_user_addresses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses USING btree (user_id);


--
-- Name: idx_user_favorites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites USING btree (user_id);


--
-- Name: idx_user_preferences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_venue_bookings_event_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venue_bookings_event_date ON public.venue_bookings USING btree (event_date);


--
-- Name: idx_venue_bookings_venue_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_venue_bookings_venue_id ON public.venue_bookings USING btree (venue_id);


--
-- Name: idx_work_orders_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_assigned_to ON public.work_orders USING btree (assigned_to);


--
-- Name: idx_work_orders_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_due_date ON public.work_orders USING btree (due_date);


--
-- Name: idx_work_orders_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_priority ON public.work_orders USING btree (priority);


--
-- Name: idx_work_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_status ON public.work_orders USING btree (status);


--
-- Name: idx_work_schedules_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_schedules_date ON public.work_schedules USING btree (schedule_date);


--
-- Name: idx_work_schedules_staff_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_schedules_staff_id ON public.work_schedules USING btree (staff_id);


--
-- Name: idx_work_schedules_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_schedules_type ON public.work_schedules USING btree (schedule_type);


--
-- Name: products on_low_stock_maintenance; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_low_stock_maintenance AFTER UPDATE OF quantity_available ON public.products FOR EACH ROW WHEN ((old.quantity_available IS DISTINCT FROM new.quantity_available)) EXECUTE FUNCTION public.create_low_stock_maintenance_task();


--
-- Name: tasks on_task_assigned; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_task_assigned AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.notify_task_assignment();


--
-- Name: tasks on_warehouse_task_due; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_warehouse_task_due AFTER INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.notify_warehouse_task_due();


--
-- Name: delivery_routes update_delivery_routes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_delivery_routes_updated_at BEFORE UPDATE ON public.delivery_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: delivery_schedules update_delivery_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_delivery_schedules_updated_at BEFORE UPDATE ON public.delivery_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: delivery_tracking update_delivery_tracking_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON public.delivery_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory update_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: maintenance_records update_maintenance_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON public.maintenance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partner_profiles update_partner_profiles_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_partner_profiles_modtime BEFORE UPDATE ON public.partner_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partner_shared_carts update_partner_shared_carts_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_partner_shared_carts_modtime BEFORE UPDATE ON public.partner_shared_carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: refunds update_refunds_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: team_invitations update_team_invitations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON public.team_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_addresses update_user_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_preferences update_user_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: venue_bookings update_venue_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_venue_bookings_updated_at BEFORE UPDATE ON public.venue_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_orders update_work_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_schedules update_work_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_schedules_updated_at BEFORE UPDATE ON public.work_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: delivery_notifications delivery_notifications_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notifications
    ADD CONSTRAINT delivery_notifications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: delivery_notifications delivery_notifications_delivery_tracking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notifications
    ADD CONSTRAINT delivery_notifications_delivery_tracking_id_fkey FOREIGN KEY (delivery_tracking_id) REFERENCES public.delivery_tracking(id);


--
-- Name: delivery_routes delivery_routes_delivery_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_routes
    ADD CONSTRAINT delivery_routes_delivery_schedule_id_fkey FOREIGN KEY (delivery_schedule_id) REFERENCES public.delivery_schedules(id) ON DELETE CASCADE;


--
-- Name: delivery_schedule_orders delivery_schedule_orders_delivery_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_schedule_orders
    ADD CONSTRAINT delivery_schedule_orders_delivery_schedule_id_fkey FOREIGN KEY (delivery_schedule_id) REFERENCES public.delivery_schedules(id) ON DELETE CASCADE;


--
-- Name: delivery_schedule_orders delivery_schedule_orders_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_schedule_orders
    ADD CONSTRAINT delivery_schedule_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: delivery_schedules delivery_schedules_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_schedules
    ADD CONSTRAINT delivery_schedules_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: delivery_schedules delivery_schedules_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_schedules
    ADD CONSTRAINT delivery_schedules_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: delivery_tracking delivery_tracking_delivery_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tracking
    ADD CONSTRAINT delivery_tracking_delivery_schedule_id_fkey FOREIGN KEY (delivery_schedule_id) REFERENCES public.delivery_schedules(id);


--
-- Name: delivery_tracking delivery_tracking_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tracking
    ADD CONSTRAINT delivery_tracking_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id);


--
-- Name: delivery_tracking delivery_tracking_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_tracking
    ADD CONSTRAINT delivery_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: driver_locations driver_locations_delivery_tracking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_delivery_tracking_id_fkey FOREIGN KEY (delivery_tracking_id) REFERENCES public.delivery_tracking(id);


--
-- Name: driver_locations driver_locations_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_locations
    ADD CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id);


--
-- Name: email_notifications email_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: inventory_reservations inventory_reservations_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- Name: inventory_reservations inventory_reservations_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_reservations
    ADD CONSTRAINT inventory_reservations_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;


--
-- Name: maintenance_checklists maintenance_checklists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_checklists
    ADD CONSTRAINT maintenance_checklists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: maintenance_records maintenance_records_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- Name: maintenance_records maintenance_records_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: maintenance_records maintenance_records_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: order_promo_codes order_promo_codes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_promo_codes
    ADD CONSTRAINT order_promo_codes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_promo_codes order_promo_codes_promo_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_promo_codes
    ADD CONSTRAINT order_promo_codes_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id);


--
-- Name: orders orders_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partner_profiles(id) ON DELETE SET NULL;


--
-- Name: orders orders_partner_shared_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_partner_shared_cart_id_fkey FOREIGN KEY (partner_shared_cart_id) REFERENCES public.partner_shared_carts(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: partner_profiles partner_profiles_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_profiles
    ADD CONSTRAINT partner_profiles_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: partner_profiles partner_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_profiles
    ADD CONSTRAINT partner_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: partner_shared_carts partner_shared_carts_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shared_carts
    ADD CONSTRAINT partner_shared_carts_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: partner_shared_carts partner_shared_carts_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_shared_carts
    ADD CONSTRAINT partner_shared_carts_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partner_profiles(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: payments payments_venue_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_venue_booking_id_fkey FOREIGN KEY (venue_booking_id) REFERENCES public.venue_bookings(id);


--
-- Name: pick_list_items pick_list_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_list_items
    ADD CONSTRAINT pick_list_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: pick_list_items pick_list_items_pick_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_list_items
    ADD CONSTRAINT pick_list_items_pick_list_id_fkey FOREIGN KEY (pick_list_id) REFERENCES public.pick_lists(id) ON DELETE CASCADE;


--
-- Name: pick_list_items pick_list_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_list_items
    ADD CONSTRAINT pick_list_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: pick_lists pick_lists_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_lists
    ADD CONSTRAINT pick_lists_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: pick_lists pick_lists_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_lists
    ADD CONSTRAINT pick_lists_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: pick_lists pick_lists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pick_lists
    ADD CONSTRAINT pick_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: staff_permissions staff_permissions_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_permissions
    ADD CONSTRAINT staff_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: staff_permissions staff_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_permissions
    ADD CONSTRAINT staff_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: staff_shifts staff_shifts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_shifts
    ADD CONSTRAINT staff_shifts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_role_id_fkey FOREIGN KEY (assigned_role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_parent_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: team_invitations team_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: tour_progress tour_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_progress
    ADD CONSTRAINT tour_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

-- Skipped on empty Auth projects: user_profiles.id → auth.users(id)
-- Re-add after migrating/creating matching auth users:
-- ALTER TABLE ONLY public.user_profiles
--     ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.user_profiles(id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: venue_bookings venue_bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venue_bookings
    ADD CONSTRAINT venue_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: venue_bookings venue_bookings_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venue_bookings
    ADD CONSTRAINT venue_bookings_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id);


--
-- Name: warehouse_task_templates warehouse_task_templates_assigned_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouse_task_templates
    ADD CONSTRAINT warehouse_task_templates_assigned_role_id_fkey FOREIGN KEY (assigned_role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: work_orders work_orders_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: work_orders work_orders_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: work_orders work_orders_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- Name: work_orders work_orders_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: work_schedules work_schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_schedules
    ADD CONSTRAINT work_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: work_schedules work_schedules_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_schedules
    ADD CONSTRAINT work_schedules_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: content Admins can insert content.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert content." ON public.content FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: permissions Admins can manage permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage permissions" ON public.permissions USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: role_permissions Admins can manage role_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.roles USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: user_roles Admins can manage user_roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage user_roles" ON public.user_roles USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: content Admins can update content.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update content." ON public.content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: partner_tier_settings Anyone authenticated can read partner tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone authenticated can read partner tiers" ON public.partner_tier_settings FOR SELECT TO authenticated USING (true);


--
-- Name: permissions Authenticated users can view permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view permissions" ON public.permissions FOR SELECT TO authenticated USING (true);


--
-- Name: role_permissions Authenticated users can view role_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);


--
-- Name: roles Authenticated users can view roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view roles" ON public.roles FOR SELECT TO authenticated USING (true);


--
-- Name: user_roles Authenticated users can view user_roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view user_roles" ON public.user_roles FOR SELECT TO authenticated USING (true);


--
-- Name: payments Customers can view payments for their orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can view payments for their orders" ON public.payments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = payments.order_id) AND (o.user_id = auth.uid())))));


--
-- Name: users Enable insert for service role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for service role" ON public.users FOR INSERT WITH CHECK (true);


--
-- Name: partner_shared_carts Partners manage own shared carts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Partners manage own shared carts" ON public.partner_shared_carts TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.partner_profiles pp
  WHERE ((pp.id = partner_shared_carts.partner_id) AND (pp.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text]))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM public.partner_profiles pp
  WHERE ((pp.id = partner_shared_carts.partner_id) AND (pp.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text])))))));


--
-- Name: categories Public can read active categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active categories" ON public.categories FOR SELECT TO authenticated, anon USING ((COALESCE(is_active, true) = true));


--
-- Name: products Public can read active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active products" ON public.products FOR SELECT TO authenticated, anon USING ((COALESCE(is_active, true) = true));


--
-- Name: content Public content is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public content is viewable by everyone." ON public.content FOR SELECT USING (true);


--
-- Name: tasks Staff can delete tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can delete tasks" ON public.tasks FOR DELETE USING (public.is_staff());


--
-- Name: admin_notifications Staff can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (public.is_staff());


--
-- Name: order_items Staff can insert order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (public.is_staff());


--
-- Name: orders Staff can insert orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.is_staff());


--
-- Name: tasks Staff can insert tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can insert tasks" ON public.tasks FOR INSERT WITH CHECK (public.is_staff());


--
-- Name: partner_tier_settings Staff can manage partner tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage partner tiers" ON public.partner_tier_settings TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text]))))));


--
-- Name: staff_shifts Staff can manage staff shifts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage staff shifts" ON public.staff_shifts USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: user_profiles Staff can manage user profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage user profiles" ON public.user_profiles USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: warehouse_task_templates Staff can manage warehouse task templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage warehouse task templates" ON public.warehouse_task_templates USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: admin_notifications Staff can update notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can update notifications" ON public.admin_notifications FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: tasks Staff can update tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can update tasks" ON public.tasks FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: user_profiles Staff can view all user profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all user profiles" ON public.user_profiles FOR SELECT USING (public.is_staff());


--
-- Name: admin_notifications Staff can view notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view notifications" ON public.admin_notifications FOR SELECT USING (public.is_staff());


--
-- Name: payments Staff can view payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT TO authenticated USING (public.is_staff());


--
-- Name: staff_shifts Staff can view staff shifts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view staff shifts" ON public.staff_shifts FOR SELECT USING (public.is_staff());


--
-- Name: tasks Staff can view tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view tasks" ON public.tasks FOR SELECT USING (public.is_staff());


--
-- Name: warehouse_task_templates Staff can view warehouse task templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view warehouse task templates" ON public.warehouse_task_templates FOR SELECT USING (public.is_staff());


--
-- Name: categories Staff can write categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can write categories" ON public.categories TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: products Staff can write products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can write products" ON public.products TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());


--
-- Name: partner_profiles Users can create own partner application; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own partner application" ON public.partner_profiles FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: partner_profiles Users can read own partner profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own partner profile" ON public.partner_profiles FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text])))))));


--
-- Name: partner_profiles Users can update own pending partner profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own pending partner profile" ON public.partner_profiles FOR UPDATE TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = ANY (ARRAY['admin'::text, 'manager'::text])))))));


--
-- Name: user_profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: admin_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

--
-- Name: partner_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: partner_shared_carts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_shared_carts ENABLE ROW LEVEL SECURITY;

--
-- Name: partner_tier_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partner_tier_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_shifts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: warehouse_task_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.warehouse_task_templates ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--



-- Grants (stripped by pg_dump --no-acl; required for PostgREST + RLS)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
