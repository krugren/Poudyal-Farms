-- Seed gallery images from Airbnb Poudhyal Farms listing
-- Table: gallery  |  Columns: id (autoincrement), url, alt_text, category, sort_order, is_active

DELETE FROM "gallery";

INSERT INTO "gallery" (url, alt_text, category, sort_order, is_active) VALUES
('/uploads/gallery/pf-20260702-11.jpeg', 'Poudhyal Farms A-frame farmhouse surrounded by lush greenery', 'farm', 1, 1),
('/uploads/gallery/pf-20260702-4.jpeg',  'Poudhyal Farms exterior with iconic red A-frame roof and garden seating', 'farm', 2, 1),
('/uploads/gallery/pf-20260702-14.jpeg', 'Himalayan mountain view from the balcony of Poudhyal Farms', 'landscape', 3, 1),
('/uploads/gallery/pf-20260702-3.jpeg',  'Traditional ox-plough farming on terraced fields with misty Himalayan backdrop', 'farm', 4, 1),
('/uploads/gallery/pf-20260702-9.jpeg',  'Bright open-plan lounge and dining area inside Poudhyal Farms', 'rooms', 5, 1),
('/uploads/gallery/pf-20260702-6.jpeg',  'Modern kitchen and dining area with spiral staircase leading to loft', 'rooms', 6, 1),
('/uploads/gallery/pf-20260702-2.jpeg',  'Comfortable living room with wooden A-frame ceiling beams', 'rooms', 7, 1),
('/uploads/gallery/pf-20260702-8.jpeg',  'Cosy double bedroom with warm wooden interiors', 'rooms', 8, 1),
('/uploads/gallery/pf-20260702-10.jpeg', 'Loft bedroom with bean bag and A-frame windows letting in natural light', 'rooms', 9, 1),
('/uploads/gallery/pf-20260702-1.jpeg',  'Cosy study nook in the A-frame loft with views to the garden', 'rooms', 10, 1),
('/uploads/gallery/pf-20260702-5.jpeg',  'Workspace under the A-frame roof with natural light from triangular window', 'rooms', 11, 1),
('/uploads/gallery/pf-20260702-7.jpeg',  'Indoor table tennis room with views of the garden', 'activities', 12, 1),
('/uploads/gallery/pf-20260702-12.jpeg', 'Clean bathroom with marble vanity and walk-in shower', 'rooms', 13, 1),
('/uploads/gallery/pf-20260702-13.jpeg', 'Second bathroom with shower and natural window light', 'rooms', 14, 1);
