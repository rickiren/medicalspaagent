-- SQL to update all existing businesses with the correct domain
-- Run this in your Supabase SQL Editor

UPDATE businesses
SET 
  preview_url = 'https://gen-lang-client-0046334557.web.app/preview/' || id,
  widget_url = 'https://gen-lang-client-0046334557.web.app/widget/' || id
WHERE preview_url LIKE '%yourdomain.com%' 
   OR preview_url LIKE '%vercel.app%'
   OR preview_url IS NULL 
   OR widget_url LIKE '%yourdomain.com%'
   OR widget_url LIKE '%vercel.app%'
   OR widget_url IS NULL;

