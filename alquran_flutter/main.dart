\
import 'package:flutter/material.dart';
import 'pages/surah_list_page.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Al-Qur\'an (Flutter)',
      theme: ThemeData(useMaterial3: true),
      home: const SurahListPage(),
    );
  }
}
