import 'package:flutter/material.dart';

final BeautyTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.pink.shade200),
  primaryColor: Colors.pink.shade300,
  scaffoldBackgroundColor: const Color(0xFFFDF8F6),
  appBarTheme: const AppBarTheme(
    elevation: 0,
    backgroundColor: Colors.white,
    foregroundColor: Colors.black,
  ),
  // Cards use rounded corners and subtle elevation (adjust per SDK if needed)
  textTheme: const TextTheme(
    titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
  ),
);
