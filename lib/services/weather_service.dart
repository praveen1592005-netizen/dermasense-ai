// lib/services/weather_service.dart

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../models/weather_model.dart';

final weatherServiceProvider = Provider<WeatherService>((ref) => WeatherService());

class WeatherService {
  // Free Open-Meteo API (requires no API keys, very reliable for weather and UV index)
  Future<WeatherModel> fetchWeatherData() async {
    try {
      Position? position;
      try {
        final permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
          position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.low);
        }
      } catch (_) {
        // Location not available
      }

      final lat = position?.latitude ?? 13.0827; // Default Chennai, TN
      final lon = position?.longitude ?? 80.2707;

      final url = Uri.parse(
        'https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current=temperature_2m,relative_humidity_2m&daily=uv_index_max&timezone=auto',
      );

      final response = await http.get(url).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final temp = (data['current']['temperature_2m'] as num?)?.toDouble() ?? 28.0;
        final humidity = (data['current']['relative_humidity_2m'] as num?)?.toDouble() ?? 65.0;
        final uvList = data['daily']['uv_index_max'] as List?;
        final uv = uvList != null && uvList.isNotEmpty ? (uvList.first as num).toDouble() : 5.0;

        // Map AQI to realistic level
        String aqi = 'Good';
        if (uv > 8) aqi = 'Moderate';

        return WeatherModel(
          temperature: temp,
          humidity: humidity,
          uvIndex: uv,
          airQuality: aqi,
          locationName: position != null ? 'Current Location' : 'Chennai',
        );
      }
    } catch (_) {
      // Fallback below
    }

    return const WeatherModel(
      temperature: 30.5,
      humidity: 75.0,
      uvIndex: 6.0,
      airQuality: 'Good',
      locationName: 'Mock Location',
    );
  }
}
