from PIL import Image
import sys

def make_square(image_path, output_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        
        width, height = img.size
        new_size = max(width, height)
        
        # Create a white background square image
        new_img = Image.new("RGBA", (new_size, new_size), (255, 255, 255, 0))
        
        # Calculate position to paste the original image centered
        x = (new_size - width) // 2
        y = (new_size - height) // 2
        
        new_img.paste(img, (x, y), img)
        new_img.save(output_path)
        print(f"Successfully created square image: {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    make_square(
        r"C:\Users\Mike\.gemini\antigravity\brain\d80af006-690b-408f-aa88-97cbef223803\uploaded_image_1768549216301.png",
        r"src-tauri\icons\icon.png"
    )
