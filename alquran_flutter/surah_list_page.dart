import 'package:flutter/material.dart';
import '../data/alquran_api.dart';
import 'surah_detail_page.dart';

class SurahListPage extends StatefulWidget {
  final bool isDark;
  final VoidCallback onToggleTheme;

  const SurahListPage({
    super.key,
    required this.isDark,
    required this.onToggleTheme,
  });

  @override
  State<SurahListPage> createState() => _SurahListPageState();
}

class _SurahListPageState extends State<SurahListPage> {
  final api = AlQuranApi();
  late Future<List<dynamic>> future;

  final TextEditingController _searchCtrl = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    future = api.fetchSurahList();

    _searchCtrl.addListener(() {
      setState(() {
        _query = _searchCtrl.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  bool _matchSurah(Map<String, dynamic> s) {
    if (_query.isEmpty) return true;

    final number = (s['number'] ?? '').toString().toLowerCase();
    final englishName = (s['englishName'] ?? '').toString().toLowerCase();
    final englishTranslation =
        (s['englishNameTranslation'] ?? '').toString().toLowerCase();
    final arabicName = (s['name'] ?? '').toString().toLowerCase();

    return number.contains(_query) ||
        englishName.contains(_query) ||
        englishTranslation.contains(_query) ||
        arabicName.contains(_query);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Daftar Surah'),
        actions: [
          IconButton(
            tooltip: widget.isDark ? 'Light Mode' : 'Dark Mode',
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Error: ${snap.error}'));
          }

          final rawList = snap.data ?? [];
          final list = rawList
              .where((e) => _matchSurah(e as Map<String, dynamic>))
              .cast<dynamic>()
              .toList();

          return Column(
            children: [
              // 🔎 Search bar
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                child: TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: 'Cari surah (contoh: Al-Fatihah / 1)',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _query.isEmpty
                        ? null
                        : IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () => _searchCtrl.clear(),
                          ),
                    border: const OutlineInputBorder(),
                  ),
                ),
              ),

              // List
              Expanded(
                child: list.isEmpty
                    ? const Center(child: Text('Surah tidak ditemukan.'))
                    : ListView.separated(
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
                      ),
              ),

              // ✅ Branding Footer
              const Padding(
                padding: EdgeInsets.all(10),
                child: Text(
                  "Created by ajiputra",
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
