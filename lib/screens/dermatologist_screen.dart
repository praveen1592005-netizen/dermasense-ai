// lib/screens/dermatologist_screen.dart
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

// ─── Mock data model ─────────────────────────────────────────────────────────
class DermatologistModel {
  final String name;
  final String specialty;
  final double rating;
  final int reviewCount;
  final String address;
  final String phone;
  final String hours;
  final double distanceKm;
  final bool isOpen;
  final List<String> tags;

  const DermatologistModel({
    required this.name,
    required this.specialty,
    required this.rating,
    required this.reviewCount,
    required this.address,
    required this.phone,
    required this.hours,
    required this.distanceKm,
    required this.isOpen,
    required this.tags,
  });
}

// ─── Mock dermatologist list ──────────────────────────────────────────────────
final List<DermatologistModel> _mockDermatologists = [
  const DermatologistModel(
    name: 'Dr. Priya Krishnamurthy',
    specialty: 'Dermatologist & Cosmetologist',
    rating: 4.9,
    reviewCount: 312,
    address: 'Apollo Clinic, Anna Nagar, Chennai',
    phone: '+91 98412 34567',
    hours: 'Mon–Sat: 9 AM – 6 PM',
    distanceKm: 1.2,
    isOpen: true,
    tags: ['Acne', 'Eczema', 'Laser'],
  ),
  const DermatologistModel(
    name: 'Dr. Sanjay Mehta',
    specialty: 'Senior Consultant Dermatologist',
    rating: 4.7,
    reviewCount: 198,
    address: 'Fortis Hospital, Arumbakkam, Chennai',
    phone: '+91 44 6600 1234',
    hours: 'Mon–Fri: 10 AM – 5 PM',
    distanceKm: 2.8,
    isOpen: true,
    tags: ['Psoriasis', 'Vitiligo', 'Skin Cancer'],
  ),
  const DermatologistModel(
    name: 'Dr. Ananya Sharma',
    specialty: 'Aesthetic Dermatologist',
    rating: 4.8,
    reviewCount: 276,
    address: 'Skin & Hair Clinic, T. Nagar, Chennai',
    phone: '+91 98760 11223',
    hours: 'Tue–Sun: 11 AM – 7 PM',
    distanceKm: 3.5,
    isOpen: false,
    tags: ['Rosacea', 'Hyperpigmentation', 'Botox'],
  ),
  const DermatologistModel(
    name: 'Dr. Ramesh Babu',
    specialty: 'Pediatric & Adult Dermatologist',
    rating: 4.6,
    reviewCount: 143,
    address: 'MIOT International, Manapakkam, Chennai',
    phone: '+91 44 4200 2288',
    hours: 'Mon–Sat: 8 AM – 4 PM',
    distanceKm: 5.1,
    isOpen: true,
    tags: ['Eczema', 'Fungal', 'Allergies'],
  ),
  const DermatologistModel(
    name: 'Dr. Kavitha Sundaram',
    specialty: 'Dermatopathologist',
    rating: 4.9,
    reviewCount: 89,
    address: 'Global Hospitals, Perumbakkam, Chennai',
    phone: '+91 44 4477 6600',
    hours: 'Wed–Mon: 9 AM – 5 PM',
    distanceKm: 7.3,
    isOpen: true,
    tags: ['Melanoma', 'Biopsy', 'Complex Cases'],
  ),
];

