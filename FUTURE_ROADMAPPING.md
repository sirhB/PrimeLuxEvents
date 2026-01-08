# Future Roadmapping - Growth & Expansion

Suggestions for features and improvements to further enhance the PrimeLux Events platform.

## 1. Customer Portal Enhancements
- **Interactive Invoices**: Allow customers to pay balances and view itemized bills directly online.
- **Digital Signatures**: Integrate e-signing for rental agreements and contracts.
- **Event Countdown**: A personalized dashboard for clients showing their event timeline.

## 2. Inventory & Logistics Optimization
- **Automated Alerts**: Low-stock notifications and overbooking warnings.
- **Barcode/QR Integration**: Scan items for faster check-out and check-in at the warehouse.
- **Route Optimization**: Intelligent delivery routing for the logistics team.

## 3. Marketing & Loyalty
- **Tiered Discounts**: Automatically apply discounts for repeat customers or large volume orders.
- **Referral Program**: Reward planners and clients for referring new business.
- **Newsletter Integration**: Synchronize customer data with email marketing tools.

## 4. Advanced Admin Tools
- **Financial Analytics**: In-depth reporting on revenue, top-performing items, and seasonal trends.
- **Mobile Admin App**: A streamlined version of the dashboard for on-the-go management.
- **Multi-Warehouse Support**: Manage inventory across multiple physical locations.

## 5. Design & Inspiration
- **AI Mood Board Generator**: A tool to automatically suggest rental items based on uploaded inspiration images.
- **3D Room Planner**: Allow users to visualize how items will look in a virtual version of their venue.




Future Expansion Plan: PrimeLux Events Phase 2
This plan outlines the architectural and technical steps required to implement the advanced features requested for the PrimeLux Events platform.

1. Customer Portal Enhancements
Interactive Invoices & Payments
Objective: Enable customers to view real-time balance updates and pay outstanding amounts via a secure portal.
Database Changes:
Add balance_paid (cents) and payment_status (unpaid, partially_paid, paid) to the orders table.
Create a payments table to track multiple Stripe transactions against a single order.
Technical Implementation:
Stripe Integration: Update the Stripe webhook to handle partial payments and update balance_paid accordingly.
Portal UI: Create a /account/orders/[id] view where customers can see an itemized breakdown (including modifiers and packages) and a "Pay Balance" button.
Dynamic PDFs: Generate dynamic PDF invoices using a library like @react-pdf/renderer for customers to download.
Digital Signatures (E-Signing)
Objective: Legally binding rental agreements signed directly in the browser.
Technical Implementation:
Signature Capture: Integrate react-signature-canvas into the checkout and order review flow.
Storage: Store the signature as a base64 string or upload the generated PNG to a new signatures bucket in Supabase Storage.
Order Update: Add signature_url and signed_at columns to the orders table.
Contract Generation: Merge the signature into a standard rental agreement template to generate a "Signed Agreement" PDF.
2. Inventory & Logistics Optimization
Automated Alerts (Low-Stock & Overbooking)
Objective: Proactive warnings for the admin team when inventory is at risk.
Technical Implementation:
Database Triggers: Create a PostgreSQL function that runs on INSERT or UPDATE of order_items. It should check the date range of the order against the total quantity_available for that product.
Realtime Notifications: Use Supabase Realtime to push "Overbooking Detected" alerts to the Admin Dashboard.
Email Alerts: Integrate Resend or SendGrid to email the admin if a product's stock falls below a configurable threshold.
Barcode/QR Integration
Objective: Streamline warehouse operations for check-out (delivery) and check-in (return).
Technical Implementation:
Generation: Use qrcode.react to generate unique QR codes for every order_id (on packing slips) and every product_id.
Scanning: Use html5-qrcode to create a mobile-friendly scanner page accessible to warehouse staff at /admin/scan.
Workflow: Scanning an order QR shows the picking list; scanning a product confirms it's loaded onto the truck.
Route Optimization
Objective: Efficient delivery routes based on venue locations and time windows.
Technical Implementation:
Geodata: Enhance the orders table to ensure latitude and longitude are captured during checkout using the Google Maps Autocomplete API.
Algorithm: Use the Mapbox Optimization API or Google Maps Distance Matrix to calculate the most efficient sequence for a day's deliveries.
Logistics Map: Create a /admin/logistics view with a map interface showing the daily route for drivers.
3. Advanced Admin Tools
Financial Analytics Dashboard
Objective: In-depth visualization of business performance.
Technical Implementation:
Data Aggregation: Create a Supabase View that aggregates revenue by month, category, and product.
Visualizations: Use recharts to build:
Revenue Chart: Monthly growth and seasonal comparisons.
Product Performance: "Most Rented" vs. "Highest Revenue" items.
Lead Conversion: Percentage of inquiries that become confirmed orders.
Mobile Admin App (PWA)
Objective: A high-performance, mobile-optimized version of the dashboard for on-site management.
Technical Implementation:
PWA Setup: Add a manifest.json and service worker to allow the site to be "Installed" on iOS/Android home screens.
Mobile Layouts: Implement a specialized /admin/mobile entry point or utilize CSS container queries to transform complex tables into "Card Views" for smaller screens.
Quick Actions: Large, touch-friendly buttons for "Mark as Delivered," "Contact Customer," and "Inventory Check."
Implementation Roadmap
Stage 1 (Payment & Signatures): Focus on the customer portal to increase conversion and legal security.
Stage 2 (Logistics & Scanning): Improve internal efficiency as order volume grows.
Stage 3 (Analytics & Mobile): Provide the data management needed for scaling the business.