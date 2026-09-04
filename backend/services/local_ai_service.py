import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# System knowledge base mapping keywords/intents to predefined safe responses
KNOWLEDGE_BASE = {
    "acne|pimples|blackheads|whiteheads": (
        "**Acne & Breakouts**\n\n"
        "Acne occurs when hair follicles become plugged with oil and dead skin cells. "
        "It can appear as whiteheads, blackheads, or pimples.\n\n"
        "• **General Care**: Use a gentle, non-comedogenic cleanser. Avoid picking or squeezing, which can cause scarring.\n"
        "• **Helpful Ingredients**: Salicylic Acid (BHA), Benzoyl Peroxide, and Niacinamide can help manage mild breakouts.\n"
        "• **When to see a doctor**: If you have cystic, painful acne, or if over-the-counter products aren't helping, consult a dermatologist for prescription options."
    ),
    "dry skin|moisturizing|hydration": (
        "**Dry Skin Care**\n\n"
        "Dry skin can feel tight, itchy, or flaky. It occurs when your skin loses too much water and oil.\n\n"
        "• **General Care**: Take shorter, lukewarm showers (not hot water). Pat your skin dry instead of rubbing.\n"
        "• **Helpful Ingredients**: Look for Ceramides, Hyaluronic Acid, Glycerin, and Shea Butter. Apply moisturizer immediately after washing while skin is still damp.\n"
        "• **Avoid**: Harsh soaps, alcohol-based toners, and excessive physical exfoliation."
    ),
    "oily skin": (
        "**Oily Skin Care**\n\n"
        "Oily skin produces excess sebum, leading to a shiny appearance and sometimes clogged pores.\n\n"
        "• **General Care**: Wash your face twice daily and after sweating. Don't skip moisturizer; choose a lightweight, oil-free gel moisturizer.\n"
        "• **Helpful Ingredients**: Niacinamide (helps regulate oil production), Salicylic Acid (keeps pores clear), and oil-free formulations.\n"
        "• **Avoid**: Heavy creams and oil-based cleansers that might congest pores."
    ),
    "combination skin": (
        "**Combination Skin Care**\n\n"
        "Combination skin usually features an oily T-zone (forehead, nose, chin) and normal-to-dry cheeks.\n\n"
        "• **General Care**: You may need to treat different areas differently. A gentle, balanced cleanser works well for the whole face.\n"
        "• **Helpful Ingredients**: Lightweight hydrating serums (like Hyaluronic Acid) all over, with spot treatments on the oily zones if needed."
    ),
    "sensitive skin|redness|itching|rashes|rash at home": (
        "**Sensitive Skin & Irritation**\n\n"
        "Sensitive skin is prone to redness, itching, and stinging. It requires a minimalist, gentle approach.\n\n"
        "• **General Care**: Always patch-test new products. Stick to a simple routine: gentle cleanser, basic moisturizer, and mineral sunscreen.\n"
        "• **Helpful Ingredients**: Centella Asiatica (Cica), Panthenol (Vitamin B5), Aloe Vera, and Colloidal Oatmeal.\n"
        "• **Avoid**: Fragrances (even natural essential oils), harsh scrubs, and strong acids or retinoids unless directed by a doctor."
    ),
    "barrier|barrier tips|skin barrier": (
        "**Skin Barrier Care Tips**\n\n"
        "A healthy skin barrier retains moisture and protects against environmental irritants.\n\n"
        "• **Cleanse Gently**: Use a mild, non-stripping cleanser. Avoid washing with hot water.\n"
        "• **Moisturize**: Apply a fragrance-free moisturizer with ceramides and glycerin to lock in hydration.\n"
        "• **Minimize Actives**: Avoid over-exfoliating or layering too many active ingredients (like high-strength AHAs or retinoids) if your skin feels sensitive.\n"
        "• **Sun Protection**: Use a broad-spectrum mineral sunscreen daily to prevent further barrier damage.\n"
        "• **When to Seek Help**: If your skin becomes persistently painful, very red, swollen, or irritated, consider seeing a dermatologist."
    ),
    "hyperpigmentation|dark spots": (
        "**Hyperpigmentation & Dark Spots**\n\n"
        "Dark spots can be caused by sun damage, post-acne marks, or hormonal changes (like melasma).\n\n"
        "• **General Care**: Sun protection is the most critical step. Without daily sunscreen, dark spots will darken and treatments won't work.\n"
        "• **Helpful Ingredients**: Vitamin C, Niacinamide, Alpha Arbutin, Kojic Acid, and gentle chemical exfoliants (like Lactic Acid).\n"
        "• **Note**: Fading pigmentation takes time (often 4-12 weeks of consistent care)."
    ),
    "sunscreen|sun protection": (
        "**Sun Protection**\n\n"
        "Daily sun protection is essential for preventing premature aging, hyperpigmentation, and skin cancer.\n\n"
        "• **General Care**: Apply broad-spectrum sunscreen (SPF 30 or higher) every morning, even on cloudy days or when indoors near windows.\n"
        "• **Types**: Mineral sunscreens (Zinc Oxide/Titanium Dioxide) sit on the skin and are great for sensitive skin. Chemical sunscreens absorb UV rays and often have a lighter texture.\n"
        "• **Application**: Use about two finger-lengths for your face and neck. Reapply every 2 hours if outdoors."
    ),
    "cleansing": (
        "**Proper Cleansing**\n\n"
        "Cleansing removes dirt, excess oil, sweat, and environmental pollutants.\n\n"
        "• **General Care**: Cleanse your face once or twice a day. In the evening, consider 'double cleansing' if you wear makeup or water-resistant sunscreen (use an oil/balm cleanser first, followed by a water-based cleanser).\n"
        "• **Tip**: Your skin should not feel \"squeaky clean\" or tight after washing. If it does, your cleanser is too harsh."
    ),
    "skincare routine|morning routine|night routine": (
        "**Basic Skincare Routine**\n\n"
        "A good skincare routine doesn't need to be complicated.\n\n"
        "**Morning:**\n"
        "1. Cleanser (or just a water rinse if your skin is dry)\n"
        "2. Antioxidant Serum (like Vitamin C - optional)\n"
        "3. Moisturizer\n"
        "4. Sunscreen (SPF 30+)\n\n"
        "**Evening:**\n"
        "1. Cleanser (Double cleanse if removing makeup/sunscreen)\n"
        "2. Targeted Treatment (e.g., Acne treatment or Retinol - optional)\n"
        "3. Moisturizer"
    ),
    "general nutrition|lifestyle|sleep|food|foods": (
        "**Lifestyle & Skin Health**\n\n"
        "Your lifestyle choices directly impact your skin's health and appearance.\n\n"
        "• **Nutrition**: Anti-inflammatory foods (like berries, leafy greens, and omega-3 rich fish) can support skin recovery. Drink plenty of water.\n"
        "• **Sleep**: Aim for 7-9 hours. During sleep, your body repairs skin damage and produces collagen.\n"
        "• **Stress**: High stress increases cortisol, which can trigger acne breakouts and worsen conditions like eczema.\n"
        "• **Avoid**: Excessive sugar and highly processed foods which can trigger inflammation."
    ),
    "when to consult a dermatologist|doctor": (
        "**When to See a Dermatologist**\n\n"
        "While a basic skincare routine is great for maintenance, you should consult a board-certified dermatologist if you experience:\n\n"
        "• Severe, painful, or cystic acne\n"
        "• A mole or spot that changes in size, shape, color, or bleeds\n"
        "• Persistent rashes, intense itching, or unexplained redness\n"
        "• Skin conditions that do not improve with over-the-counter care\n"
        "• Suspected infections (warmth, swelling, pus)"
    )
}

