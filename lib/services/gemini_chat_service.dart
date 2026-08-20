// lib/services/gemini_chat_service.dart
// DermaSense AI Chat Service — Offline, keyword-based responses (no API key needed)

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message_model.dart';

final geminiChatServiceProvider =
    Provider<GeminiChatService>((ref) => GeminiChatService());

class GeminiChatService {
  /// Sends a message and returns a detailed dermatology response.
  /// No API key required — fully offline intelligent responses.
  Future<String> sendMessage(
    String userMessage,
    List<ChatMessageModel> history,
  ) async {
    // Small delay to simulate thinking (feels natural)
    await Future.delayed(const Duration(milliseconds: 600));
    return _getResponse(userMessage.toLowerCase().trim());
  }

  String _getResponse(String q) {
    // ── Greetings ───────────────────────────────────────────────────────────
    if (_matches(q, ['hi', 'hello', 'hey', 'hii', 'helo', 'good morning', 'good evening', 'namaste'])) {
      return '👋 **Hello! I\'m DermaSense AI**, your personal skin health assistant.\n\n'
          'I can help you with:\n'
          '• 🔬 Skin disease information & symptoms\n'
          '• 💊 Treatment & medication guidance\n'
          '• 🌿 Personalized skincare routines\n'
          '• 🧴 Ingredient analysis\n'
          '• 🩺 When to see a dermatologist\n\n'
          'What skin concern can I help you with today? 🌟';
    }

    // ── Oily Skin ────────────────────────────────────────────────────────────
    if (_matches(q, ['oily skin', 'oily face', 'shiny skin', 'greasy skin', 'morning routine oily', 'oily routine'])) {
      return '✨ **Best Routine for Oily Skin**\n\n'
          '☀️ **Morning Routine:**\n'
          '• Foaming/gel cleanser (salicylic acid 0.5–2%)\n'
          '• Niacinamide 10% toner to control oil\n'
          '• Oil-free moisturizer (gel-based)\n'
          '• SPF 50+ matte sunscreen (non-comedogenic)\n\n'
          '🌙 **Night Routine:**\n'
          '• Double cleanse: oil cleanser → foaming cleanser\n'
          '• BHA toner or 2% salicylic acid\n'
          '• Retinol (start 0.25%, 2–3 nights/week)\n'
          '• Lightweight gel moisturizer\n\n'
          '🚫 **Avoid:** Heavy creams, coconut oil, alcohol-based toners\n\n'
          '💡 **Tip:** Clay masks (kaolin/bentonite) 1–2×/week reduce excess sebum.';
    }

    // ── Dry Skin ─────────────────────────────────────────────────────────────
    if (_matches(q, ['dry skin', 'flaky skin', 'dehydrated', 'tight skin', 'dry face', 'rough skin'])) {
      return '💧 **Routine for Dry / Dehydrated Skin**\n\n'
          '☀️ **Morning:**\n'
          '• Gentle cream cleanser (no sulfates)\n'
          '• Hyaluronic acid serum (apply on damp skin)\n'
          '• Rich moisturizer with ceramides & glycerin\n'
          '• SPF 30+ moisturizing sunscreen\n\n'
          '🌙 **Night:**\n'
          '• Cream or oil cleanser\n'
          '• Hyaluronic acid + Vitamin C serum\n'
          '• Thick barrier cream (shea butter or peptides)\n'
          '• Facial oil as last step (squalane or jojoba)\n\n'
          '💡 **Key Ingredients:** Ceramides, Glycerin, Hyaluronic Acid, Squalane, Shea Butter\n\n'
          '🚫 **Avoid:** Hot water, alcohol-based products, harsh exfoliants';
    }

    // ── Acne ─────────────────────────────────────────────────────────────────
    if (_matches(q, ['acne', 'pimple', 'breakout', 'blackhead', 'whitehead', 'zit', 'spots', 'treat acne', 'acne home'])) {
      return '🔴 **Acne — Causes & Treatment**\n\n'
          '**What causes acne?**\n'
          '• Excess sebum + dead skin cells clogging pores\n'
          '• Bacteria (C. acnes) causing inflammation\n'
          '• Hormonal changes, stress, diet\n\n'
          '💊 **Proven Treatments:**\n'
          '• **Benzoyl peroxide 2.5–5%** — kills bacteria (spot treat)\n'
          '• **Salicylic acid 0.5–2%** — unclogs pores\n'
          '• **Adapalene 0.1%** — retinoid (prescription-strength effect)\n'
          '• **Niacinamide 10%** — reduces redness & oil\n\n'
          '🏠 **Home Remedies:**\n'
          '• Ice pack on swollen pimple (10 mins)\n'
          '• Tea tree oil diluted 5% (spot only)\n'
          '• Zinc supplements (reduce inflammation)\n\n'
          '🩺 **See a doctor if:** Cystic acne, scars forming, not improving in 8 weeks';
    }

    // ── SPF / Sunscreen ───────────────────────────────────────────────────────
    if (_matches(q, ['spf', 'sunscreen', 'sun protection', 'how much spf', 'spf daily', 'uv protection'])) {
      return '☀️ **SPF Guide — Everything You Need to Know**\n\n'
          '**What SPF should you use?**\n'
          '• 🏠 Daily indoor use → **SPF 30**\n'
          '• 🚶 Outdoor/commuting → **SPF 50**\n'
          '• 🏖️ Beach/sports/high UV → **SPF 50+ (water-resistant)**\n\n'
          '**Key Rules:**\n'
          '• Apply **15–20 minutes before** sun exposure\n'
          '• Use a **full teaspoon (2mg/cm²)** for face + neck\n'
          '• Reapply **every 2 hours** outdoors\n'
          '• UVA+UVB (broad-spectrum) protection is essential\n\n'
          '**Best Formulas:**\n'
          '• Oily skin → Matte gel SPF (zinc oxide)\n'
          '• Dry skin → Moisturizing SPF cream\n'
          '• Sensitive skin → Mineral SPF (zinc/titanium)\n\n'
          '💡 SPF protects against skin aging, dark spots AND skin cancer — wear it daily!';
    }

    // ── Eczema ────────────────────────────────────────────────────────────────
    if (_matches(q, ['eczema', 'atopic dermatitis', 'itchy skin', 'rash', 'eczema treatment', 'signs of eczema'])) {
      return '🌿 **Eczema (Atopic Dermatitis)**\n\n'
          '**Signs & Symptoms:**\n'
          '• Red, inflamed, itchy patches (especially elbow/knee creases)\n'
          '• Dry, cracked, or scaly skin\n'
          '• Oozing or crusting when scratched\n'
          '• Worse at night or when dry\n\n'
          '💊 **Treatment:**\n'
          '• **Moisturize constantly** — ceramide creams 2–3×/day\n'
          '• **Mild hydrocortisone 1%** cream for flare-ups\n'
          '• **Antihistamines** (cetirizine) at night for itch\n'
          '• Cool, damp compresses for acute flares\n'
          '• Avoid scratching — keep nails short\n\n'
          '🚫 **Triggers to avoid:**\n'
          '• Soaps with fragrance/SLS, synthetic fabrics, extreme temperature changes, stress, certain foods (if allergic)\n\n'
          '🩺 **Prescription:** Tacrolimus (Protopic) or dupilumab for severe cases';
    }

    // ── Dark spots / Hyperpigmentation ───────────────────────────────────────
    if (_matches(q, ['dark spots', 'pigmentation', 'hyperpigmentation', 'uneven skin', 'skin tone', 'dark marks', 'melasma', 'post acne marks'])) {
      return '🌟 **Dark Spots & Hyperpigmentation**\n\n'
          '**Causes:**\n'
          '• Sun damage (most common)\n'
          '• Post-acne marks (PIH)\n'
          '• Melasma (hormonal)\n'
          '• Aging spots\n\n'
          '🧴 **Best Brightening Ingredients:**\n'
          '• **Vitamin C (10–20%)** — antioxidant, fades spots (AM)\n'
          '• **Niacinamide (5–10%)** — reduces melanin transfer\n'
          '• **Alpha Arbutin (2%)** — gentle skin lightener\n'
          '• **Kojic acid, Azelaic acid** — melanin inhibitors\n'
          '• **Retinol/Tretinoin** — accelerates cell turnover (PM)\n\n'
          '⏱️ **Timeline:** 8–12 weeks minimum with consistent use\n\n'
          '☀️ **#1 Rule:** Sunscreen SPF 50+ EVERY day — without it, spots return faster\n\n'
          '🩺 **For stubborn cases:** Chemical peels, laser treatment by dermatologist';
    }

    // ── Rosacea ───────────────────────────────────────────────────────────────
    if (_matches(q, ['rosacea', 'facial redness', 'red face', 'flushing', 'blood vessels face'])) {
      return '🔴 **Rosacea — Management Guide**\n\n'
          '**Symptoms:**\n'
          '• Persistent facial redness (cheeks, nose)\n'
          '• Visible small blood vessels (telangiectasia)\n'
          '• Flushing triggered by sun, spicy food, alcohol\n'
          '• Possible pustules (similar to acne)\n\n'
          '💊 **Treatment:**\n'
          '• **Topical:** Azelaic acid, Metronidazole gel (Rx)\n'
          '• **Oral:** Doxycycline 40–100mg for flares (Rx)\n'
          '• **Laser/IPL** for blood vessels — dermatologist\n\n'
          '🧴 **Skincare:**\n'
          '• Gentle cleanser (no scrubbing)\n'
          '• Fragrance-free, calming moisturizer\n'
          '• **Mineral SPF 50+** (zinc oxide only)\n\n'
          '🚫 **Triggers:** Hot drinks, spicy food, alcohol, extreme temperatures, harsh skincare\n\n'
          '🩺 Consult a dermatologist — rosacea is chronic but manageable';
    }

    // ── Psoriasis ─────────────────────────────────────────────────────────────
    if (_matches(q, ['psoriasis', 'silvery scales', 'scaly patches', 'psoriasis treatment'])) {
      return '🩺 **Psoriasis — Overview & Treatment**\n\n'
          '**What is it?**\n'
          'An autoimmune condition where skin cells multiply 10× faster than normal, causing thick, red, scaly plaques.\n\n'
          '**Common areas:** Scalp, elbows, knees, lower back\n\n'
          '💊 **Treatments:**\n'
          '• **Topical:** Corticosteroids, Vitamin D analogues (calcipotriol), Coal tar\n'
          '• **Phototherapy:** UVB light therapy (dermatologist)\n'
          '• **Biologics:** Adalimumab, Secukinumab (severe cases)\n'
          '• **Moisturize heavily** with thick emollients\n\n'
          '🌿 **Home care:**\n'
          '• Lukewarm showers (not hot)\n'
          '• Oat baths to soothe flares\n'
          '• Avoid skin trauma (Koebner phenomenon)\n\n'
          '🩺 **Must see a dermatologist** — psoriasis needs a diagnosis and monitored treatment plan';
    }

    // ── Skin types ────────────────────────────────────────────────────────────
    if (_matches(q, ['skin type', 'how to know skin type', 'determine skin type', 'normal skin', 'combination skin', 'sensitive skin'])) {
      return '🔍 **How to Identify Your Skin Type**\n\n'
          '**The "Watch & Wait" Test:**\n'
          '1. Cleanse with a gentle cleanser\n'
          '2. Pat dry — don\'t apply anything\n'
          '3. Wait 30–60 minutes, then observe\n\n'
          '**Results:**\n'
          '• 🟢 **Normal** — Balanced, no shine, no tightness, small pores\n'
          '• 🔵 **Dry** — Tight, flaky, dull, may feel uncomfortable\n'
          '• 🟡 **Oily** — Shiny all over, enlarged pores, greasy feel\n'
          '• 🟠 **Combination** — Oily T-zone (forehead/nose/chin), dry or normal cheeks\n'
          '• 🔴 **Sensitive** — Redness, burning, stinging after products\n\n'
          '💡 **Tip:** Your skin type can change with seasons, age, and diet. Re-assess every 6 months!';
    }

    // ── Vitamin C ─────────────────────────────────────────────────────────────
    if (_matches(q, ['vitamin c', 'vitamin c serum', 'ascorbic acid', 'brightening serum'])) {
      return '🍊 **Vitamin C — The Gold Standard Brightener**\n\n'
          '**Benefits:**\n'
          '• Fades dark spots & hyperpigmentation\n'
          '• Boosts collagen production → fewer wrinkles\n'
          '• Antioxidant protection against UV damage\n'
          '• Evens skin tone & adds glow\n\n'
          '**How to use:**\n'
          '• Apply in the **morning** after cleansing\n'
          '• Use **10–20% L-Ascorbic Acid** (most effective)\n'
          '• Store in dark, cool place (oxidizes easily)\n'
          '• Follow with moisturizer + SPF (mandatory!)\n\n'
          '💡 **Beginner tip:** Start with 10% — if stable, move to 15–20%\n\n'
          '⚠️ **Note:** May tingle slightly on sensitive skin — test on inner arm first\n\n'
          '🕐 **When to see results:** 4–8 weeks of consistent daily use';
    }

    // ── Retinol ───────────────────────────────────────────────────────────────
    if (_matches(q, ['retinol', 'retinoid', 'anti aging', 'anti-aging', 'wrinkles', 'fine lines', 'aging skin'])) {
      return '⚡ **Retinol — Anti-Aging Powerhouse**\n\n'
          '**What it does:**\n'
          '• Speeds up cell turnover\n'
          '• Reduces fine lines & wrinkles\n'
          '• Unclogs pores (great for acne too)\n'
          '• Fades dark spots & hyperpigmentation\n\n'
          '**How to start (avoid over-exfoliation):**\n'
          '• Week 1–2: 0.025–0.05% retinol, 1 night/week\n'
          '• Week 3–4: 2 nights/week\n'
          '• Month 2: Every other night\n'
          '• Month 3+: Nightly (if tolerated)\n\n'
          '💡 **Always use at night** — light breaks it down\n'
          '💡 **Moisturize after** — retinol is drying\n'
          '💡 **SPF mandatory next morning** — increases sun sensitivity\n\n'
          '⚠️ **Not for:** Pregnant/nursing women. Consult a doctor first.';
    }

    // ── Sunburn ───────────────────────────────────────────────────────────────
    if (_matches(q, ['sunburn', 'sun burn', 'burnt skin', 'red from sun', 'peeling after sun'])) {
      return '🔥 **Sunburn — Immediate Care**\n\n'
          '**Right now:**\n'
          '• Move to shade immediately\n'
          '• Cool compress (NOT ice directly on skin)\n'
          '• Cool/lukewarm shower — no hot water\n'
          '• Hydrate with water (sunburn dehydrates)\n\n'
          '🧴 **Topical relief:**\n'
          '• **Aloe vera gel** (chilled) — soothes inflammation\n'
          '• **Hydrocortisone 1% cream** — reduces redness\n'
          '• **Gentle moisturizer** (no fragrances)\n'
          '• **Ibuprofen/Paracetamol** for pain if needed\n\n'
          '🚫 **Do NOT:**\n'
          '• Pop any blisters (infection risk)\n'
          '• Apply butter, oil, or toothpaste\n'
          '• Go back in the sun until healed\n\n'
          '🩺 **See a doctor if:** Large blisters, fever, chills, severe pain (severe burn)';
    }

    // ── Hair loss / scalp ─────────────────────────────────────────────────────
    if (_matches(q, ['hair loss', 'hair fall', 'alopecia', 'bald', 'scalp', 'dandruff', 'seborrheic'])) {
      return '💇 **Hair Loss & Scalp Conditions**\n\n'
          '**Common Causes of Hair Loss:**\n'
          '• Genetic (androgenetic alopecia) — most common\n'
          '• Nutritional deficiency (iron, B12, Vitamin D, zinc)\n'
          '• Stress-related (telogen effluvium) — temporary\n'
          '• Hormonal changes (thyroid, PCOS)\n'
          '• Scalp conditions (seborrheic dermatitis)\n\n'
          '💊 **Proven Treatments:**\n'
          '• **Minoxidil 5%** — topical, applied to scalp daily\n'
          '• **Finasteride** — oral, prescription only (men)\n'
          '• **Biotin supplements** — supports hair growth\n\n'
          '🧴 **Dandruff:**\n'
          '• **Ketoconazole 2% shampoo** (Rx) — twice/week\n'
          '• **Zinc pyrithione shampoo** — OTC daily use\n\n'
          '🩺 **Consult a trichologist or dermatologist** for diagnosis and personalized plan';
    }

    // ── When to see a dermatologist ───────────────────────────────────────────
    if (_matches(q, ['dermatologist', 'when see doctor', 'doctor visit', 'derma', 'should i see', 'consult doctor'])) {
      return '🩺 **When Should You See a Dermatologist?**\n\n'
          '**See one soon if you have:**\n'
          '• A mole that is changing in size, shape, or color (ABCDE rule)\n'
          '• Skin that bleeds, itches, or doesn\'t heal after 2–3 weeks\n'
          '• Severe cystic acne causing scars\n'
          '• Persistent rash unresponsive to OTC treatment\n'
          '• Sudden hair loss (>100 strands/day)\n'
          '• Any suspicious skin lesion or lump\n\n'
          '⚡ **See one immediately if:**\n'
          '• Signs of skin infection (red streaks, pus, fever)\n'
          '• Severe allergic reaction (hives, swelling)\n'
          '• Sudden widespread rash with fever\n\n'
          '🌟 **General rule:** Annual full-body skin check by a dermatologist for everyone 30+\n\n'
          '📍 **DermaSense Tip:** Use our **Find Dermatologist** feature to locate one near you!';
    }

    // ── Moisturizer / Hydration ───────────────────────────────────────────────
    if (_matches(q, ['moisturizer', 'moisturise', 'hydration', 'moisturize', 'best moisturizer', 'dry moisturizer'])) {
      return '💧 **Choosing the Right Moisturizer**\n\n'
          '**By skin type:**\n'
          '• 🟡 **Oily:** Gel or water-based (hyaluronic acid, niacinamide)\n'
          '• 🔵 **Dry:** Rich cream (ceramides, shea butter, glycerin)\n'
          '• 🟠 **Combination:** Lightweight lotion — gel on T-zone, cream on cheeks\n'
          '• 🔴 **Sensitive:** Fragrance-free, minimal ingredients (La Roche-Posay Toleriane)\n\n'
          '**Key ingredients to look for:**\n'
          '• **Hyaluronic acid** — attracts water to skin\n'
          '• **Glycerin** — humectant, holds moisture\n'
          '• **Ceramides** — strengthens skin barrier\n'
          '• **Squalane** — lightweight, non-comedogenic oil\n\n'
          '💡 **When to apply:** Immediately after cleansing on slightly damp skin\n'
          '💡 **How much:** A pea-sized amount is enough for the face';
    }

    // ── Thank you / Bye ───────────────────────────────────────────────────────
    if (_matches(q, ['thank you', 'thanks', 'thank u', 'bye', 'goodbye', 'thx', 'thnks'])) {
      return '😊 You\'re welcome! Remember:\n\n'
          '• 🧴 Consistent routine = healthy skin\n'
          '• ☀️ SPF every single day\n'
          '• 💧 Stay hydrated\n'
          '• 🩺 See a dermatologist for medical concerns\n\n'
          'Take care of your skin — it\'s your largest organ! 🌿\n\n'
          'Come back anytime with more questions! 👋';
    }

    // ── Default fallback ─────────────────────────────────────────────────────
    return '🤔 That\'s a great question! Here\'s what I can help you with:\n\n'
        '• 💊 **Acne & Breakouts** — causes, treatments\n'
        '• 🌿 **Skincare Routines** — oily, dry, combination skin\n'
        '• ☀️ **Sun Protection** — SPF, sunscreen tips\n'
        '• 🌟 **Dark Spots** — pigmentation, brightening\n'
        '• 🔴 **Skin Conditions** — eczema, rosacea, psoriasis\n'
        '• 💧 **Hydration & Moisturizers** — best picks\n'
        '• 🩺 **When to see a doctor** — warning signs\n\n'
        'Try asking something like:\n'
        '*"How do I treat acne at home?"*\n'
        '*"What SPF should I use daily?"*\n'
        '*"Best routine for oily skin?"*';
  }

  /// Returns true if the query contains any of the given keywords.
  bool _matches(String query, List<String> keywords) {
    for (final kw in keywords) {
      if (query.contains(kw)) return true;
    }
    return false;
  }
}
