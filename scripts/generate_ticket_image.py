#!/usr/bin/env python3
"""
Python Pillow canvas for ticket image with barcode above date.
Fetches ticket data (JSON), overlays on final-ticket.png.
Barcode (Code128) above createdAt date in bottom section.
"""

import sys
import json
import os
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
from barcode import Code128
from barcode.writer import ImageWriter
import io

def generate_ticket_image(ticket_data, output_path):
    # Load base ticket image
    base_path = os.path.join(os.path.dirname(__file__), '../public/final-ticket.png')
    if not os.path.exists(base_path):
        raise FileNotFoundError(f"Base image not found: {base_path}")
    
    base = Image.open(base_path).convert('RGBA')
    draw = ImageDraw.Draw(base)
    
    # Fonts (fallback to system)
    try:
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_med = ImageFont.truetype("arial.ttf", 16)
        font_small = ImageFont.truetype("arial.ttf", 12)
    except:
        font_large = ImageFont.load_default()
        font_med = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Ticket data
    movie = ticket_data['movieTitle']
    recipient = ticket_data['recipientName']
    msg = ticket_data['message']
    seat = ticket_data['seatNumber']
    barcode_word = ticket_data['barcodeWord']
    date_str = datetime.fromisoformat(ticket_data['createdAt'].replace('Z', '+00:00')).strftime('%m/%d/%Y')
    
    # Dimensions (approx from canvas: 410x310)
    w, h = base.size
    scale = w / 410
    
    # Bottom date section positions (above current footer)
    date_x = int(200 * scale)
    date_y = int(260 * scale)
    barcode_y = int(220 * scale)  # Above date
    
    # 1. Draw date
    draw.text((date_x, date_y), f"Date: {date_str}", fill='black', font=font_small)
    
    # 2. Generate barcode PNG (Code128)
    code = Code128(barcode_word, writer=ImageWriter())
    barcode_buffer = io.BytesIO()
    code.write(barcode_buffer)
    barcode_img = Image.open(barcode_buffer).convert('RGBA')
    
    # Resize barcode to fit (60x30 scaled)
    bw = int(60 * scale)
    bh = int(30 * scale)
    barcode_img = barcode_img.resize((bw, bh), Image.Resampling.LANCZOS)
    
    # Paste barcode above date, centered
    paste_x = int((w - bw) / 2)
    base.paste(barcode_img, (paste_x, barcode_y), barcode_img)
    
    # Add barcode text below barcode
    draw.text((paste_x, barcode_y + bh + 2), barcode_word.upper(), fill='black', font=font_small)
    
    # Save
    base.convert('RGB').save(output_path, 'PNG', quality=95)
    print(f"Ticket image generated: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_ticket_image.py <ticket.json> <output.png>")
        sys.exit(1)
    
    ticket_file = sys.argv[1]
    output_file = sys.argv[2]
    
    with open(ticket_file, 'r') as f:
        ticket_data = json.load(f)
    
    generate_ticket_image(ticket_data, output_file)

