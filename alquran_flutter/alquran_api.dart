import 'dart:convert';
import 'package:http/http.dart' as http;

class AlQuranApi {
  static const String _base = 'https://api.alquran.cloud/v1';

  Future<List<dynamic>> fetchSurahList() async {
    final res = await http.get(Uri.parse('$_base/surah'));
    if (res.statusCode != 200) {
      throw Exception('Failed to load surah list (HTTP ${res.statusCode})');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    return (json['data'] as List<dynamic>);
  }

  Future<Map<String, dynamic>> fetchSurahArabic(int surahNumber) async {
    final res = await http.get(Uri.parse('$_base/surah/$surahNumber'));
    if (res.statusCode != 200) {
      throw Exception('Failed to load surah arabic (HTTP ${res.statusCode})');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    return (json['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> fetchSurahIndonesian(int surahNumber) async {
    final res =
        await http.get(Uri.parse('$_base/surah/$surahNumber/id.indonesian'));
    if (res.statusCode != 200) {
      throw Exception(
          'Failed to load surah translation (HTTP ${res.statusCode})');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    return (json['data'] as Map<String, dynamic>);
  }

  /// Audio murattal edition (contoh: ar.alafasy)
  Future<Map<String, dynamic>> fetchSurahAudioEdition(
    int surahNumber, {
    String edition = 'ar.alafasy',
  }) async {
    final res = await http.get(Uri.parse('$_base/surah/$surahNumber/$edition'));
    if (res.statusCode != 200) {
      throw Exception('Failed to load audio edition (HTTP ${res.statusCode})');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    return (json['data'] as Map<String, dynamic>);
  }
}
