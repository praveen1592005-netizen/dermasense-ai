// lib/services/language_service.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final languageProvider = StateNotifierProvider<LanguageNotifier, Locale>((ref) {
  return LanguageNotifier();
});

class LanguageNotifier extends StateNotifier<Locale> {
  LanguageNotifier() : super(const Locale('en'));

  static const Map<String, Locale> _supported = {
    'en': Locale('en'),
    'ta': Locale('ta'),
    'hi': Locale('hi'),
    'te': Locale('te'),
    'ml': Locale('ml'),
  };

  String get currentCode => state.languageCode;

  void setLanguage(String code) {
    if (_supported.containsKey(code)) {
      state = _supported[code]!;
    }
  }
}

// ─── Language labels for dropdown ───────────────────────────────────────────
const Map<String, String> kLanguageLabels = {
  'en': 'English',
  'ta': 'தமிழ் (Tamil)',
  'hi': 'हिन्दी (Hindi)',
  'te': 'తెలుగు (Telugu)',
  'ml': 'മലയാളം (Malayalam)',
};

// ─── Localised string maps ────────────────────────────────────────────────────
const Map<String, Map<String, String>> kAppStrings = {
  'en': {
    'app_name': 'DermaSense AI Pro',
    'dashboard': 'Dashboard',
    'scan': 'Scan Skin',
    'chatbot': 'AI Chatbot',
    'history': 'History',
    'settings': 'Settings',
    'skincare': 'Skincare',
    'profile': 'Profile',
    'hello': 'Hello',
    'good_morning': 'Good Morning',
    'good_afternoon': 'Good Afternoon',
    'good_evening': 'Good Evening',
    'analyze_skin': 'Analyse Your Skin',
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'logout': 'Log Out',
    'language': 'Language',
    'theme': 'Appearance Mode',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    'settings_title': 'Settings & Preferences',
    'choose_language': 'Choose your preferred language',
    'saved': 'Language changed successfully!',
  },
  'ta': {
    'app_name': 'டெர்மாசென்ஸ் AI Pro',
    'dashboard': 'டாஷ்போர்டு',
    'scan': 'தோல் ஸ்கேன்',
    'chatbot': 'AI சாட்போட்',
    'history': 'வரலாறு',
    'settings': 'அமைப்புகள்',
    'skincare': 'தோல் பராமரிப்பு',
    'profile': 'சுயவிவரம்',
    'hello': 'வணக்கம்',
    'good_morning': 'காலை வணக்கம்',
    'good_afternoon': 'மதிய வணக்கம்',
    'good_evening': 'மாலை வணக்கம்',
    'analyze_skin': 'தோலை பகுப்பாய்வு செய்யுங்கள்',
    'sign_in': 'உள்நுழைக',
    'sign_up': 'பதிவு செய்க',
    'logout': 'வெளியேறு',
    'language': 'மொழி',
    'theme': 'தோற்ற முறை',
    'dark_mode': 'இருண்ட முறை',
    'light_mode': 'ஒளி முறை',
    'settings_title': 'அமைப்புகள் & விருப்பங்கள்',
    'choose_language': 'விருப்பமான மொழியை தேர்ந்தெடுக்கவும்',
    'saved': 'மொழி மாற்றம் வெற்றிகரமாக சேமிக்கப்பட்டது!',
  },
  'hi': {
    'app_name': 'डर्मासेंस AI Pro',
    'dashboard': 'डैशबोर्ड',
    'scan': 'त्वचा स्कैन',
    'chatbot': 'AI चैटबॉट',
    'history': 'इतिहास',
    'settings': 'सेटिंग्स',
    'skincare': 'त्वचा देखभाल',
    'profile': 'प्रोफ़ाइल',
    'hello': 'नमस्ते',
    'good_morning': 'शुभ प्रभात',
    'good_afternoon': 'शुभ दोपहर',
    'good_evening': 'शुभ संध्या',
    'analyze_skin': 'अपनी त्वचा का विश्लेषण करें',
    'sign_in': 'साइन इन करें',
    'sign_up': 'साइन अप करें',
    'logout': 'लॉग आउट',
    'language': 'भाषा',
    'theme': 'दिखावट मोड',
    'dark_mode': 'डार्क मोड',
    'light_mode': 'लाइट मोड',
    'settings_title': 'सेटिंग्स और प्राथमिकताएँ',
    'choose_language': 'अपनी पसंदीदा भाषा चुनें',
    'saved': 'भाषा सफलतापूर्वक बदल दी गई!',
  },
  'te': {
    'app_name': 'డర్మాసెన్స్ AI Pro',
    'dashboard': 'డాష్‌బోర్డ్',
    'scan': 'చర్మ స్కాన్',
    'chatbot': 'AI చాట్‌బాట్',
    'history': 'చరిత్ర',
    'settings': 'సెట్టింగ్‌లు',
    'skincare': 'చర్మ సంరక్షణ',
    'profile': 'ప్రొఫైల్',
    'hello': 'నమస్కారం',
    'good_morning': 'శుభోదయం',
    'good_afternoon': 'శుభ మధ్యాహ్నం',
    'good_evening': 'శుభ సాయంత్రం',
    'analyze_skin': 'మీ చర్మాన్ని విశ్లేషించండి',
    'sign_in': 'సైన్ ఇన్',
    'sign_up': 'సైన్ అప్',
    'logout': 'లాగ్ అవుట్',
    'language': 'భాష',
    'theme': 'రూప మోడ్',
    'dark_mode': 'డార్క్ మోడ్',
    'light_mode': 'లైట్ మోడ్',
    'settings_title': 'సెట్టింగ్‌లు & ప్రాధాన్యతలు',
    'choose_language': 'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
    'saved': 'భాష విజయవంతంగా మార్చబడింది!',
  },
  'ml': {
    'app_name': 'ഡർമാസെൻസ് AI Pro',
    'dashboard': 'ഡാഷ്‌ബോർഡ്',
    'scan': 'ത്വക്ക് സ്കാൻ',
    'chatbot': 'AI ചാറ്റ്ബോട്ട്',
    'history': 'ചരിത്രം',
    'settings': 'ക്രമീകരണങ്ങൾ',
    'skincare': 'ചർമ്മ പരിചരണം',
    'profile': 'പ്രൊഫൈൽ',
    'hello': 'നമസ്കാരം',
    'good_morning': 'ശുഭ പ്രഭാതം',
    'good_afternoon': 'ശുഭ ഉച്ചകഴിഞ്ഞ്',
    'good_evening': 'ശുഭ സന്ധ്യ',
    'analyze_skin': 'നിങ്ങളുടെ ചർമ്മം വിശകലനം ചെയ്യുക',
    'sign_in': 'സൈൻ ഇൻ',
    'sign_up': 'സൈൻ അപ്പ്',
    'logout': 'ലോഗ് ഔട്ട്',
    'language': 'ഭാഷ',
    'theme': 'രൂപം മോഡ്',
    'dark_mode': 'ഡാർക്ക് മോഡ്',
    'light_mode': 'ലൈറ്റ് മോഡ്',
    'settings_title': 'ക്രമീകരണങ്ങൾ & മുൻഗണനകൾ',
    'choose_language': 'ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക',
    'saved': 'ഭാഷ വിജയകരമായി മാറ്റി!',
  },
};

// ─── Helper extension ─────────────────────────────────────────────────────────
extension AppStringRef on WidgetRef {
  String tr(String key) {
    final locale = watch(languageProvider);
    final strings = kAppStrings[locale.languageCode] ?? kAppStrings['en']!;
    return strings[key] ?? kAppStrings['en']![key] ?? key;
  }
}