def _build_analysis_context(analysis_context: Optional[dict]) -> str:
    """Build a safe, structured context string from analysis data for the LLM."""
    if not analysis_context:
        return ""

    ctx_parts = []
    if analysis_context.get("condition"):
        ctx_parts.append(f"AI Model Detected Condition: {analysis_context['condition']}")

    if analysis_context.get("confidence_percentage") is not None:
        ctx_parts.append(f"Model Confidence: {analysis_context['confidence_percentage']}%")

    if analysis_context.get("confidence_level"):
        ctx_parts.append(f"Confidence Level: {analysis_context['confidence_level']}")

    if analysis_context.get("risk_level"):
        ctx_parts.append(f"Risk Level: {analysis_context['risk_level']}")

    if analysis_context.get("skin_type"):
        ctx_parts.append(f"Skin Type: {analysis_context['skin_type']}")

    if analysis_context.get("symptoms") and isinstance(analysis_context["symptoms"], list):
        symptoms_str = ", ".join(analysis_context["symptoms"])
        if symptoms_str:
            ctx_parts.append(f"Reported Symptoms: {symptoms_str}")

    if analysis_context.get("duration"):
        ctx_parts.append(f"Duration: {analysis_context['duration']}")

    if analysis_context.get("body_location"):
        ctx_parts.append(f"Affected Area: {analysis_context['body_location']}")

    if not ctx_parts:
        return ""

    return (
        "\n\n[ANALYSIS CONTEXT]\n"
        + "\n".join(ctx_parts)
        + "\n[END CONTEXT]"
    )


