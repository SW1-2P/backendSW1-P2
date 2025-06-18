import 'package:flutter/material.dart';

class MedicalHistoryScreen extends StatefulWidget {
  const MedicalHistoryScreen({Key? key}) : super(key: key);

  @override
  State<MedicalHistoryScreen> createState() => _MedicalHistoryScreenState();
}

class _MedicalHistoryScreenState extends State<MedicalHistoryScreen> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Medical History')),
      body: ListView(
        children: const [
          ListTile(title: Text('Visit on 2023-01-01')),
          ListTile(title: Text('Visit on 2023-02-15')),
          ListTile(title: Text('Visit on 2023-03-10')),
        ],
      ),
    );
  }
}