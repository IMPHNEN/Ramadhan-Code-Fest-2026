\
import 'package:flutter/material.dart';
import '../data/alquran_api.dart';
import 'surah_detail_page.dart';

class SurahListPage extends StatefulWidget {
  const SurahListPage({super.key});

  @override
  State<SurahListPage> createState() => _SurahListPageState();
}

class _SurahListPageState extends State<SurahListPage> {
  final api = AlQuranApi();
  late Future<List<dynamic>> future;

  @override
  void initState() {
    super.initState();
    future = api.fetchSurahList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daftar Surah')),
      body: FutureBuilder<List<dynamic>>(
        future: future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Error: ${snap.error}'));
          }

          final list = snap.data ?? [];
          return ListView.separated(
            itemCount: list.length,
            separatorBuilder: (_, __) => const Divider(height: 0),
            itemBuilder: (context, i) {
              final s = list[i] as Map<String, dynamic>;
              final number = s['number'] as int;
              final englishName = (s['englishName'] ?? '') as String;
              final arabicName = (s['name'] ?? '') as String;
              final ayahs = s['numberOfAyahs'];
              final revelationType = s['revelationType'];

              return ListTile(
                leading: CircleAvatar(child: Text('$number')),
                title: Text('$englishName ($arabicName)'),
                subtitle: Text('Ayat: $ayahs • $revelationType'),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SurahDetailPage(
                      surahNumber: number,
                      surahName: englishName,
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
