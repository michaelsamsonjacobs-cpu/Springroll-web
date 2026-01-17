from PIL import Image
import sys

def crop_s_logo(image_path, output_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        
        # Analyze columns to find the gap between S and text
        # The S is on the left. We scan from left to right.
        # We look for a column of transparent/white pixels after the first block of content.
        
        pixels = img.load()
        
        start_x = -1
        end_x = -1
        
        found_content = False
        
        # simple scan for content
        for x in range(width):
            has_content = False
            for y in range(height):
                r, g, b, a = pixels[x, y]
                # Check for non-white, non-transparent
                if a > 0 and (r < 250 or g < 250 or b < 250):
                    has_content = True
                    break
            
            if has_content:
                if not found_content:
                    start_x = x
                    found_content = True
            else:
                if found_content:
                    # We found a gap! This marks the end of the S
                    end_x = x
                    break
        
        if end_x == -1:
            end_x = width # Take whole image if no gap found (fallback)
            
        # Crop the S
        # Add a bit of padding if needed, or find bounding box Y
        s_img = img.crop((0, 0, end_x, height))
        bbox = s_img.getbbox()
        if bbox:
            s_img = s_img.crop(bbox)
            
        # Now make it square with padding
        w, h = s_img.size
        new_size = max(w, h)
        final_img = Image.new("RGBA", (new_size, new_size), (255, 255, 255, 0)) # Transparent bg
        
        # Paste centered
        x = (new_size - w) // 2
        y = (new_size - h) // 2
        final_img.paste(s_img, (x, y))
        
        final_img.save(output_path)
        print(f"Successfully created S-only icon: {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    crop_s_logo(
        r"C:\Users\Mike\.gemini\antigravity\brain\d80af006-690b-408f-aa88-97cbef223803\uploaded_image_1768549216301.png",
        r"src-tauri\icons\icon.png"
    )
