// lib/screens/skincare_result_screen.dart
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class SkincareResultScreen extends StatelessWidget {
  final String skinType;
  final Uint8List imageBytes;
  final Map<String, dynamic> skincarePlan;

  const SkincareResultScreen({
    Key? key,
    required this.skinType,
    required this.imageBytes,
    required this.skincarePlan,
  }) : super(key: key);

  Color get _skinTypeColor {
    switch (skinType) {
      case 'Oily': return const Color(0xFFFFA000);
      case 'Dry': return const Color(0xFF42A5F5);
      case 'Sensitive': return const Color(0xFFEC407A);
      case 'Normal': return const Color(0xFF66BB6A);
      case 'Combination': return const Color(0xFFAB47BC);
      default: return const Color(0xFF66BB6A);
    }
  }

  String get _skinTypeEmoji {
    switch (skinType) {
      case 'Oily': return '✨';
      case 'Dry': return '💧';
      case 'Sensitive': return '🌸';
      case 'Normal': return '⚖️';
      case 'Combination': return '🔀';
      default: return '🧴';
    }
  }

  @override
  Widget build(BuildContext context) {
    final morning = skincarePlan['morning'] as List<Map<String, dynamic>>? ?? [];
    final night = skincarePlan['night'] as List<Map<String, dynamic>>? ?? [];
    final products = skincarePlan['products'] as List<Map<String, dynamic>>? ?? [];
    final ingredientsToUse = skincarePlan['ingredientsToUse'] as List<String>? ?? [];
    final ingredientsToAvoid = skincarePlan['ingredientsToAvoid'] as List<String>? ?? [];
    final tips = skincarePlan['tips'] as List<String>? ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      body: CustomScrollView(
        slivers: [
          // Header App Bar
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: const Color(0xFF0D0D1A),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.memory(imageBytes, fit: BoxFit.cover),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.3),
                          Colors.black.withOpacity(0.8),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 20,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(_skinTypeEmoji, style: const TextStyle(fontSize: 32)),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Your Skin Type',
                                    style: TextStyle(color: Colors.white70, fontSize: 14)),
                                Text('$skinType Skin',
                                    style: TextStyle(
                                      color: _skinTypeColor,
                                      fontSize: 26,
                                      fontWeight: FontWeight.bold,
                                    )),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Summary card
                  _SectionCard(
                    title: 'About Your Skin',
                    icon: Icons.info_outline,
                    color: _skinTypeColor,
                    child: Text(
                      skincarePlan['description'] as String? ?? '',
                      style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.6),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Morning Routine
                  _SectionCard(
                    title: '🌅  Morning Routine',
                    icon: Icons.wb_sunny_outlined,
                    color: const Color(0xFFFFA000),
                    child: Column(
                      children: morning.asMap().entries.map((e) {
                        final step = e.value;
                        return _RoutineStep(
                          step: e.key + 1,
                          product: step['product'] as String,
                          how: step['how'] as String,
                          color: const Color(0xFFFFA000),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Night Routine
                  _SectionCard(
                    title: '🌙  Night Routine',
                    icon: Icons.nights_stay_outlined,
                    color: const Color(0xFF7986CB),
                    child: Column(
                      children: night.asMap().entries.map((e) {
                        final step = e.value;
                        return _RoutineStep(
                          step: e.key + 1,
                          product: step['product'] as String,
                          how: step['how'] as String,
                          color: const Color(0xFF7986CB),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Recommended Products
                  if (products.isNotEmpty) ...[
                    const Text('🛍️  Recommended Products',
                        style: TextStyle(
                            color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ...products.map((p) => _ProductCard(product: p, skinTypeColor: _skinTypeColor)),
                    const SizedBox(height: 16),
                  ],

                  // Ingredients to USE
                  _TwoColumnCard(
                    leftTitle: '✅  Use These Ingredients',
                    leftItems: ingredientsToUse,
                    leftColor: const Color(0xFF66BB6A),
                    rightTitle: '❌  Avoid These',
                    rightItems: ingredientsToAvoid,
                    rightColor: const Color(0xFFEF5350),
                  ),
                  const SizedBox(height: 16),

                  // Tips
                  _SectionCard(
                    title: '💡  Expert Tips',
                    icon: Icons.tips_and_updates_outlined,
                    color: const Color(0xFF26C6DA),
                    child: Column(
                      children: tips
                          .map((t) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.check_circle_outline,
                                        color: Color(0xFF26C6DA), size: 18),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(t,
                                          style: const TextStyle(
                                              color: Colors.white70, fontSize: 13.5, height: 1.5)),
                                    ),
                                  ],
                                ),
                              ))
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Find dermatologist button
                  _FindDermatologistButton(),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FindDermatologistButton extends StatelessWidget {
  Future<void> _openMaps() async {
    final uri = Uri.parse('geo:0,0?q=dermatologist+near+me');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      final webUri = Uri.parse('https://www.google.com/maps/search/dermatologist+near+me');
      await launchUrl(webUri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _openMaps,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF00695C), Color(0xFF00897B)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(18),
        ),
        child: const Row(
          children: [
            Icon(Icons.location_on, color: Colors.white, size: 30),
            SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Find Nearby Dermatologist',
                    style: TextStyle(
                        color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Open Google Maps with your location',
                    style: TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
            Spacer(),
            Icon(Icons.arrow_forward_ios, color: Colors.white54, size: 16),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _RoutineStep extends StatelessWidget {
  final int step;
  final String product;
  final String how;
  final Color color;

  const _RoutineStep({
    required this.step,
    required this.product,
    required this.how,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(color: color.withOpacity(0.5)),
            ),
            child: Center(
              child: Text('$step',
                  style: TextStyle(
                      color: color, fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product,
                    style: const TextStyle(
                        color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 3),
                Text(how, style: const TextStyle(color: Colors.white60, fontSize: 12.5, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final Color skinTypeColor;

  const _ProductCard({required this.product, required this.skinTypeColor});

  Future<void> _launchBuyUrl() async {
    final rawUrl = product['buyUrl'] as String? ?? '';
    if (rawUrl.isEmpty) return;
    try {
      final uri = Uri.parse(rawUrl);
      // On Flutter Web, canLaunchUrl may return false for valid URLs.
      // Attempt launch directly; fall back to a plain search on Amazon.
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        final productName = product['name'] as String? ?? '';
        final searchUri = Uri.parse(
            'https://www.amazon.in/s?k=${Uri.encodeQueryComponent(productName)}');
        await launchUrl(searchUri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {
      final productName = product['name'] as String? ?? '';
      final searchUri = Uri.parse(
          'https://www.amazon.in/s?k=${Uri.encodeQueryComponent(productName)}');
      await launchUrl(searchUri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasBuyUrl = (product['buyUrl'] as String? ?? '').isNotEmpty;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: skinTypeColor.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: skinTypeColor.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product emoji icon
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: skinTypeColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: skinTypeColor.withOpacity(0.25)),
                  ),
                  child: Center(
                    child: Text(product['emoji'] as String? ?? '🧴',
                        style: const TextStyle(fontSize: 26)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product['name'] as String,
                          style: const TextStyle(
                              color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(product['brand'] as String,
                          style: TextStyle(color: skinTypeColor, fontSize: 12.5, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 5),
                      Text(product['desc'] as String,
                          style: const TextStyle(color: Colors.white60, fontSize: 12, height: 1.4)),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                // Price badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: skinTypeColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: skinTypeColor.withOpacity(0.3)),
                  ),
                  child: Text(product['price'] as String,
                      style: TextStyle(color: skinTypeColor, fontSize: 11.5, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          // Buy Now button
          if (hasBuyUrl)
            GestureDetector(
              onTap: _launchBuyUrl,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 11),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      skinTypeColor.withOpacity(0.8),
                      skinTypeColor,
                    ],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(18),
                    bottomRight: Radius.circular(18),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.shopping_cart_rounded, color: Colors.white, size: 16),
                    SizedBox(width: 8),
                    Text(
                      'Buy Now on Amazon',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        letterSpacing: 0.3,
                      ),
                    ),
                    SizedBox(width: 6),
                    Icon(Icons.open_in_new_rounded, color: Colors.white70, size: 13),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _TwoColumnCard extends StatelessWidget {
  final String leftTitle;
  final List<String> leftItems;
  final Color leftColor;
  final String rightTitle;
  final List<String> rightItems;
  final Color rightColor;

  const _TwoColumnCard({
    required this.leftTitle,
    required this.leftItems,
    required this.leftColor,
    required this.rightTitle,
    required this.rightItems,
    required this.rightColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(leftTitle,
                    style: TextStyle(
                        color: leftColor, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 10),
                ...leftItems.map((i) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle, color: leftColor, size: 14),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(i,
                                style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          Container(width: 1, color: Colors.white.withOpacity(0.1), margin: const EdgeInsets.symmetric(horizontal: 12)),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(rightTitle,
                    style: TextStyle(
                        color: rightColor, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 10),
                ...rightItems.map((i) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: [
                          Icon(Icons.cancel, color: rightColor, size: 14),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(i,
                                style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
