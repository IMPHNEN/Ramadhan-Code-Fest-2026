\
import 'package:flutter/material.dart';
import '../data/alquran_api.dart';

class SurahDetailPage extends StatefulWidget {
  final int surahNumber;
  final String surahName;

  const SurahDetailPage({
    super.key,
    required this.surahNumber,
    required this.surahName,
  });

  @override
  State<SurahDetailPage> createState() => _SurahDetailPageState();
}

class _SurahDetailPageState extends State<SurahDetailPage> {
  final api = AlQuranApi();
  late Future<(Map<String, dynamic>, Map<String, dynamic>)> future;

  @override
  void initState() {
    super.initState();
    future = _load();
  }

  Future<(Map<String, dynamic>, Map<String, dynamic>)> _load() async {
    final arab = await api.fetchSurahArabic(widget.surahNumber);
    final id = await api.fetchSurahIndonesian(widget.surahNumber);
    return (arab, id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Surah ${widget.surahName}')),
      body: FutureBuilder<(Map<String, dynamic>, Map<String, dynamic>)>(
        future: future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) return Center(child: Text('Error: ${snap.error}'));

          final (arab, id) = snap.data!;
          final arabAyahs = (arab['ayahs'] as List).cast<Map<String, dynamic>>();
          final idAyahs = (id['ayahs'] as List).cast<Map<String, dynamic>>();

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: arabAyahs.length,
            separatorBuilder: (_, __) => const Divider(height: 24),
            itemBuilder: (context, i) {
              final a = arabAyahs[i];
              final t = (i < idAyahs.length) ? idAyahs[i] : null;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          a['text'] as String,
                          textAlign: TextAlign.right,
                          style: const TextStyle(fontSize: 22, height: 1.7),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    (t?['text'] as String?) ?? '',
                    style: const TextStyle(fontSize: 14, height: 1.4),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Ayat ${a['numberInSurah']}',
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
