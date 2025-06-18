import 'package:flutter/material.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({Key? key}) : super(key: key);

  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Prescriptions')),
      body: ListView(
        children: const [
          ListTile(title: Text('Medicine A - 2 times a day')),
          ListTile(title: Text('Medicine B - 1 time a day')),
        ],
      ),
    );
  }
}