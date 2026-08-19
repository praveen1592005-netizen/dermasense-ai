import urllib.request
import json
import base64
import struct
import zlib

# Create a tiny 10x10 red PNG image in memory (no external files needed)
def make_tiny_png():
    def make_png(width, height, pixels):
        def chunk(name, data):
            c = zlib.crc32(name + data) & 0xffffffff
            return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)
        raw = b''.join(b'\x00' + bytes(pixels[y*width*3:(y+1)*width*3]) for y in range(height))
        compressed = zlib.compress(raw)
        return (b'\x89PNG\r\n\x1a\n' +
                chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) +
                chunk(b'IDAT', compressed) +
                chunk(b'IEND', b''))
    pixels = [200, 150, 130] * (10 * 10)  # skin-tone color pixels
    return make_png(10, 10, pixels)

# Create the tiny test image
img_bytes = make_tiny_png()
img_b64 = base64.b64encode(img_bytes).decode('utf-8')

api_key = ''
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}'

body = json.dumps({
    "contents": [{
        "parts": [
            {
                "inline_data": {
                    "mime_type": "image/png",
                    "data": img_b64
                }
            },
            {"text": "What color is this image? Reply in one word."}
        ]
    }],
    "generationConfig": {
        "temperature": 0.1,
        "maxOutputTokens": 50
    }
}).encode('utf-8')

req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode('utf-8'))
        print('VISION API WORKS!')
        print('Response:', result['candidates'][0]['content']['parts'][0]['text'])
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f'HTTP Error {e.code}: {e.reason}')
    print('Details:', error_body)
except Exception as e:
    print(f'Exception: {e}')