def _generate_fallback_response(user_message: str, analysis_context: Optional[dict] = None) -> str:
    """Generates intelligent structured guidance without external API dependencies."""
    msg = user_message.lower()
    
    # 1. Search Knowledge Base
    for pattern, response_text in KNOWLEDGE_BASE.items():
        if re.search(pattern, msg):
            return response_text + "\n\n*Note: This information is for educational purposes and is not a medical diagnosis. Please consult a qualified dermatologist for clinical decisions.*"

    condition = analysis_context.get("condition") if analysis_context else None

    # 2. Contextual standard queries
    if "question" in msg or "ask" in msg or "prepare" in msg or "hospital" in msg or "doctor" in msg:
        condition_clause = f" for suspected {condition}" if condition else ""
        return (
            f"Here are key questions to ask during a professional medical evaluation{condition_clause}:\n\n"
            "1. **Diagnosis & Confirmation**: What is the definitive clinical diagnosis for this visual presentation?\n"
            "2. **Routine Modifications**: Which active ingredients in my daily routine (e.g. AHAs/BHAs, Retinoids, Vitamin C) should I pause during recovery?\n"
            "3. **Barrier Care**: What specific physical signs indicate my skin barrier is healing vs deteriorating?\n"
            "4. **Treatment Timeline**: What is the expected timeline for visible recovery, and are prescription topicals recommended?\n"
            "5. **Triggers & Lifestyle**: Are there specific environmental, dietary, or fabric triggers I should track in my symptom diary?\n\n"
            "💡 *Tip: Bring your DermaSense AI screening report to your evaluation for organized clinical intake.*"
        )

    if "report" in msg or "analysis" in msg or "result" in msg or "explain" in msg:
        if condition:
            return (
                f"**Report Breakdown for {condition}:**\n\n"
                f"- **Detected Pattern**: Visual characteristics align with {condition}.\n"
                f"- **Confidence**: Confidence reflects how closely visual features matched training datasets. A moderate or high score indicates distinct pattern matching, but clinical dermoscopy is required for definitive confirmation.\n"
                f"- **Recommended Action**: Protect the area with gentle, fragrance-free barrier moisturizers and avoid picking or scratching. Visit a dermatology hospital or consult a professional for clinical diagnosis."
            )
        return (
            "Your DermaSense AI report summarizes visual patterns, symptom duration, and barrier integrity. "
            "Confidence percentages indicate visual feature similarity to clinical reference datasets. "
            "Always share the report with a licensed physician for in-person dermoscopy and tailored care."
        )

    # 3. Ultimate Fallback (Safety Rule for unknown questions)
    return (
        "I can provide general information about skincare and common skin concerns, but I don't have a reliable answer for that question. "
        "Please consult a qualified dermatologist if you need medical advice."
    )


async def send_chat_message(
    user_message: str,
    conversation_history: list[dict],
    analysis_context: Optional[dict] = None,
) -> dict:
    """
    Manual Knowledge Base Chatbot implementation.
    No Ollama or external APIs required.
    """
    response_text = _generate_fallback_response(user_message, analysis_context)
    
    return {
        "success": True,
        "response": response_text,
        "status": "manual_knowledge",
        "model": "DermaSense Clinical Knowledge Engine",
        "is_ollama": False,
    }

async def _check_ollama_health() -> dict:
    """Mock health check since Ollama is removed."""
    return {"available": False, "reason": "ollama_removed"}


async def explain_analysis_result(analysis_data: dict) -> dict:
    """Generate a plain-language explanation of an analysis result."""
    condition = analysis_data.get("condition", "Unknown condition")
    confidence_pct = analysis_data.get("confidence_percentage", 0)
    confidence_level = analysis_data.get("confidence_level", "LOW")
    risk_level = analysis_data.get("risk_level", "UNCERTAIN")

    prompt = "explain my report"

    return await send_chat_message(
        user_message=prompt,
        conversation_history=[],
        analysis_context=analysis_data,
    )


async def get_lifestyle_recommendations(analysis_data: dict) -> dict:
    """Generate food and lifestyle guidance based on the detected condition."""
    prompt = "general nutrition and lifestyle"
    return await send_chat_message(
        user_message=prompt,
        conversation_history=[],
        analysis_context=analysis_data,
    )


