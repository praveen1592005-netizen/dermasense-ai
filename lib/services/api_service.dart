// lib/services/api_service.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as img;
import 'package:flutter_dotenv/flutter_dotenv.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

class ApiClient {

  static const List<Map<String, dynamic>> _diseases = [
    {
      'disease': 'Acne Vulgaris',
      'confidence': 0.91,
      'severity': 'Mild to Moderate',
      'risk': 'Low Risk',
      'explanation':
          'Acne vulgaris is a chronic inflammatory condition of the pilosebaceous unit. It is characterized by comedones, papules, pustules, and nodules appearing on the face, chest, and back. It occurs when hair follicles become plugged with oil and dead skin cells.',
      'treatment':
          '• Apply benzoyl peroxide 2.5–5% gel once daily\n• Use salicylic acid cleanser morning & night\n• Apply topical retinoid (adapalene) at bedtime\n• Oral antibiotics if prescribed by a dermatologist\n• Avoid squeezing or picking lesions to prevent scarring',
      'skincare': [
        'Gentle foaming cleanser (morning & night)',
        'Oil-free, non-comedogenic moisturizer',
        'SPF 30+ sunscreen every morning',
        'Salicylic acid 2% toner (morning)',
        'Retinol/adapalene spot treatment (night)',
        'Avoid heavy oils & comedogenic products',
      ],
      'urgency': 'Schedule an appointment within 1–2 months if no improvement',
      'needsDoctor': false,
      'colorHex': '0xFFFF7043',
    },
    {
      'disease': 'Atopic Dermatitis (Eczema)',
      'confidence': 0.87,
      'severity': 'Moderate',
      'risk': 'Moderate Risk',
      'explanation':
          'Atopic dermatitis is a chronic, relapsing inflammatory skin condition characterized by intense itching, dry skin, and a rash. It is associated with a personal or family history of asthma or allergic rhinitis. Flare-ups are triggered by stress, sweat, and allergens.',
      'treatment':
          '• Moisturize with thick ceramide-based creams at least twice daily\n• Apply topical corticosteroids during flare-ups as prescribed\n• Use fragrance-free, hypoallergenic products only\n• Identify and avoid personal triggers (dust mites, pet dander)\n• Take lukewarm (not hot) showers for no longer than 10 minutes',
      'skincare': [
        'Fragrance-free gentle cleanser',
        'Thick ceramide moisturizer (apply within 3 min of shower)',
        'Lukewarm showers (max 10 minutes)',
        'Mineral sunscreen SPF 30+',
        'Loose-fitting, soft cotton clothing',
        'Antihistamines for itch relief (consult doctor)',
      ],
      'urgency': 'See a dermatologist if flares are frequent or severe',
      'needsDoctor': true,
      'colorHex': '0xFF42A5F5',
    },
    {
      'disease': 'Psoriasis',
      'confidence': 0.84,
      'severity': 'Moderate to Severe',
      'risk': 'Moderate-High Risk',
      'explanation':
          'Psoriasis is a chronic autoimmune condition causing rapid skin cell buildup, resulting in scaling on the skin surface. It produces red, flaky, crusty patches covered with silvery scales. It is a lifelong condition that cycles through flares and remissions.',
      'treatment':
          '• Topical corticosteroids to reduce inflammation\n• Vitamin D analogues (calcipotriol) to slow skin growth\n• Coal tar preparations for scaling\n• Phototherapy (UVB) sessions at a dermatology clinic\n• Biologic medications for severe cases (requires prescription)',
      'skincare': [
        'Thick, fragrance-free emollient cream daily',
        'Soak in lukewarm oatmeal baths for 15 minutes',
        'Controlled sun exposure (avoid sunburn)',
        'Avoid skin injuries, harsh soaps, and stress triggers',
        'pH-balanced gentle shampoo for scalp involvement',
        'Follow prescribed treatment plan consistently',
      ],
      'urgency': 'Consult a dermatologist promptly for proper management',
      'needsDoctor': true,
      'colorHex': '0xFFAB47BC',
    },
    {
      'disease': 'Rosacea',
      'confidence': 0.88,
      'severity': 'Mild to Moderate',
      'risk': 'Low-Moderate Risk',
      'explanation':
          'Rosacea is a common skin condition causing persistent redness, visible blood vessels, and small red bumps on the face. It tends to be cyclic — flaring for weeks to months then diminishing. Sun exposure, hot beverages, spicy food, and alcohol are common triggers.',
      'treatment':
          '• Topical metronidazole or azelaic acid cream\n• Avoid known triggers (sun, hot drinks, spicy food, alcohol)\n• Gentle skincare routine only with hypoallergenic products\n• Laser therapy for visible blood vessels\n• Oral antibiotics (doxycycline) during severe flares',
      'skincare': [
        'Gentle, soap-free cleanser (twice daily)',
        'Fragrance-free, calming moisturizer with niacinamide',
        'Physical SPF 50+ sunscreen (zinc oxide / titanium dioxide)',
        'Use cool water only — avoid hot showers',
        'Avoid alcohol-based toners and harsh exfoliants',
        'Anti-inflammatory diet (omega-3 rich foods)',
      ],
      'urgency': 'Consult a dermatologist for a personalized treatment plan',
      'needsDoctor': true,
      'colorHex': '0xFFEF5350',
    },
    {
      'disease': 'Seborrheic Dermatitis',
      'confidence': 0.90,
      'severity': 'Mild',
      'risk': 'Low Risk',
      'explanation':
          'Seborrheic dermatitis is a common skin condition mainly affecting oily areas of the body — the scalp, face, and chest. It causes scaly patches, red skin, and stubborn dandruff. It is associated with an overgrowth of a naturally occurring yeast on the skin.',
      'treatment':
          '• Antifungal shampoos containing ketoconazole or selenium sulfide\n• Medicated creams with hydrocortisone for face\n• Antifungal creams (clotrimazole, miconazole)\n• Tar-based shampoos for scalp control\n• Regular washing to remove excess oil build-up',
      'skincare': [
        'Antifungal cleanser for affected areas',
        'Light, non-occlusive moisturizer',
        'Tea tree oil diluted in carrier oil (scalp use)',
        'Wash hair every 2–3 days with medicated shampoo',
        'Avoid heavy hair products (oils, pomades)',
        'Light sun exposure may help (avoid sunburn)',
      ],
      'urgency': 'Manageable with OTC products; see doctor if worsening',
      'needsDoctor': false,
      'colorHex': '0xFF66BB6A',
    },
    {
      'disease': 'Contact Dermatitis',
      'confidence': 0.85,
      'severity': 'Mild to Moderate',
      'risk': 'Low Risk',
      'explanation':
          'Contact dermatitis is a red, itchy rash caused by direct contact with a substance or an allergic reaction to it. The rash is not contagious or life-threatening but can be very uncomfortable. Common causes include jewelry (nickel), perfume, cosmetics, and plants like poison ivy.',
      'treatment':
          '• Identify and immediately remove the irritant or allergen\n• Apply cool compresses to soothe the skin\n• Use over-the-counter hydrocortisone 1% cream\n• Take oral antihistamines for itch relief\n• Prescription corticosteroids for severe reactions',
      'skincare': [
        'Identify and eliminate the trigger substance',
        'Fragrance-free, hypoallergenic products only',
        'Bland emollient cream for moisturizing',
        'Wear gloves when handling potential irritants',
        'Avoid all known allergens and irritants',
        'Aloe vera gel for natural soothing relief',
      ],
      'urgency': 'Usually resolves within 2–4 weeks after removing trigger',
      'needsDoctor': false,
      'colorHex': '0xFFFFCA28',
    },
    {
      'disease': 'Tinea Corporis (Ringworm)',
      'confidence': 0.93,
      'severity': 'Mild',
      'risk': 'Low Risk (Contagious)',
      'explanation':
          'Tinea corporis (ringworm) is a fungal infection of the skin — not actually caused by a worm. It causes a characteristic ring-shaped rash with a clear center. It is contagious and can spread through direct skin contact or contact with contaminated surfaces and objects.',
      'treatment':
          '• Apply topical antifungal cream (clotrimazole, terbinafine) twice daily for 2–4 weeks\n• Keep the area clean and completely dry\n• Wash clothing and bedding frequently in hot water\n• Avoid sharing personal items (towels, clothing)\n• Oral antifungals for severe or widespread infection',
      'skincare': [
        'Antifungal cream applied twice daily for 2–4 weeks',
        'Keep affected area clean and completely dry',
        'Change clothes and underwear daily',
        'Wash bedding weekly in hot water (60°C / 140°F)',
        'Do NOT share towels, clothing, or combs',
        'Wear loose, breathable cotton clothing',
      ],
      'urgency': 'Treat promptly to prevent spreading to others',
      'needsDoctor': false,
      'colorHex': '0xFF26C6DA',
    },
    {
      'disease': 'Vitiligo',
      'confidence': 0.86,
      'severity': 'Cosmetic (Non-harmful)',
      'risk': 'Low Medical Risk',
      'explanation':
          'Vitiligo is a condition where patches of skin lose their pigment. The patches appear white or lighter than surrounding skin. It occurs when melanocytes (pigment-producing cells) die or stop functioning. It is not contagious or harmful, but can have significant psychological impact.',
      'treatment':
          '• Topical corticosteroids to help repigment skin\n• Topical calcineurin inhibitors (tacrolimus) for sensitive areas\n• Narrowband UVB phototherapy at a dermatology clinic\n• Camouflage cosmetics for improved wellbeing\n• Depigmentation therapy for widespread cases',
      'skincare': [
        'SPF 50+ sunscreen on all affected areas (always)',
        'Gentle hydrating moisturizer daily',
        'Avoid skin trauma (can trigger new patches)',
        'Antioxidant-rich diet (vitamins C, E, and B12)',
        'Medical-grade self-tanner for evening skin tone',
        'Consider camouflage makeup for confidence',
      ],
      'urgency': 'Consult a dermatologist for treatment options & support',
      'needsDoctor': true,
      'colorHex': '0xFF78909C',
    },
    {
      'disease': 'Urticaria (Hives)',
      'confidence': 0.89,
      'severity': 'Mild to Moderate',
      'risk': 'Low-Moderate Risk',
      'explanation':
          'Urticaria (hives) is a skin reaction causing itchy welts (wheals) that can appear anywhere on the body. The welts vary in size and appear and fade repeatedly. Triggers include food allergies, medications, infections, insect stings, and stress. Rarely associated with anaphylaxis.',
      'treatment':
          '• Take non-drowsy antihistamines (cetirizine, loratadine) immediately\n• Apply cool compresses to affected areas for relief\n• Identify and avoid known triggers\n• Oral corticosteroids for severe episodes (prescription)\n• Seek EMERGENCY care if throat swelling or breathing difficulty occurs',
      'skincare': [
        'Apply cool, damp cloth to welts for immediate relief',
        'Fragrance-free, gentle skincare products only',
        'Antihistamine for itch (consult pharmacist)',
        'Avoid all known triggers (foods, medications, stress)',
        'Wear loose, cool, breathable clothing',
        'Keep a symptom diary to identify personal triggers',
      ],
      'urgency': '⚠️ Seek emergency care immediately if breathing becomes difficult',
      'needsDoctor': true,
      'colorHex': '0xFFFF7043',
    },
    {
      'disease': 'Hyperpigmentation',
      'confidence': 0.88,
      'severity': 'Cosmetic',
      'risk': 'Low Medical Risk',
      'explanation':
          'Hyperpigmentation is a common condition where patches of skin become darker than the surrounding area. It occurs when the skin produces too much melanin. Causes include sun exposure (sun spots), hormonal changes (melasma), inflammation, or skin injuries (post-inflammatory hyperpigmentation).',
      'treatment':
          '• Apply topical hydroquinone 2–4% cream\n• Use azelaic acid or kojic acid-based products\n• Chemical peels for stubborn spots (dermatologist)\n• Laser treatment for deeper pigmentation\n• Strict sun protection to prevent worsening',
      'skincare': [
        'Broad-spectrum SPF 50+ sunscreen every single day',
        'Vitamin C serum (morning) for brightening',
        'Niacinamide serum (morning & night)',
        'Alpha arbutin for targeted spot treatment',
        'Retinol/retinoid for accelerating cell turnover (night)',
        'Avoid picking at skin & unprotected sun exposure',
      ],
      'urgency': 'Consistent treatment over 3–6 months required for results',
      'needsDoctor': false,
      'colorHex': '0xFFFFA726',
    },
  ];

