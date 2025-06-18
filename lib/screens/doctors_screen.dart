import 'package:flutter/material.dart';

class DoctorsScreen extends StatefulWidget {
  const DoctorsScreen({Key? key}) : super(key: key);

  @override
  State<DoctorsScreen> createState() => _DoctorsScreenState();
}

class _DoctorsScreenState extends State<DoctorsScreen> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Doctors')),
      body: ListView(
        children: const [
          ListTile(title: Text('Dr. Smith - Cardiologist')),
          ListTile(title: Text('Dr. Johnson - Neurologist')),
          ListTile(title: Text('Dr. Williams - Dermatologist')),
        ],
      ),
    );
  }
}