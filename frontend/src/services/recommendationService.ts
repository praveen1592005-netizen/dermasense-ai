import {
  RoutineStep,
  ProductCategoryGuidance,
  LifestyleGuidanceItem,
  NutritionGuidanceItem,
  SkincareAnalysisInput,
} from '../types/analysis';

export const recommendationService = {
  /**
   * Generates evidence-based, general cosmetic skincare guidance and lifestyle suggestions.
   * Note: These are informational recommendations and do not constitute prescription medical advice.
   */
  generateBaselineGuidance(input: SkincareAnalysisInput): {
    morningRoutine: RoutineStep[];
    eveningRoutine: RoutineStep[];
    productCategories: ProductCategoryGuidance[];
    lifestyleGuidance: LifestyleGuidanceItem[];
    nutritionGuidance: NutritionGuidanceItem[];
  } {
    const skinType = input.skinType || 'combination';
    const concerns = input.primaryConcerns || [];

    // Morning Routine Steps
    const morningRoutine: RoutineStep[] = [
      {
        stepNumber: 1,
        stepName: 'Gentle Cleanser',
        category: 'Cleanser',
        description:
          skinType === 'dry'
            ? 'Use a hydrating cream-to-foam or micellar wash that preserves your natural skin barrier.'
            : 'Use a pH-balanced gentle foaming gel cleanser to remove overnight sebum buildup.',
        recommendedFrequency: 'Daily (Every Morning)',
        keyIngredients: ['Glycerin', 'Ceramides', 'Thermal Spring Water'],
      },
      {
        stepNumber: 2,
        stepName: 'Hydrating Essence / Serum',
        category: 'Hydration & Treatment',
        description: concerns.includes('Hyperpigmentation & Dark Spots')
          ? 'Apply a lightweight antioxidant serum such as Vitamin C or Niacinamide to promote even tone.'
          : 'Apply a multi-molecular Hyaluronic Acid serum on damp skin for deep moisture retention.',
        recommendedFrequency: 'Daily (Morning)',
        keyIngredients: ['Hyaluronic Acid', 'Niacinamide (2-5%)', 'Panthenol (Pro-Vitamin B5)'],
      },
      {
        stepNumber: 3,
        stepName: 'Barrier-Support Moisturizer',
        category: 'Moisturizer',
        description:
          skinType === 'oily'
            ? 'Lightweight oil-free water gel moisturizer that hydrates without clogging pores.'
            : 'Rich ceramide-infused lotion to lock in moisture and protect against environmental dryness.',
        recommendedFrequency: 'Daily (Morning)',
        keyIngredients: ['Ceramides NP/AP/EOP', 'Centella Asiatica', 'Squalane'],
      },
      {
        stepNumber: 4,
        stepName: 'Broad-Spectrum Sunscreen SPF 50+',
        category: 'UV Defense',
        description:
          'Essential daily defense against UVA/UVB photo-aging. Apply two finger-lengths generously.',
        recommendedFrequency: 'Daily (Reapply every 2-3 hours if outdoors)',
        keyIngredients: ['Zinc Oxide', 'Chemical UV Filters (PA++++)', 'Antioxidants'],
      },
    ];

    // Evening Routine Steps
    const eveningRoutine: RoutineStep[] = [
      {
        stepNumber: 1,
        stepName: 'Double Cleanse / Night Cleanser',
        category: 'Cleansing',
        description:
          'Thoroughly remove sunscreen, environmental pollutants, and impurities without stripping.',
        recommendedFrequency: 'Daily (Every Evening)',
        keyIngredients: ['Micellar Water', 'Mild Amino-Acid Surfactants'],
      },
      {
        stepNumber: 2,
        stepName: 'Targeted Night Treatment',
        category: 'Regeneration',
        description:
          'Incorporate barrier recovery or gentle cell-turnover support as tolerated.',
        recommendedFrequency: '3 to 4 evenings per week',
        keyIngredients: ['Peptides', 'Cica (Madecassoside)', 'Low-dose Niacinamide'],
      },
      {
        stepNumber: 3,
        stepName: 'Restorative Night Cream',
        category: 'Moisturizer & Repair',
        description:
          'Replenish lipid levels while you sleep with a nourishing barrier repair moisturizer.',
        recommendedFrequency: 'Daily (Every Evening)',
        keyIngredients: ['Shea Butter / Plant Sterols', 'Cholesterol', 'Hyaluronic Acid'],
      },
    ];

    // Product Categories Guidance
    const productCategories: ProductCategoryGuidance[] = [
      {
        category: 'Cleanser',
        purpose: 'Gently dislodge excess oil, pollutants, and residue while maintaining acid mantle pH (5.5).',
        suitableIngredients: ['Glycerin', 'Cocamidopropyl Betaine', 'Allantoin'],
        ingredientsToAvoid: ['Sodium Lauryl Sulfate (SLS)', 'High-concentration Synthetic Fragrance'],
      },
      {
        category: 'Moisturizer',
        purpose: 'Seal in hydration and reinforce stratum corneum intercellular lipids.',
        suitableIngredients: ['Ceramides', 'Squalane', 'Sodium Hyaluronate', 'Fatty Acids'],
        ingredientsToAvoid: ['Drying Denatured Alcohols in top 5 ingredients'],
      },
      {
        category: 'Sunscreen',
        purpose: 'Broad-spectrum defense against UVA/UVB radiation, hyperpigmentation, and premature wrinkles.',
        suitableIngredients: ['Zinc Oxide', 'Titanium Dioxide', 'Tinosorb / Uvinul Filters'],
        ingredientsToAvoid: ['Expired sunscreen formulations'],
      },
    ];

    // Lifestyle Guidance
    const lifestyleGuidance: LifestyleGuidanceItem[] = [
      {
        title: 'Hydration & Water Balance',
        recommendation: 'Target 2.0 to 2.5 Liters of pure water daily for cellular turgor and metabolic waste clearance.',
        impact: 'Improves skin plumpness and prevents surface dehydration.',
        icon: 'Droplets',
      },
      {
        title: 'Sleep Hygiene & Cellular Repair',
        recommendation: 'Aim for 7 to 8 hours of quality sleep. Night is the peak window for epidermal cell turnover.',
        impact: 'Reduces cortisol-induced inflammation and diminishes dark eye circles.',
        icon: 'Moon',
      },
      {
        title: 'Pillowcase & Screen Hygiene',
        recommendation: 'Change pillowcases 1–2 times weekly and disinfect smartphone screens regularly.',
        impact: 'Prevents mechanical bacteria transfer that can exacerbate breakout flares.',
        icon: 'Sparkles',
      },
      {
        title: 'Stress Management',
        recommendation: 'Incorporate 10 minutes of deep breathing, gentle stretching, or mindfulness daily.',
        impact: 'Downregulates inflammatory cytokines that trigger redness and sensitivity.',
        icon: 'Heart',
      },
    ];

    // Nutrition Guidance
    const nutritionGuidance: NutritionGuidanceItem[] = [
      {
        category: 'Antioxidant-Rich Fruits',
        foods: ['Blueberries', 'Pomegranate', 'Papaya', 'Guava', 'Citrus fruits'],
        benefit: 'Provides Vitamin C & polyphenols to neutralize free radical oxidative stress.',
      },
      {
        category: 'Vibrant Vegetables',
        foods: ['Spinach', 'Carrots', 'Sweet Potatoes', 'Bell Peppers', 'Broccoli'],
        benefit: 'Rich in Beta-Carotene (pro-vitamin A) and lutein for healthy epithelial cell renewal.',
      },
      {
        category: 'Healthy Fats & Omega-3s',
        foods: ['Walnuts', 'Flaxseeds', 'Chia Seeds', 'Avocado', 'Olive Oil'],
        benefit: 'Reinforces the natural lipid envelope of skin cells to prevent transepidermal water loss.',
      },
      {
        category: 'Lean Protein Sources',
        foods: ['Lentils / Dal', 'Tofu / Paneer', 'Chickpeas', 'Eggs', 'Sprouts'],
        benefit: 'Supplies essential amino acids (glycine, proline) for endogenous collagen synthesis.',
      },
    ];

    return {
      morningRoutine,
      eveningRoutine,
      productCategories,
      lifestyleGuidance,
      nutritionGuidance,
    };
  },
};