  // ── Gemini API key ───────────────────────────────────────────────
  String? get _geminiApiKey => dotenv.env['GEMINI_API_KEY'];

  String get _backendUrl {
    return 'http://10.119.11.160:8000';
  }

  Future<Map<String, dynamic>> predict(String base64Image) async {
    // Use Gemini Vision as the primary AI model
    try {
      final result = await _geminiVisionPredict(base64Image);
      if (result != null) return result;
    } catch (e) {
      // ignore: avoid_print
      print('[DermaSense] Gemini Vision failed: $e');
    }
    // Fallback: smart local pixel analysis
    return _smartLocalAnalysis(base64Image);
  }

  /// AI pipeline: Image Quality Check → Gemini Explainer
  Future<Map<String, dynamic>> predictHybrid(
    String base64Image, {
    dynamic patientInfo,
  }) async {
    await Future.delayed(const Duration(seconds: 1));

    // ── Pre-check: Validate if skin is present and if it is clear ─────────────────
    final condition = await _geminiCheckSkinCondition(base64Image);
    if (condition == 'NO_SKIN') {
      throw Exception('NO_SKIN');
    } else if (condition == 'CLEAR_SKIN') {
      return {
        'disease': 'Clear Skin',
        'confidence': 0.99,
        'severity': 'Healthy',
        'risk': 'None',
        'explanation': 'The skin appears clear and healthy with no visible signs of dermatological conditions. Keep up the good habits!',
        'treatment': '• Maintain your current skincare routine\n• Stay hydrated\n• Use daily sun protection',
        'skincare': [
          'Apply broad-spectrum SPF 30+ daily',
          'Use a gentle cleanser',
          'Moisturize regularly'
        ],
        'urgency': 'No medical action needed',
        'needsDoctor': false,
        'colorHex': '0xFF4CAF50',
      };
    }

    return predict(base64Image);
  }

  /// Validates whether the image contains skin and if it's healthy.
  Future<String?> _geminiCheckSkinCondition(String base64Image) async {
    final apiKey = _geminiApiKey;
    if (apiKey == null || apiKey.isEmpty) return null;
    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey',
    );
    const prompt = 'You are a dermatology AI assistant validating an image.\n'
      'FIRST: Does this image contain human skin or a human body part (face, arm, leg, back, hand, etc.)?\n'
      'If NO human skin is visible (e.g. animal, object, landscape, food, text), respond ONLY with: {"condition": "NO_SKIN"}\n'
      'If YES human skin is visible, is the skin completely healthy, clear, and normal with no diseases, spots, or rashes?\n'
      'If the skin is completely clear, respond ONLY with: {"condition": "CLEAR_SKIN"}\n'
      'If the skin has any disease, lesion, acne, rash, or irregularity, respond ONLY with: {"condition": "DISEASE"}\n'
      'IMPORTANT: Output ONLY raw JSON with no markdown, no backticks, no extra text.';
    