// ─── Provider ─────────────────────────────────────────────────────────────────
final _locationProvider = FutureProvider<Position?>((ref) async {
  bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) return null;

  LocationPermission perm = await Geolocator.checkPermission();
  if (perm == LocationPermission.denied) {
    perm = await Geolocator.requestPermission();
    if (perm == LocationPermission.denied) return null;
  }
  if (perm == LocationPermission.deniedForever) return null;

  return Geolocator.getCurrentPosition(
    locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
class DermatologistScreen extends ConsumerStatefulWidget {
  const DermatologistScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<DermatologistScreen> createState() =>
      _DermatologistScreenState();
}

class _DermatologistScreenState extends ConsumerState<DermatologistScreen> {
  String _searchQuery = '';
  String _filterTag = 'All';
  final _tags = ['All', 'Acne', 'Eczema', 'Psoriasis', 'Laser', 'Vitiligo'];

  List<DermatologistModel> get _filtered {
    return _mockDermatologists.where((d) {
      final matchSearch = _searchQuery.isEmpty ||
          d.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          d.address.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchTag =
          _filterTag == 'All' || d.tags.contains(_filterTag);
      return matchSearch && matchTag;
    }).toList();
  }

  Future<void> _call(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _directions(String address) async {
    final encoded = Uri.encodeComponent(address);
    final uri = Uri.parse(
        'https://www.google.com/maps/search/?api=1&query=$encoded');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final locationAsync = ref.watch(_locationProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2A2A3B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Nearby Dermatologists',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          locationAsync.when(
            data: (pos) => pos != null
                ? Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.my_location_rounded,
                            color: Color(0xFF8E24AA), size: 16),
                        const SizedBox(width: 4),
                        Text(
                          '${pos.latitude.toStringAsFixed(2)}, ${pos.longitude.toStringAsFixed(2)}',
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 11),
                        ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
            loading: () => const Padding(
              padding: EdgeInsets.only(right: 12),
              child: SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Color(0xFF8E24AA))),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Search bar ─────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              style: const TextStyle(color: Colors.white),
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: InputDecoration(
                hintText: 'Search by name or location…',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon:
                    const Icon(Icons.search, color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF2A2A3B),
                contentPadding:
                    const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // ── Tag filters ────────────────────────────────────────────────────
          SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _tags.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final t = _tags[i];
                final selected = t == _filterTag;
                return ChoiceChip(
                  label: Text(t,
                      style: TextStyle(
                          color: selected ? Colors.white : Colors.white60,
                          fontSize: 12)),
                  selected: selected,
                  selectedColor: const Color(0xFF6A1B9A),
                  backgroundColor: const Color(0xFF2A2A3B),
                  side: BorderSide(
                    color: selected
                        ? const Color(0xFF8E24AA)
                        : Colors.white12,
                  ),
                  onSelected: (_) => setState(() => _filterTag = t),
                );
              },
            ),
          ),

          // ── Location status banner ─────────────────────────────────────────
          locationAsync.when(
            data: (pos) => pos == null ? _locationBanner() : const SizedBox.shrink(),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => _locationBanner(),
          ),

          // ── Stats row ──────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                const Icon(Icons.local_hospital_rounded,
                    color: Color(0xFF8E24AA), size: 16),
                const SizedBox(width: 6),
                Text(
                  '${_filtered.length} dermatologists found nearby',
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),

          // ── Doctor cards ───────────────────────────────────────────────────
          Expanded(
            child: _filtered.isEmpty
                ? const Center(
                    child: Text('No results found.',
                        style: TextStyle(color: Colors.white54)))
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    itemCount: _filtered.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 14),
                    itemBuilder: (_, i) =>
                        _DoctorCard(
                          doctor: _filtered[i],
                          onCall: _call,
                          onDirections: _directions,
                        ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _locationBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.location_off_rounded,
              color: Colors.amber, size: 18),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Location unavailable — showing results for your city.',
              style: TextStyle(color: Colors.amber, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Doctor Card ─────────────────────────────────────────────────────────────
class _DoctorCard extends StatelessWidget {
  final DermatologistModel doctor;
  final void Function(String) onCall;
  final void Function(String) onDirections;

  const _DoctorCard({
    required this.doctor,
    required this.onCall,
    required this.onDirections,
  });

  @override
  Widget build(BuildContext context) {
    // Random accent color based on name hash
    final colors = [
      const Color(0xFF6A1B9A),
      const Color(0xFF283593),
      const Color(0xFF00695C),
      const Color(0xFF1565C0),
      const Color(0xFF880E4F),
    ];
    final color = colors[doctor.name.hashCode.abs() % colors.length];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color.withOpacity(0.3), color.withOpacity(0.05)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                // Avatar
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                        colors: [color, color.withOpacity(0.6)]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      doctor.name.split(' ').last[0],
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(doctor.name,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(doctor.specialty,
                          style: TextStyle(
                              color: color.withOpacity(0.9),
                              fontSize: 12)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          // Rating stars
                          Row(
                            children: List.generate(5, (i) {
                              return Icon(
                                i < doctor.rating.floor()
                                    ? Icons.star_rounded
                                    : (i < doctor.rating
                                        ? Icons.star_half_rounded
                                        : Icons.star_outline_rounded),
                                color: const Color(0xFFFFC107),
                                size: 14,
                              );
                            }),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${doctor.rating} (${doctor.reviewCount})',
                            style: const TextStyle(
                                color: Colors.white60, fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Open/Closed badge
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: doctor.isOpen
                        ? Colors.green.withOpacity(0.2)
                        : Colors.red.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: doctor.isOpen
                          ? Colors.greenAccent.withOpacity(0.5)
                          : Colors.redAccent.withOpacity(0.5),
                    ),
                  ),
                  child: Text(
                    doctor.isOpen ? 'Open' : 'Closed',
                    style: TextStyle(
                      color: doctor.isOpen
                          ? Colors.greenAccent
                          : Colors.redAccent,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow(Icons.location_on_rounded, doctor.address),
                const SizedBox(height: 8),
                _infoRow(Icons.access_time_rounded, doctor.hours),
                const SizedBox(height: 8),
                _infoRow(Icons.straighten_rounded,
                    '${doctor.distanceKm.toStringAsFixed(1)} km away'),
                const SizedBox(height: 12),

                // Specialty tags
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: doctor.tags
                      .map((t) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: color.withOpacity(0.3)),
                            ),
                            child: Text(t,
                                style: TextStyle(
                                    color: color,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500)),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 14),

                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: _ActionBtn(
                        icon: Icons.call_rounded,
                        label: 'Call',
                        color: Colors.greenAccent,
                        bgColor: Colors.green.withOpacity(0.15),
                        onTap: () => onCall(doctor.phone),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _ActionBtn(
                        icon: Icons.directions_rounded,
                        label: 'Directions',
                        color: const Color(0xFF8E24AA),
                        bgColor: const Color(0xFF6A1B9A).withOpacity(0.15),
                        onTap: () => onDirections(doctor.address),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _ActionBtn(
                        icon: Icons.calendar_month_rounded,
                        label: 'Book',
                        color: Colors.blueAccent,
                        bgColor: Colors.blue.withOpacity(0.15),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  'Online booking coming soon!'),
                              backgroundColor: Color(0xFF6A1B9A),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.white38, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text,
              style: const TextStyle(color: Colors.white60, fontSize: 13)),
        ),
      ],
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;

  const _ActionBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.bgColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
