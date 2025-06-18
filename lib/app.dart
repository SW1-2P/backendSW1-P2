import 'package:flutter/material.dart';
import '../../../core/themes/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/themes/app_theme.dart';

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'O3 Medical App',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
    );
  }
}