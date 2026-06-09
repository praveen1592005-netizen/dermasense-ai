// lib/models/weather_model.dart

class WeatherModel {
  final double temperature;
  final double humidity;
  final double uvIndex;
  final String airQuality; // e.g. "Good", "Moderate", "Unhealthy"
  final String locationName;

  const WeatherModel({
    required this.temperature,
    required this.humidity,
    required this.uvIndex,
    required this.airQuality,
    required this.locationName,
  });

  String get uvRiskLevel {
    if (uvIndex >= 11) return 'Extreme';
    if (uvIndex >= 8) return 'Very High';
    if (uvIndex >= 6) return 'High';
    if (uvIndex >= 3) return 'Moderate';
    return 'Low';
  }

  String get skinProtectionRecommendation {
    if (uvIndex >= 8) {
      return 'Extreme UV radiation! Avoid sun exposure between 10 AM and 4 PM. Wear SPF 50+ sunscreen, a wide-brimmed hat, and sunglasses. Reapply sunscreen every 2 hours.';
    } else if (uvIndex >= 6) {
      return 'High UV levels. Apply SPF 30+ or 50+ sunscreen, wear protective clothing, and seek shade during midday.';
    } else if (uvIndex >= 3) {
      return 'Moderate UV levels. SPF 30+ sunscreen is recommended. Stay hydrated.';
    } else {
      return 'Low UV radiation. Standard daily moisturizer with SPF 15+ is sufficient.';
    }
  }

  factory WeatherModel.fromMap(Map<String, dynamic> map) {
    return WeatherModel(
      temperature: (map['temperature'] as num?)?.toDouble() ?? 27.0,
      humidity: (map['humidity'] as num?)?.toDouble() ?? 60.0,
      uvIndex: (map['uvIndex'] as num?)?.toDouble() ?? 4.0,
      airQuality: map['airQuality'] as String? ?? 'Good',
      locationName: map['locationName'] as String? ?? 'Your Location',
    );
  }

  Map<String, dynamic> toMap() => {
        'temperature': temperature,
        'humidity': humidity,
        'uvIndex': uvIndex,
        'airQuality': airQuality,
        'locationName': locationName,
      };
}