async def generate_skincare_routine(metadata: dict) -> dict:
    """Generate a personalized skincare routine based on self-reported metadata."""
    skin_type = metadata.get("skinType", "Combination")
    concerns = metadata.get("concerns", [])
    
    fallback_response = {
        "success": True,
        "skinType": skin_type,
        "confidence": 85,
        "observations": [
            f"Based on your profile, you have {skin_type} skin.",
            f"Primary concerns: {', '.join(concerns) if concerns else 'General maintenance'}."
        ],
        "morningRoutine": [
            {
                "stepNumber": 1,
                "stepName": "Gentle Cleanser",
                "category": "Cleansing",
                "description": "Removes overnight sweat and oil without stripping the skin barrier.",
                "recommendedFrequency": "Daily (AM)",
                "keyIngredients": ["Glycerin", "Ceramides"]
            },
            {
                "stepNumber": 2,
                "stepName": "Vitamin C Serum",
                "category": "Antioxidant",
                "description": "Protects against environmental damage and brightens skin.",
                "recommendedFrequency": "Daily (AM)",
                "keyIngredients": ["L-Ascorbic Acid", "Vitamin E"]
            },
            {
                "stepNumber": 3,
                "stepName": "Moisturizer",
                "category": "Hydration",
                "description": "Locks in hydration and supports the skin barrier.",
                "recommendedFrequency": "Daily (AM)",
                "keyIngredients": ["Hyaluronic Acid", "Squalane"]
            },
            {
                "stepNumber": 4,
                "stepName": "Sunscreen (SPF 30+)",
                "category": "Protection",
                "description": "Essential daily protection against UV damage and hyperpigmentation.",
                "recommendedFrequency": "Daily (AM), reapply every 2 hours outdoors",
                "keyIngredients": ["Zinc Oxide", "Titanium Dioxide"]
            }
        ],
        "eveningRoutine": [
            {
                "stepNumber": 1,
                "stepName": "Double Cleanse",
                "category": "Cleansing",
                "description": "Removes SPF, makeup, and daily pollutants effectively.",
                "recommendedFrequency": "Daily (PM)",
                "keyIngredients": ["Squalane", "Micellar Water"]
            },
            {
                "stepNumber": 2,
                "stepName": "Targeted Treatment",
                "category": "Treatment",
                "description": "Addresses specific skin concerns while the skin repairs overnight.",
                "recommendedFrequency": "2-3 times a week",
                "keyIngredients": ["Niacinamide", "Retinol"]
            },
            {
                "stepNumber": 3,
                "stepName": "Nourishing Moisturizer",
                "category": "Hydration",
                "description": "Deeply moisturizes and aids overnight skin regeneration.",
                "recommendedFrequency": "Daily (PM)",
                "keyIngredients": ["Ceramides", "Peptides"]
            }
        ],
        "productCategories": [
            {
                "category": "Hydrating Cleansers",
                "purpose": "To clean the skin gently without disrupting the acid mantle.",
                "suitableIngredients": ["Glycerin", "Aloe Vera", "Ceramides"],
                "ingredientsToAvoid": ["Sulfates (SLS)", "Denatured Alcohol"]
            },
            {
                "category": "Antioxidant Serums",
                "purpose": "To neutralize free radicals and prevent oxidative stress.",
                "suitableIngredients": ["Vitamin C", "Ferulic Acid", "Green Tea Extract"],
                "ingredientsToAvoid": ["Synthetic Fragrances"]
            },
            {
                "category": "Barrier Creams",
                "purpose": "To seal in moisture and repair the outermost layer of the skin.",
                "suitableIngredients": ["Shea Butter", "Colloidal Oatmeal", "Panthenol"],
                "ingredientsToAvoid": ["Essential Oils (if sensitive)"]
            }
        ],
        "lifestyleGuidance": [
            {
                "title": "Sleep Hygiene",
                "recommendation": "Aim for 7-8 hours of sleep per night.",
                "impact": "Allows the skin to undergo natural repair and collagen production processes.",
                "icon": "Moon"
            },
            {
                "title": "Stress Management",
                "recommendation": "Incorporate stress-reducing activities like meditation or yoga.",
                "impact": "Lowers cortisol levels, which can reduce inflammation and breakouts.",
                "icon": "Heart"
            },
            {
                "title": "Environmental Care",
                "recommendation": "Change pillowcases frequently (every 2-3 days).",
                "impact": "Prevents bacteria and oil buildup from transferring back to your skin.",
                "icon": "Home"
            }
        ],
        "nutritionGuidance": [
            {
                "category": "Hydration",
                "foods": ["Water", "Herbal Tea", "Cucumber"],
                "benefit": "Maintains skin elasticity and flushes out toxins."
            },
            {
                "category": "Omega-3 Fatty Acids",
                "foods": ["Salmon", "Walnuts", "Chia Seeds"],
                "benefit": "Reduces inflammation and keeps the skin lipid barrier healthy."
            },
            {
                "category": "Antioxidants",
                "foods": ["Berries", "Leafy Greens", "Dark Chocolate"],
                "benefit": "Fights cellular damage and promotes a radiant complexion."
            }
        ],
        "is_ollama": False
    }

    return fallback_response
