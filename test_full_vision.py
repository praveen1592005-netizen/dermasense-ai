import urllib.request
import json
import base64
import struct
import zlib

# Create a realistic skin-tone test image (100x100) with slight redness to simulate acne
def make_skin_png(width=100, height=100):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)
    # Mix of skin tone with some reddish pixels (simulating pimples)
    pixels = []
    for y in range(height):
        for x in range(width):
            # Add red spots in centre
            if 40 < x < 60 and 40 < y < 60:
                pixels += [220, 80, 80]   # red spot
            else:
                pixels += [210, 170, 140]  # normal skin tone
    raw = b''.join(b'\x00' + bytes(pixels[y*width*3:(y+1)*width*3]) for y in range(height))
    compressed = zlib.compress(raw)
    return (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) +
            chunk(b'IDAT', compressed) +
            chunk(b'IEND', b''))

img_bytes = make_skin_png()
img_b64 = base64.b64encode(img_bytes).decode('utf-8')

print(f'Image size: {len(img_bytes)} bytes, Base64 size: {len(img_b64)} chars')

api_key = ''
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}'

# Using the EXACT same prompt as the Flutter app
prompt = '''You are an expert dermatologist AI. Analyze this skin image carefully.

Identify the skin condition shown. Choose ONE from this list:
- Acne Vulgaris (pimples, blackheads, whiteheads, pustules)
- Atopic Dermatitis (Eczema) (itchy red patches, dry inflamed skin)
- Psoriasis (silvery scales, red plaques)
- Rosacea (facial redness, visible blood vessels)
- Seborrheic Dermatitis (flaky oily patches, dandruff-like)
- Contact Dermatitis (rash from allergic reaction or irritant)
- Tinea Corporis (Ringworm) (ring-shaped fungal rash)
- Vitiligo (white depigmented patches)
- Urticaria (Hives) (raised welts, red itchy bumps)
- Hyperpigmentation (dark spots, uneven skin tone)
- Melanoma (irregular dark lesion, asymmetric)
- Basal Cell Carcinoma (pearly bump, non-healing sore)
- Actinic Keratosis (rough scaly patch from sun damage)
- Benign Keratosis (waxy brown/tan growth)
- Melanocytic Nevi (common mole)
- Vascular Lesion (cherry angioma, red spot)
- Dermatofibroma (small firm bump)
- Clear Skin (healthy, no significant condition)

Respond ONLY with this exact JSON format (no markdown, no explanation):
{
  "disease": "<condition name exactly as listed>",
  "confidence": <0.70 to 0.97>,
  "severity": "<None - Healthy | Mild | Mild to Moderate | Moderate | Moderate to Severe | Severe | Critical | Cosmetic>",
  "risk": "<No Risk | Low Risk | Low-Moderate Risk | Moderate Risk | Moderate-High Risk | High Risk>",
  "explanation": "<2-3 sentences describing what is visible in the image and why you made this diagnosis>",
  "treatment": "<bullet point treatment steps using - character>",
  "skincare": ["<step 1>", "<step 2>", "<step 3>", "<step 4>", "<step 5>"],
  "urgency": "<one sentence on urgency of treatment>",
  "needsDoctor": <true or false>
}'''

body = json.dumps({
    "contents": [{
        "parts": [
            {
                "inline_data": {
                    "mime_type": "image/png",
                    "data": img_b64
                }
            },
            {"text": prompt}
        ]
    }],
    "generationConfig": {
        "temperature": 0.2,
        "maxOutputTokens": 1024
    }
}).encode('utf-8')

print(f'Request body size: {len(body)} bytes')

req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode('utf-8'))
        text = result['candidates'][0]['content']['parts'][0]['text']
        print('\nSUCCESS! Gemini Vision with full dermatology prompt works!')
        print('Raw response:')
        print(text[:500])
        # Parse the JSON result
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            print('\nParsed disease:', parsed.get('disease'))
            print('Parsed confidence:', parsed.get('confidence'))
except urllib.error.HTTPError as e:
    body_text = e.read().decode('utf-8')
    print(f'\nHTTP Error {e.code}: {e.reason}')
    error_data = json.loads(body_text)
    print('Error message:', error_data.get('error', {}).get('message', body_text))
except Exception as e:
    print(f'\nException: {e}')
