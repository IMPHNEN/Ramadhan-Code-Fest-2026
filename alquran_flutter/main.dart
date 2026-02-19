---

# 5) `alquran_flutter/lib/main.dart` ✅ (Dark Mode)
```dart
import 'package:flutter/material.dart';
import 'pages/surah_list_page.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _mode = ThemeMode.system;

  void _toggleTheme() {
    setState(() {
      _mode = (_mode == ThemeMode.dark) ? ThemeMode.light : ThemeMode.dark;
    });
  }

  bool get _isDark => _mode == ThemeMode.dark;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Al-Qur'an (Flutter)",
      themeMode: _mode,
      theme: ThemeData(useMaterial3: true, brightness: Brightness.light),
      darkTheme: ThemeData(useMaterial3: true, brightness: Brightness.dark),
      home: SurahListPage(
        isDark: _isDark,
        onToggleTheme: _toggleTheme,
      ),
    );
  }
}
