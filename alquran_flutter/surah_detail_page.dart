import 'package:audioplayers/audioplayers.dart';
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

  final AudioPlayer _player = AudioPlayer();
  int? _playingAyah; // index ayah yang sedang diputar (0-based)
  bool _isLoadingAudio = false;

  late Future<(Map<String, dynamic>, Map<String, dynamic>, Map<String, dynamic>)>
      future;

  @override
  void initState() {
    super.initState();
    future = _load();

    _player.onPlayerComplete.listen((_) {
      setState(() {
        _playingAyah = null;
      });
    });
  }

  Future<(Map<String, dynamic>, Map<String, dynamic>, Map<String, dynamic>)>
      _load() async {
    final arab = await api.fetchSurahArabic(widget.surahNumber);
    final id = await api.fetchSurahIndonesian(widget.surahNumber);
    final audio = await api.fetchSurahAudioEdition(
      widget.surahNumber,
      edition: 'ar.alafasy',
    );
    return (arab, id, audio);
  }

  Future<void> _playAyah(int i, String url) async {
    setState(() {
      _isLoadingAudio = true;
      _playingAyah = i;
    });

    try {
      await _player.stop();
      await _player.play(UrlSource(url));
    } catch (_) {
      setState(() {
        _playingAyah = null;
      });
      rethrow;
    } finally {
      setState(() {
        _isLoadingAudio = false;
      });
    }
  }

  Future<void> _stop() async {
    await _player.stop();
    setState(() {
      _playingAyah = null;
      _isLoadingAudio = false;
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Surah ${widget.surahName}'),
        actions: [
          if (_playingAyah != null)
            IconButton(
              tooltip: 'Stop Audio',
              icon: const Icon(Icons.stop),
              onPressed: _stop,
            ),
        ],
      ),
      body: FutureBuilder<
          (Map<String, dynamic>, Map<String, dynamic>, Map<String, dynamic>)>(
        future: future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) return Center(child: Text('Error: ${snap.error}'));

          final (arab, id, audio) = snap.data!;
          final arabAyahs = (arab['ayahs'] as List).cast<Map<String, dynamic>>();
          final idAyahs = (id['ayahs'] as List).cast<Map<String, dynamic>>();
          final audioAyahs =
              (audio['ayahs'] as List).cast<Map<String, dynamic>>();

          final count = arabAyahs.length;

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: count,
            separatorBuilder: (_, __) => const Divider(height: 18),
            itemBuilder: (context, i) {
              final a = arabAyahs[i];
              final t = (i < idAyahs.length) ? idAyahs[i] : null;
              final au = (i < audioAyahs.length) ? audioAyahs[i] : null;

              final audioUrl = (au?['audio'] as String?) ?? '';
              final isThisPlaying = _playingAyah == i;

              return Card(
                elevation: 1,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Arab
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              a['text'] as String,
                              textAlign: TextAlign.right,
                              style:
                                  const TextStyle(fontSize: 22, height: 1.7),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Terjemah
                      Text(
                        (t?['text'] as String?) ?? '',
                        style: const TextStyle(fontSize: 14, height: 1.4),
                      ),

                      const SizedBox(height: 10),

                      // Bottom row: ayah number + audio control
                      Row(
                        children: [
                          Text(
                            'Ayat ${a['numberInSurah']}',
                            style: Theme.of(context).textTheme.labelMedium,
                          ),
                          const Spacer(),

                          if (audioUrl.isEmpty)
                            const Text('Audio tidak tersedia')
                          else
                            FilledButton.tonalIcon(
                              onPressed: _isLoadingAudio && isThisPlaying
                                  ? null
                                  : () async {
                                      if (isThisPlaying) {
                                        await _stop();
                                      } else {
                                        await _playAyah(i, audioUrl);
                                      }
                                    },
                              icon: Icon(
                                isThisPlaying ? Icons.stop : Icons.play_arrow,
                              ),
                              label: Text(
                                isThisPlaying ? 'Stop' : 'Play',
                              ),
                            ),
                        ],
                      ),
                    ],
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