    final body = jsonEncode({
      'contents': [{
        'parts': [
          {'inline_data': {'mime_type': 'image/jpeg', 'data': base64Image}},
          {'text': prompt},
        ]
      }],
      'generationConfig': {'temperature': 0.0, 'maxOutputTokens': 300},
    });

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      ).timeout(const Duration(seconds: 20));
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final candidates = data['candidates'] as List<dynamic>?;
        if (candidates != null && candidates.isNotEmpty) {
          final parts = candidates[0]['content']['parts'] as List?;
          if (parts != null && parts.isNotEmpty) {
            String text = (parts[0]['text'] as String? ?? '').trim();
            text = text.replaceAll(RegExp(r'```[a-z]*'), '').replaceAll('```', '').trim();
            final jStart = text.indexOf('{');
            final jEnd = text.lastIndexOf('}');
            if (jStart != -1 && jEnd != -1) {
              final result = jsonDecode(text.substring(jStart, jEnd + 1)) as Map<String, dynamic>;
              return result['condition'] as String?;
            }
          }
        }
      }
    } catch (_) {}
    return null;
  }

  /// Normalize the new hybrid API response → format expected by result_screen.dart
  Map<String, dynamic> _normalizeHybridResponse(Map<String, dynamic> data) {
    final top5 = (data['top5'] as List<dynamic>? ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
    final primary   = data['primary'] as Map<String, dynamic>? ?? {};
    final gemini    = data['gemini_analysis'] as Map<String, dynamic>? ?? {};
    final cancer    = data['cancer_risk'] as Map<String, dynamic>? ?? {};
    final severity  = data['severity'] as String? ?? 'Unknown';
    final needsDoc  = data['needs_doctor'] as bool? ?? false;

    // Extract Gemini-provided fields
    final symptoms  = (gemini['symptoms'] as List<dynamic>? ?? [])
        .map((e) => e.toString()).toList();
    final skincare  = (gemini['skincare'] as List<dynamic>? ?? [])
        .map((e) => e.toString()).toList();
    final precautions = (gemini['precautions'] as List<dynamic>? ?? [])
        .map((e) => e.toString()).toList();

    return {
      // Standard fields (used by result_screen legacy layout)
      'disease':      primary['disease'] ?? 'Unknown',
      'confidence':   primary['confidence'] ?? 0.0,
      'severity':     severity,
      'risk':         cancer['cancer_risk_level'] ?? 'Unknown',
      'explanation':  gemini['explanation'] ?? '',
      'treatment':    gemini['treatment'] ?? '',
      'skincare':     skincare,
      'urgency':      gemini['consultation_advice'] ?? '',
      'needsDoctor':  needsDoc,
      'symptoms':     symptoms,
      'affected_area': 'Uploaded Area',
      'contagious':   false,
      // NEW hybrid-specific fields
      'top5':                    top5,
      'cancer_risk_score':       cancer['cancer_risk_score'] ?? 0.0,
      'cancer_risk_level':       cancer['cancer_risk_level'] ?? 'Low',
      'cancer_risk_color':       cancer['cancer_risk_color'] ?? 'green',
      'urgent_consultation':     cancer['urgent_consultation'] ?? false,
      'melanoma_confidence':     cancer['melanoma_confidence'] ?? 0.0,
      'precautions':             precautions,
      'model_used':              data['model_used'] ?? 'gemini',
      'is_hybrid':               true,
    };
  }


  /// Uses Gemini Vision to analyze the skin image and return
  /// a structured disease prediction with recommendations.
  Future<Map<String, dynamic>?> _geminiVisionPredict(String base64Image) async {
    final apiKey = _geminiApiKey;
    if (apiKey == null || apiKey.isEmpty) return null;

    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey',
    );

    const prompt = 'You are a board-certified expert dermatologist AI. '
        'Analyze the image with extreme precision. '
        'Base your diagnosis ONLY on what you can actually SEE.\n\n'
        'STEP 1 - SAFETY CHECK: Does the image contain human skin, a face, or a person?\n'
        'If NO, you MUST output "disease": "No Person Detected" and stop analysis.\n\n'
        'STEP 2 - OBSERVE: Examine the image for:\n'
        '- Color: red, pink, brown, black, white, purple, yellow?\n'
        '- Texture: smooth, rough, scaly, crusty, waxy, raised, flat?\n'
        '- Borders: well-defined, irregular, diffuse, ring-shaped?\n'
        '- Distribution: localized, multiple scattered, widespread?\n'
        '- Features: inflammation, pus, vesicles, papules, plaques?\n\n'
        'STEP 3 - DIAGNOSE: Identify the exact medical name of the skin condition.\n'
        'You are NOT limited to any list. Diagnose ANY known skin disease, condition, or infection.\n'
        'If the skin is completely healthy, output "Clear Skin".\n'
        'If no human skin is visible, output "No Person Detected".\n\n'
        'Respond ONLY with valid JSON (no markdown, no extra text):\n'
        '{"disease":"<name>","confidence":<0.70-0.97>,"severity":"<severity>","risk":"<risk>",'
        '"explanation":"<describe what you see then why this diagnosis>","treatment":"<steps>",'
        '"skincare":["<step1>","<step2>","<step3>","<step4>","<step5>"],'
        '"urgency":"<urgency>","needsDoctor":<true/false>,'
        '"affected_area":"<exact body part e.g. Left Cheek, Forehead>","contagious":<true/false>,'
        '"symptoms":["<symptom1>","<symptom2>"]}';

    final body = jsonEncode({
      'contents': [{
        'parts': [
          {'inline_data': {'mime_type': 'image/jpeg', 'data': base64Image}},
          {'text': prompt},
        ]
      }],
      'generationConfig': {'temperature': 0.1, 'maxOutputTokens': 1500},
    });

    http.Response? response;
    for (int attempt = 1; attempt <= 3; attempt++) {
      response = await http
          .post(url, headers: {'Content-Type': 'application/json'}, body: body)
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) break;

      // ignore: avoid_print
      print('[DermaSense] Gemini disease status $attempt/3: ${response.statusCode}');

      if (response.statusCode == 503 || response.statusCode == 429) {
        await Future.delayed(Duration(seconds: 2 * attempt));
        continue;
      } else {
        // ignore: avoid_print
        print('[DermaSense] Gemini error body: ${response.body}');
        return null;
      }
    }

    if (response == null || response.statusCode != 200) return null;

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final candidates = data['candidates'] as List?;
    if (candidates == null || candidates.isEmpty) return null;

    final parts = candidates[0]['content']['parts'] as List?;
    if (parts == null || parts.isEmpty) return null;

    String text = (parts[0]['text'] as String? ?? '').trim();

    // Strip markdown code fences if present
    if (text.contains('```')) {
      text = text.replaceAll(RegExp(r'```[a-z]*'), '').replaceAll('```', '').trim();
    }

    // Extract JSON object
    final jsonStart = text.indexOf('{');
    final jsonEnd = text.lastIndexOf('}');
    if (jsonStart == -1 || jsonEnd == -1) return null;
    text = text.substring(jsonStart, jsonEnd + 1);

    final result = jsonDecode(text) as Map<String, dynamic>;

    // ── CRITICAL: If Gemini says no person/skin detected, stop and throw ─────
    final diseaseName = (result['disease'] as String? ?? '').toLowerCase();
    if (diseaseName.contains('no person') ||
        diseaseName.contains('no skin') ||
        diseaseName.contains('not a human') ||
        diseaseName.contains('no human')) {
      throw Exception('NO_SKIN');
    }

    // Validate required fields
    if (!result.containsKey('disease')) result['disease'] = 'Unknown Condition';
    if (!result.containsKey('confidence')) result['confidence'] = 0.5;

    // Ensure all string fields are present
    final stringFields = ['severity', 'risk', 'explanation', 'treatment', 'urgency', 'affected_area'];
    for (final field in stringFields) {
      if (!result.containsKey(field) || result[field] == null) {
        result[field] = 'Not specified';
      } else {
        result[field] = result[field].toString();
      }
    }

    // Ensure booleans are present
    if (result['needsDoctor'] == null) result['needsDoctor'] = true;
    if (result['contagious'] == null) result['contagious'] = false;

    // Ensure list fields are properly typed List<String>
    for (final key in ['skincare', 'symptoms']) {
      if (result[key] is List) {
        result[key] = (result[key] as List).map((e) => e.toString()).toList();
      } else {
        result[key] = <String>[];
      }
    }

    return result;
  }

  /// Cosmetic-focused Grok analysis for the Skincare screen.
  /// Identifies pimples, marks, dark spots, oiliness, and recommends a routine.
  Future<Map<String, dynamic>> skincareAnalyze(String base64Image) async {
    final apiKey = _geminiApiKey;
    if (apiKey == null || apiKey.isEmpty) return _defaultSkincareResult();

    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey',
    );

    const prompt = '''You are a professional cosmetic skin analyst. Analyze this face/skin image carefully for cosmetic concerns.

STEP 1 - SAFETY CHECK: Does the image contain human skin, a face, or a person?
If NO, you MUST output "condition": "No Person Detected" and stop analysis.

Identify the main skin concern from this list:
- Clear Skin (healthy, no visible issues)
- Acne & Pimples (active breakouts, whiteheads, blackheads)
- Post-Acne Marks & Scars (dark spots, red marks from healed pimples)
- Hyperpigmentation & Dark Spots (uneven skin tone, dark patches)
- Oily Skin (shiny, enlarged pores)
- Dry & Dehydrated Skin (flaky, tight, dull)
- Combination Skin (oily T-zone, dry cheeks)
- Wrinkles & Fine Lines (aging signs, expression lines)
- Redness & Sensitivity (red patches, irritation)
- Dull & Uneven Skin Tone (lack of glow, uneven complexion)
- No Person Detected (not a human or no skin visible)

Respond ONLY with this exact JSON format (no markdown, no explanation):
{
  "condition": "<condition name exactly as listed>",
  "confidence": <0.70 to 0.97>,
  "observations": "<2 sentences describing exactly what you visually see in the image>",
  "morning_routine": ["<step 1>", "<step 2>", "<step 3>", "<step 4>", "<step 5>"],
  "night_routine": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],
  "key_ingredients": ["<ingredient 1>", "<ingredient 2>", "<ingredient 3>"],
  "avoid": ["<thing to avoid 1>", "<thing to avoid 2>"],
  "tip": "<one personalized skin tip based on what you see>",
  "skin_type_detected": "<Oily | Dry | Combination | Normal>",
  "hydration_level": "<Dehydrated | Normal | Well-Hydrated>"
}''';

    final body = jsonEncode({
      'contents': [{
        'parts': [
          {'inline_data': {'mime_type': 'image/jpeg', 'data': base64Image}},
          {'text': prompt},
        ]
      }],
      'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 1024},
    });

    try {
      http.Response? response;
      for (int attempt = 1; attempt <= 3; attempt++) {
        response = await http
            .post(url, headers: {'Content-Type': 'application/json'}, body: body)
            .timeout(const Duration(seconds: 30));

        if (response.statusCode == 200) break;

        // ignore: avoid_print
        print('[DermaSense] Gemini skincare status $attempt/3: ${response.statusCode}');
        
        if (response.statusCode == 503 || response.statusCode == 429) {
          await Future.delayed(Duration(seconds: 2 * attempt));
          continue;
        } else {
          return _defaultSkincareResult();
        }
      }

      if (response == null || response.statusCode != 200) return _defaultSkincareResult();

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final candidates = data['candidates'] as List?;
      if (candidates == null || candidates.isEmpty) return _defaultSkincareResult();

      final parts = candidates[0]['content']['parts'] as List?;
      if (parts == null || parts.isEmpty) return _defaultSkincareResult();

      String text = (parts[0]['text'] as String? ?? '').trim();
      if (text.contains('```')) {
        text = text.replaceAll(RegExp(r'```[a-z]*'), '').replaceAll('```', '').trim();
      }
      final jsonStart = text.indexOf('{');
      final jsonEnd = text.lastIndexOf('}');
      if (jsonStart == -1 || jsonEnd == -1) return _defaultSkincareResult();
      text = text.substring(jsonStart, jsonEnd + 1);

      final result = jsonDecode(text) as Map<String, dynamic>;
      if (!result.containsKey('condition')) return _defaultSkincareResult();

      // ── Skin / Person Validation ─────────────────────────────────────────
      final cond = (result['condition'] as String? ?? '').toLowerCase();
      if (cond.contains('no person') || cond.contains('no skin')) {
        throw Exception('NO_SKIN');
      }

      // Ensure all list fields are List<String>
      for (final key in ['morning_routine', 'night_routine', 'key_ingredients', 'avoid']) {
        if (result[key] is List) {
          result[key] = (result[key] as List).map((e) => e.toString()).toList();
        } else {
          result[key] = <String>[];
        }
      }
      return result;
    } catch (e) {
      if (e.toString().contains('NO_SKIN')) rethrow;
      // ignore: avoid_print
      print('[DermaSense] Skincare analyze error: $e');
      return _defaultSkincareResult();
    }
  }

  Map<String, dynamic> _defaultSkincareResult() {
    return {
      'condition': 'Analysing...',
      'confidence': 0.0,
      'observations': 'Could not analyse image. Please ensure your API key is set correctly.',
      'morning_routine': [
        'Gentle cleanser',
        'Toner',
        'Moisturiser',
        'SPF 30+ sunscreen',
      ],
      'night_routine': [
        'Gentle cleanser',
        'Serum (Vitamin C or Retinol)',
        'Eye cream',
        'Night moisturiser',
      ],
      'key_ingredients': ['Niacinamide', 'Hyaluronic Acid', 'SPF'],
      'avoid': ['Harsh scrubs', 'Alcohol-based toners'],
      'tip': 'A consistent routine is the key to healthy skin.',
    };
  }

  /// Smart local analysis using pixel color & texture heuristics.
  /// Used only when Gemini API is unavailable.
  /// NOTE: This fallback has no skin detection, so it is ONLY
  /// called when Gemini is unavailable. In that case we return a
  /// warning instead of a false disease result.
  Map<String, dynamic> _smartLocalAnalysis(String base64Image) {
    // When Gemini is unavailable, we cannot verify if it is skin —
    // throw NO_SKIN so the user is prompted to try again with API.
    throw Exception('NO_SKIN_NO_API');
  }

  /// Internal pixel analysis — only called explicitly in tests.
  Map<String, dynamic> _smartLocalAnalysisDirect(String base64Image) {
    try {
      final bytes = base64Decode(base64Image);
      final decodedImage = img.decodeImage(bytes);
      if (decodedImage == null) return _healthySkinResult();

      final resized = img.copyResize(decodedImage, width: 150, height: 150);
      final total = resized.width * resized.height;

      double totalR = 0, totalG = 0, totalB = 0;
      final List<double> brightnessValues = [];
      int redPixels = 0;
      int darkPixels = 0;
      int whitePixels = 0;
      int brownPixels = 0;
      int pinkPixels = 0;

      for (int y = 0; y < resized.height; y++) {
        for (int x = 0; x < resized.width; x++) {
          final pixel = resized.getPixel(x, y);
          final r = pixel.r.toDouble();
          final g = pixel.g.toDouble();
          final b = pixel.b.toDouble();
          totalR += r;
          totalG += g;
          totalB += b;
          final brightness = (r + g + b) / 3.0;
          brightnessValues.add(brightness);
          // Detect various color signatures
          if (r > g * 1.3 && r > b * 1.3 && r > 130) redPixels++;       // red/inflamed
          if (brightness < 80) darkPixels++;                              // dark patches
          if (brightness > 210 && r > 190 && g > 190 && b > 190) whitePixels++; // white patches
          if (r > 120 && g > 80 && b < 80 && r > g * 1.1) brownPixels++; // brown spots
          if (r > 180 && g > 140 && b > 140 && r > g + 25) pinkPixels++; // pink/rosy
        }
      }

      final avgR = totalR / total;
      final avgG = totalG / total;
      final avgB = totalB / total;
      final avgBrightness = (avgR + avgG + avgB) / 3.0;

      double varianceSum = 0;
      for (final v in brightnessValues) {
        varianceSum += (v - avgBrightness) * (v - avgBrightness);
      }
      final variance = varianceSum / total;
      final redDominance = avgR - ((avgG + avgB) / 2.0);
      final redPixelRatio = redPixels / total;
      final darkPixelRatio = darkPixels / total;
      final whitePixelRatio = whitePixels / total;
      final brownPixelRatio = brownPixels / total;
      final pinkPixelRatio = pinkPixels / total;

      // ── Priority disease detection based on pixel signatures ──────────────
      // Acne: High redness + high variance (bumpy red spots)
      if (redPixelRatio > 0.22 && variance > 600) {
        return _acneResult();
      }
      // Psoriasis: Very high variance + silvery/bright patches + some dark areas
      if (variance > 900 && whitePixelRatio > 0.12 && darkPixelRatio > 0.05) {
        return _getDisease('Psoriasis');
      }
      // Rosacea: Diffuse pink/redness + low variance (smooth flush)
      if (pinkPixelRatio > 0.28 && variance < 600 && redDominance > 15) {
        return _rosaceaResult();
      }
      // Vitiligo: Very bright white patches against darker background
      if (whitePixelRatio > 0.20 && darkPixelRatio > 0.10) {
        return _getDisease('Vitiligo');
      }
      // Hyperpigmentation: Brown dominant patches
      if (brownPixelRatio > 0.25) {
        return _getDisease('Hyperpigmentation');
      }
      // Eczema: Moderate redness + very high variance (rough patchy)
      if (redDominance > 10 && variance > 750 && redPixelRatio < 0.22) {
        return _getDisease('Atopic Dermatitis (Eczema)');
      }
      // Seborrheic Dermatitis: Yellowish + oily look (high avg brightness, yellowish tint)
      if (avgR > avgB * 1.2 && avgG > avgB * 1.1 && avgBrightness > 140 && variance > 400) {
        return _getDisease('Seborrheic Dermatitis');
      }
      // Melanoma / Dark lesion: Very dark concentrated patches
      if (darkPixelRatio > 0.30 && variance > 700) {
        return _getDisease('Melanocytic Nevi');
      }
      // Clear/healthy skin: Very bright and uniform, low variance
      if (avgBrightness > 170 && variance < 350 && redPixelRatio < 0.10) {
        return _healthySkinResult();
      }
      // Moderate redness without much variance = Contact Dermatitis
      if (redDominance > 8 && variance < 600 && redPixelRatio > 0.12) {
        return _getDisease('Contact Dermatitis');
      }

      // Final fallback: Use multiple image metrics as seed for variety
      final seed = (avgR * 31 + avgG * 17 + avgB * 7 + variance * 0.1).toInt().abs();
      final candidates = [
        'Acne Vulgaris',
        'Atopic Dermatitis (Eczema)',
        'Seborrheic Dermatitis',
        'Hyperpigmentation',
        'Contact Dermatitis',
        'Rosacea',
        'Psoriasis',
        'Urticaria (Hives)',
        'Clear Skin',
      ];
      return _getDisease(candidates[seed % candidates.length]);
    } catch (e) {
      // ignore: avoid_print
      print('[DermaSense] Local analysis error: $e');
      return _healthySkinResult();
    }
  }

  Map<String, dynamic> _getDisease(String name) {
    return _diseases.firstWhere(
      (d) => d['disease'] == name,
      orElse: () => _healthySkinResult(),
    );
  }

  Map<String, dynamic> _healthySkinResult() {
    return {
      'disease': 'Clear Skin',
      'confidence': 0.95,
      'severity': 'None — Healthy',
      'risk': 'No Risk',
      'explanation':
          'No significant skin disease was detected in this image. Your skin appears healthy and clear! Continue with good skincare habits to maintain it.',
      'treatment':
          'No treatment needed. Maintain your current skincare routine, stay hydrated, wear sunscreen daily, and schedule annual dermatology check-ups.',
      'skincare': [
        'Apply broad-spectrum SPF 30+ sunscreen every morning',
        'Cleanse gently twice daily with a pH-balanced cleanser',
        'Moisturize daily to maintain your skin barrier',
        'Drink plenty of water and eat antioxidant-rich foods',
      ],
      'urgency': 'Your skin looks great! No urgent doctor visit needed.',
      'needsDoctor': false,
      'colorHex': '0xFF66BB6A',
    };
  }

  Map<String, dynamic> _rosaceaResult() {
    return {
      'disease': 'Rosacea',
      'confidence': 0.82,
      'severity': 'Mild to Moderate',
      'risk': 'Low-Moderate Risk',
      'explanation':
          'The image shows persistent redness and visible blood vessels characteristic of rosacea. It tends to be cyclic — flaring for weeks to months then diminishing.',
      'treatment':
          '• Topical metronidazole or azelaic acid cream\n• Avoid known triggers (sun, hot drinks, spicy food, alcohol)\n• Gentle skincare routine only with hypoallergenic products\n• Oral antibiotics (doxycycline) during severe flares',
      'skincare': [
        'Gentle, soap-free cleanser (twice daily)',
        'Fragrance-free, calming moisturizer with niacinamide',
        'Physical SPF 50+ sunscreen (zinc oxide)',
        'Use cool water only — avoid hot showers',
        'Anti-inflammatory diet (omega-3 rich foods)',
      ],
      'urgency': 'Consult a dermatologist for a personalized treatment plan.',
      'needsDoctor': true,
      'colorHex': '0xFFEF5350',
    };
  }

  Map<String, dynamic> _acneResult() {
    return {
      'disease': 'Acne Vulgaris',
      'confidence': 0.88,
      'severity': 'Mild to Moderate',
      'risk': 'Low Risk',
      'explanation':
          'The image shows signs of Acne Vulgaris — a common inflammatory condition characterized by comedones, papules, or pustules. It occurs when hair follicles become plugged with oil and dead skin cells.',
      'treatment':
          '• Apply benzoyl peroxide 2.5–5% gel once daily\n• Use salicylic acid cleanser morning & night\n• Apply topical retinoid (adapalene) at bedtime\n• Oral antibiotics if prescribed by a dermatologist\n• Avoid squeezing or picking lesions to prevent scarring',
      'skincare': [
        'Gentle foaming cleanser (morning & night)',
        'Oil-free, non-comedogenic moisturizer',
        'SPF 30+ sunscreen every morning',
        'Salicylic acid 2% toner (morning)',
        'Retinol/adapalene spot treatment (night)',
      ],
      'urgency': 'Schedule an appointment within 1–2 months if no improvement.',
      'needsDoctor': false,
      'colorHex': '0xFFFF7043',
    };
  }

  /// Analyze skin type from a face photo using pixel color/texture analysis.
  /// Returns skin type detected by Gemini AI, or 'NO_FACE' if no face detected.
  Future<String> predictSkinType(String base64Image) async {
    // Try Gemini first for face detection + skin type
    if (_geminiApiKey != null && _geminiApiKey!.isNotEmpty) {
      try {
        final geminiType = await _geminiPredictSkinType(base64Image);
        if (geminiType != null) return geminiType;
      } catch (_) {}
    }
    // Fallback: local pixel analysis (no face detection)
    return _localPredictSkinType(base64Image);
  }

  Future<String?> _geminiPredictSkinType(String base64Image) async {
    final apiKey = _geminiApiKey;
    if (apiKey == null || apiKey.isEmpty) return null;
    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey',
    );
    
    const prompt = 'You are a dermatology AI assistant.\n'
      'FIRST: Does this image contain a human face? Answer strictly with JSON only.\n'
      'If NO face or no human skin is visible, respond: {"skin_type": "NO_FACE"}\n'
      'If YES a face is visible, analyze the skin and respond with one of these exact skin types:\n'
      '- Oily (shiny, enlarged pores, sebum visible)\n'
      '- Dry (flaky, tight-looking, dull)\n'
      '- Combination (oily T-zone, dry cheeks)\n'
      '- Sensitive (redness, visible capillaries, irritation)\n'
      '- Normal (balanced, healthy glow)\n'
      'Respond ONLY with valid JSON: {"skin_type": "<type>"}';

    final body = jsonEncode({
      'contents': [{
        'parts': [
          {'inline_data': {'mime_type': 'image/jpeg', 'data': base64Image}},
          {'text': prompt},
        ]
      }],
      'generationConfig': {'temperature': 0.1, 'maxOutputTokens': 100},
    });

    final response = await http
        .post(url, headers: {'Content-Type': 'application/json'}, body: body)
        .timeout(const Duration(seconds: 20));
        
    if (response.statusCode != 200) return null;
    
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final candidates = data['candidates'] as List?;
    if (candidates == null || candidates.isEmpty) return null;

    final parts = candidates[0]['content']['parts'] as List?;
    if (parts == null || parts.isEmpty) return null;
    
    String text = (parts[0]['text'] as String? ?? '').trim();
    text = text.replaceAll(RegExp(r'```[a-z]*'), '').replaceAll('```', '').trim();
    
    final jStart = text.indexOf('{');
    final jEnd = text.lastIndexOf('}');
    if (jStart == -1 || jEnd == -1) return null;
    
    final result = jsonDecode(text.substring(jStart, jEnd + 1)) as Map<String, dynamic>;
    return result['skin_type'] as String?;
  }

  String _localPredictSkinType(String base64Image) {
    try {
      final bytes = base64Decode(base64Image);
      final decoded = img.decodeImage(bytes);
      if (decoded == null) return 'Normal';
      final resized = img.copyResize(decoded, width: 128, height: 128);
      final total = resized.width * resized.height;
      double totalR = 0, totalG = 0, totalB = 0;
      final List<double> bvals = [];
      final List<double> svals = [];
      for (int y = 0; y < resized.height; y++) {
        for (int x = 0; x < resized.width; x++) {
          final pixel = resized.getPixel(x, y);
          final r = pixel.r.toDouble();
          final g = pixel.g.toDouble();
          final b = pixel.b.toDouble();
          totalR += r; totalG += g; totalB += b;
          bvals.add((r + g + b) / 3.0);
          final maxC = [r, g, b].reduce((a, b) => a > b ? a : b);
          final minC = [r, g, b].reduce((a, b) => a < b ? a : b);
          svals.add(maxC > 0 ? (maxC - minC) / maxC : 0.0);
        }
      }
      final avgR = totalR / total;
      final avgG = totalG / total;
      final avgB = totalB / total;
      final avgBrightness = (avgR + avgG + avgB) / 3.0;
      double varSum = 0;
      for (final v in bvals) { varSum += (v - avgBrightness) * (v - avgBrightness); }
      final variance = varSum / total;
      final avgSat = svals.reduce((a, b) => a + b) / total;
      final redDom = avgR - ((avgG + avgB) / 2.0);
      if (redDom > 18.0) return 'Sensitive';
      if (avgBrightness > 160 && variance < 400) return 'Oily';
      if (avgBrightness < 110 || (variance > 800 && avgSat < 0.3)) return 'Dry';
      if (avgBrightness > 140 && variance > 400 && variance < 800) return 'Combination';
      return 'Normal';
    } catch (_) { return 'Normal'; }
  }

  /// Returns a complete skincare plan for the given skin type.
  Map<String, dynamic> getSkincarePlan(String skinType) {
    final oily = <String, dynamic>{
      'description': 'Oily skin produces excess sebum leading to shine, enlarged pores, and breakouts. Control oil without stripping moisture.',
      'morning': [
        {'product': 'Gel Cleanser', 'how': 'Gentle foaming or gel cleanser. Avoid bar soaps.'},
        {'product': 'Salicylic Acid Toner 2%', 'how': 'Cotton pad on face to minimize pores and control oil.'},
        {'product': 'Niacinamide Serum 10%', 'how': '2-3 drops pressed into skin. Regulates sebum production.'},
        {'product': 'Oil-Free Gel Moisturizer', 'how': 'Water-based moisturizer. Oily skin still needs hydration.'},
        {'product': 'Matte SPF 30+ Sunscreen', 'how': 'Mattifying oil-free formula applied last.'},
      ],
      'night': [
        {'product': 'Gel Cleanser', 'how': 'Double cleanse if you wore sunscreen or makeup.'},
        {'product': 'BHA Exfoliant (2-3x/week)', 'how': 'Salicylic acid to unclog pores and reduce blackheads.'},
        {'product': 'Retinol 0.1-0.5%', 'how': 'Unclogs pores and controls oil production long-term.'},
        {'product': 'Oil-Free Night Gel', 'how': 'Light gel moisturizer to maintain overnight hydration.'},
      ],
      'products': [
        {'emoji': '🧼', 'name': 'CeraVe Foaming Cleanser', 'brand': 'CeraVe', 'desc': 'Removes excess oil without over-drying. Fragrance-free.', 'price': 'Rs.650-900', 'buyUrl': 'https://www.amazon.in/s?k=CeraVe+Foaming+Cleanser'},
        {'emoji': '💊', 'name': 'Minimalist Niacinamide 10%', 'brand': 'Minimalist', 'desc': 'Controls sebum, reduces pores, brightens skin. Best value.', 'price': 'Rs.399-599', 'buyUrl': 'https://www.amazon.in/s?k=Minimalist+Niacinamide+10'},
        {'emoji': '💧', 'name': 'Paulas Choice 2% BHA', 'brand': 'Paulas Choice', 'desc': 'Exfoliating toner to unclog pores and control shine.', 'price': 'Rs.3500-4200', 'buyUrl': 'https://www.amazon.in/s?k=Paulas+Choice+2%25+BHA+Liquid'},
        {'emoji': '🌞', 'name': 'Neutrogena Clear Face SPF 55', 'brand': 'Neutrogena', 'desc': 'Oil-free non-comedogenic sunscreen. No breakouts.', 'price': 'Rs.750-1100', 'buyUrl': 'https://www.amazon.in/s?k=Neutrogena+Clear+Face+SPF'},
        {'emoji': '🌙', 'name': 'La Roche-Posay Effaclar Mat', 'brand': 'La Roche-Posay', 'desc': 'Mattifying moisturizer that controls shine all day.', 'price': 'Rs.1800-2200', 'buyUrl': 'https://www.amazon.in/s?k=La+Roche-Posay+Effaclar+Mat'},
      ],
      'ingredientsToUse': ['Salicylic Acid', 'Niacinamide', 'Retinol', 'Hyaluronic Acid', 'Zinc', 'Glycolic Acid'],
      'ingredientsToAvoid': ['Coconut Oil', 'Heavy Shea Butter', 'Lanolin', 'Petrolatum', 'Fragrance'],
      'tips': [
        'Blot excess oil with oil-absorbing sheets -- do not wipe or rub.',
        'Use a clay mask once or twice a week to deep-cleanse pores.',
        'Never skip moisturizer -- dehydrated skin produces even more oil.',
        'Change your pillowcase twice a week to prevent bacteria buildup.',
        'Avoid over-washing -- twice a day maximum.',
      ],
    };

    final dry = <String, dynamic>{
      'description': 'Dry skin produces less sebum, feeling tight, looking dull or flaky. Focus on deep hydration, restoring skin barrier, and locking in moisture.',
      'morning': [
        {'product': 'Cream/Milk Cleanser', 'how': 'Gentle hydrating cleanser. Avoid foaming types.'},
        {'product': 'Hydrating Toner/Essence', 'how': 'Pat onto damp skin for deep absorption.'},
        {'product': 'Hyaluronic Acid Serum', 'how': 'Apply to damp skin to attract and hold moisture.'},
        {'product': 'Rich Ceramide Moisturizer', 'how': 'Thick cream to lock in moisture and repair barrier.'},
        {'product': 'Hydrating SPF 30+ Sunscreen', 'how': 'Choose a moisturizing formula for extra nourishment.'},
      ],
      'night': [
        {'product': 'Cream Cleanser', 'how': 'Gentle cleanse with lukewarm water. No hot water.'},
        {'product': 'Hyaluronic Acid Serum', 'how': 'Apply to damp skin for overnight deep hydration.'},
        {'product': 'Peptide/Bakuchiol Serum', 'how': 'Gentle anti-aging alternative to retinol.'},
        {'product': 'Thick Night Cream', 'how': 'Rich occlusive cream as last step to seal all moisture in.'},
      ],
      'products': [
        {'emoji': '🧴', 'name': 'CeraVe Moisturizing Cream', 'brand': 'CeraVe', 'desc': 'Rich ceramide cream repairing skin barrier. Fragrance-free.', 'price': 'Rs.799-1200', 'buyUrl': 'https://www.amazon.in/s?k=CeraVe+Moisturizing+Cream'},
        {'emoji': '💧', 'name': 'The Ordinary Hyaluronic Acid 2%', 'brand': 'The Ordinary', 'desc': 'Deep hydration serum. Apply to damp skin always.', 'price': 'Rs.750-950', 'buyUrl': 'https://www.amazon.in/s?k=The+Ordinary+Hyaluronic+Acid+2%25'},
        {'emoji': '🌹', 'name': 'Kama Ayurveda Rosehip Oil', 'brand': 'Kama Ayurveda', 'desc': 'Natural facial oil locking in moisture and reducing flakiness.', 'price': 'Rs.1295-1600', 'buyUrl': 'https://www.amazon.in/s?k=Kama+Ayurveda+Rosehip+Oil'},
        {'emoji': '🌙', 'name': 'Laneige Water Sleeping Mask', 'brand': 'Laneige', 'desc': 'Overnight hydrating mask replenishing moisture as you sleep.', 'price': 'Rs.2500-3200', 'buyUrl': 'https://www.amazon.in/s?k=Laneige+Water+Sleeping+Mask'},
        {'emoji': '🌞', 'name': 'Bioderma Photoderm Moisturizing SPF50', 'brand': 'Bioderma', 'desc': 'Hydrating sunscreen nourishing while protecting skin.', 'price': 'Rs.1200-1800', 'buyUrl': 'https://www.amazon.in/s?k=Bioderma+Photoderm+SPF+50'},
      ],
      'ingredientsToUse': ['Hyaluronic Acid', 'Ceramides', 'Glycerin', 'Squalane', 'Shea Butter', 'Peptides', 'Aloe Vera'],
      'ingredientsToAvoid': ['Alcohol (denat)', 'Strong AHAs', 'Sulfates SLS', 'Fragrance', 'Menthol', 'Camphor'],
      'tips': [
        'Apply moisturizer within 60 seconds of washing your face.',
        'Use a humidifier in your bedroom especially in winter.',
        'Drink at least 8-10 glasses of water daily.',
        'Take short lukewarm showers -- hot water strips skin oils.',
        'Eat omega-3 rich foods like walnuts, flaxseeds, and salmon.',
      ],
    };

    final sensitive = <String, dynamic>{
      'description': 'Sensitive skin reacts easily to environmental factors and ingredients -- redness, burning, or itching. Use minimal, gentle ingredients and avoid known irritants.',
      'morning': [
        {'product': 'Fragrance-Free Gentle Cleanser', 'how': 'Mild soap-free cleanser with lukewarm water only.'},
        {'product': 'Calming Toner (Rose Water/Centella)', 'how': 'Pat gently with fingertips to soothe redness.'},
        {'product': 'Centella Asiatica Serum', 'how': 'Calms inflammation and reduces visible redness.'},
        {'product': 'Ceramide Moisturizer (Fragrance-Free)', 'how': 'Strengthens skin barrier to reduce sensitivity over time.'},
        {'product': 'Mineral Sunscreen SPF 30+ (Zinc Oxide)', 'how': 'Gentler than chemical filters for reactive skin types.'},
      ],
      'night': [
        {'product': 'Micellar Water + Gentle Cleanser', 'how': 'Double cleanse very gently without rubbing or tugging.'},
        {'product': 'Niacinamide Serum 5%', 'how': 'Reduces inflammation and redness overnight. Start at 5%.'},
        {'product': 'Calming Night Cream', 'how': 'Rich fragrance-free barrier cream for overnight repair.'},
        {'product': 'Colloidal Oatmeal Balm (if needed)', 'how': 'Apply to reactive spots only for instant soothing.'},
      ],
      'products': [
        {'emoji': '🌿', 'name': 'La Roche-Posay Toleriane Cleanser', 'brand': 'La Roche-Posay', 'desc': 'Ultra-gentle cleanser for reactive and sensitive skin.', 'price': 'Rs.900-1200', 'buyUrl': 'https://www.amazon.in/s?k=La+Roche+Posay+Toleriane+Cleanser'},
        {'emoji': '🫧', 'name': 'COSRX Centella Blemish Cream', 'brand': 'COSRX', 'desc': 'Centella calms redness and heals skin quickly.', 'price': 'Rs.800-1100', 'buyUrl': 'https://www.amazon.in/s?k=COSRX+Centella+Blemish+Cream'},
        {'emoji': '💊', 'name': 'Minimalist Azelaic Acid 10%', 'brand': 'Minimalist', 'desc': 'Reduces redness, rosacea, and uneven tone gently.', 'price': 'Rs.399-599', 'buyUrl': 'https://www.amazon.in/s?k=Minimalist+Azelaic+Acid+10'},
        {'emoji': '☀️', 'name': 'Altruist Mineral Sunscreen SPF 50', 'brand': 'Altruist', 'desc': 'Gentle mineral sunscreen for sensitive skin.', 'price': 'Rs.500-800', 'buyUrl': 'https://www.amazon.in/s?k=Altruist+Mineral+Sunscreen+SPF+50'},
        {'emoji': '🌙', 'name': 'Avene Skin Recovery Cream', 'brand': 'Avene', 'desc': 'Soothes repairs and protects highly sensitive skin overnight.', 'price': 'Rs.1500-2000', 'buyUrl': 'https://www.amazon.in/s?k=Avene+Skin+Recovery+Cream'},
      ],
      'ingredientsToUse': ['Centella Asiatica', 'Niacinamide 5%', 'Ceramides', 'Aloe Vera', 'Azelaic Acid', 'Colloidal Oatmeal', 'Zinc Oxide'],
      'ingredientsToAvoid': ['Fragrance/Parfum', 'Alcohol denat', 'Strong Retinoids', 'High AHAs', 'Essential Oils', 'Menthol', 'SLS/SLES'],
      'tips': [
        'Introduce one new product at a time -- wait 2 weeks before adding another.',
        'Always do a patch test on your inner arm before face application.',
        'Use fragrance-free laundry detergent for pillowcases and towels.',
        'Avoid touching, rubbing, or scratching your face throughout the day.',
        'Keep a skin diary to identify your personal triggers.',
      ],
    };

    final normal = <String, dynamic>{
      'description': 'Normal skin has balanced oil and moisture, small pores, smooth texture. Focus on maintaining this balance and protecting against premature aging.',
      'morning': [
        {'product': 'Gentle Cleanser', 'how': 'Mild gel or cream cleanser once in the morning.'},
        {'product': 'Vitamin C Serum 10-15%', 'how': '3-4 drops pressed into skin. Brightens and protects.'},
        {'product': 'Lightweight Moisturizer', 'how': 'Balanced moisturizer with hyaluronic acid.'},
        {'product': 'SPF 30+ Sunscreen', 'how': 'Daily sun protection -- the number 1 anti-aging step.'},
      ],
      'night': [
        {'product': 'Gentle Cleanser', 'how': 'Remove daily sunscreen and pollution at end of day.'},
        {'product': 'Retinol Serum 0.025-0.1%', 'how': 'Use 2-3 nights per week to maintain healthy skin.'},
        {'product': 'Peptide Night Moisturizer', 'how': 'Nourishing cream supporting overnight skin repair.'},
      ],
      'products': [
        {'emoji': '✨', 'name': 'Minimalist Vitamin C 10%', 'brand': 'Minimalist', 'desc': 'Brightening serum with stable ethyl ascorbic acid.', 'price': 'Rs.599-799', 'buyUrl': 'https://www.amazon.in/s?k=Minimalist+Vitamin+C+10'},
        {'emoji': '💧', 'name': 'Neutrogena Hydro Boost', 'brand': 'Neutrogena', 'desc': 'Lightweight hyaluronic acid gel for all-day hydration.', 'price': 'Rs.900-1200', 'buyUrl': 'https://www.amazon.in/s?k=Neutrogena+Hydro+Boost+Gel+Cream'},
        {'emoji': '🌙', 'name': 'Minimalist Retinol 0.2%', 'brand': 'Minimalist', 'desc': 'Gentle retinol maintaining skin health and preventing aging.', 'price': 'Rs.449-699', 'buyUrl': 'https://www.amazon.in/s?k=Minimalist+Retinol+0.2'},
        {'emoji': '☀️', 'name': 'Requil Ultra Matte SPF 50', 'brand': 'Requil', 'desc': 'Lightweight daily sunscreen with no white cast.', 'price': 'Rs.450-600', 'buyUrl': 'https://www.amazon.in/s?k=Re%27equil+Ultra+Matte+SPF+50'},
        {'emoji': '🌿', 'name': 'Simple Kind to Skin Moisturizer', 'brand': 'Simple', 'desc': 'Gentle effective daily moisturizer with no harsh chemicals.', 'price': 'Rs.350-550', 'buyUrl': 'https://www.amazon.in/s?k=Simple+Kind+to+Skin+Moisturizer'},
      ],
      'ingredientsToUse': ['Vitamin C', 'Retinol', 'Hyaluronic Acid', 'Peptides', 'Niacinamide', 'SPF', 'Antioxidants'],
      'ingredientsToAvoid': ['Heavy Fragrance', 'Harsh Surfactants', 'Very High AHAs without tolerance building'],
      'tips': [
        'Stay consistent -- the best routine is one you follow every single day.',
        'Eat antioxidant-rich foods like berries, green tea, and dark chocolate.',
        'Get 7-8 hours of sleep -- that is when your skin repairs itself.',
        'Clean your phone screen regularly since it touches your face daily.',
        'Visit a dermatologist once a year for a professional skin check.',
      ],
    };

    final combination = <String, dynamic>{
      'description': 'Combination skin has an oily T-zone (forehead nose chin) and normal or dry cheeks. Balance oil control in some areas while hydrating others.',
      'morning': [
        {'product': 'Balancing Gel Cleanser', 'how': 'Gentle gel working for both oily and drier areas.'},
        {'product': 'Niacinamide Toner', 'how': 'Balances sebum production without drying cheeks.'},
        {'product': 'Lightweight Serum', 'how': 'Hyaluronic acid plus niacinamide for balanced hydration.'},
        {'product': 'Zone-Specific Moisturizer', 'how': 'Light gel on T-zone, richer cream on dry cheeks.'},
        {'product': 'SPF 30+ Balanced Sunscreen', 'how': 'Not too oily or drying -- a balanced formula.'},
      ],
      'night': [
        {'product': 'Balancing Cleanser', 'how': 'Gentle cleanse removing all oil and impurities.'},
        {'product': 'BHA Toner on T-zone only', 'how': 'Apply salicylic acid only on your oily areas.'},
        {'product': 'Niacinamide/Retinol Serum', 'how': 'Apply all over to regulate skin balance evenly.'},
        {'product': 'Zone-Based Night Cream', 'how': 'Light on T-zone, richer on cheeks and jawline.'},
      ],
      'products': [
        {'emoji': '🧼', 'name': 'Simple Refreshing Facial Wash', 'brand': 'Simple', 'desc': 'pH-balanced cleanser suitable for combination skin.', 'price': 'Rs.250-450', 'buyUrl': 'https://www.amazon.in/s?k=Simple+Refreshing+Facial+Wash'},
        {'emoji': '💊', 'name': 'Minimalist Niacinamide 10%', 'brand': 'Minimalist', 'desc': 'Balances T-zone oil without drying cheeks.', 'price': 'Rs.399-599', 'buyUrl': 'https://www.amazon.in/s?k=Minimalist+Niacinamide+10'},
        {'emoji': '🌙', 'name': 'Olay Regenerist Night Cream', 'brand': 'Olay', 'desc': 'Balanced night moisturizer perfect for combination skin.', 'price': 'Rs.799-1200', 'buyUrl': 'https://www.amazon.in/s?k=Olay+Regenerist+Night+Cream'},
        {'emoji': '☀️', 'name': 'Ponds Light Moisturizer SPF 15', 'brand': 'Ponds', 'desc': 'Lightweight daily SPF suitable for combination skin.', 'price': 'Rs.200-350', 'buyUrl': 'https://www.amazon.in/s?k=Ponds+Light+Moisturizer+SPF'},
        {'emoji': '💧', 'name': 'Bioderma Sebium Hydra', 'brand': 'Bioderma', 'desc': 'Specific moisturizer for combination skin with hydration.', 'price': 'Rs.1100-1500', 'buyUrl': 'https://www.amazon.in/s?k=Bioderma+Sebium+Hydra'},
      ],
      'ingredientsToUse': ['Niacinamide', 'Salicylic Acid', 'Hyaluronic Acid', 'Ceramides', 'Glycerin', 'Zinc'],
      'ingredientsToAvoid': ['Heavy Oils on T-zone', 'Stripping Cleansers', 'High Alcohol Toners', 'Fragrance', 'Petrolatum on T-zone'],
      'tips': [
        'Apply different products to different zones -- this is called zone skincare.',
        'Use a clay mask only on the T-zone not on cheeks.',
        'Avoid over-exfoliating -- once or twice a week is sufficient.',
        'Use blotting papers on T-zone during the day instead of re-washing.',
        'Drink plenty of water -- internal hydration helps balance combination skin.',
      ],
    };

    switch (skinType) {
      case 'Oily': return oily;
      case 'Dry': return dry;
      case 'Sensitive': return sensitive;
      case 'Combination': return combination;
      default: return normal;
    }
  }
}
