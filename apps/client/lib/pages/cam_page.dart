import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';
import 'package:provider/provider.dart';

import '../api/core/api_provider.dart';
import '../services/app_settings_service.dart';
import '../widgets/myship_widgets.dart';

/// Native RTSP camera view (the core motivation for the Flutter rewrite):
/// media_kit plays the stream directly via libmpv. Stream URLs are configured
/// server-side (CAMERA_STREAMS) and fetched via `GET /cameras`; the last list is
/// cached locally for offline use. No manual configuration on the client.
class CamPage extends StatefulWidget {
  const CamPage({super.key});

  @override
  State<CamPage> createState() => _CamPageState();
}

/// Live-stream controls: no seek bar, no play/pause, no volume — only a
/// fullscreen button (seeking/pausing/volume make no sense for an RTSP feed).
final _controlsTheme = MaterialVideoControlsThemeData(
  displaySeekBar: false,
  topButtonBar: const [],
  bottomButtonBar: const [Spacer(), MaterialFullscreenButton()],
);

class _CamPageState extends State<CamPage> {
  late final Player _player = Player();
  late final VideoController _controller = VideoController(_player);

  List<String> _streams = [];
  int _index = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final settings = context.read<AppSettingsService>();

    // Show the cached list immediately.
    if (settings.cameraStreams.isNotEmpty) {
      _apply(settings.cameraStreams);
    }

    try {
      final streams = await context.read<ApiProvider>().systemApi.getCameras();
      await settings.setCameraStreams(streams);
      _apply(streams);
    } catch (_) {
      // Keep the cached list (or empty) on failure.
    }

    if (mounted) setState(() => _loading = false);
  }

  void _apply(List<String> streams) {
    if (!mounted) return;
    setState(() {
      _streams = streams;
      if (_index >= streams.length) _index = 0;
    });
    _playCurrent();
  }

  Future<void> _playCurrent() async {
    if (_streams.isEmpty) return;
    await _player.open(Media(_streams[_index]));
  }

  void _select(int i) {
    setState(() => _index = i);
    _playCurrent();
  }

  @override
  Widget build(BuildContext context) {
    return MyShipScaffold(
      title: 'Kamera',
      body: _loading && _streams.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _streams.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'Keine Kamera-Streams konfiguriert.\n'
                      'Am Gateway CAMERA_STREAMS setzen.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white54),
                    ),
                  ),
                )
              : Column(
                  children: [
                    if (_streams.length > 1)
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        child: Row(
                          children: List.generate(_streams.length, (i) {
                            return Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              child: ChoiceChip(
                                label: Text('Kamera ${i + 1}'),
                                selected: _index == i,
                                onSelected: (_) => _select(i),
                              ),
                            );
                          }),
                        ),
                      ),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Theme.of(context).colorScheme.primary,
                              width: 1.5,
                            ),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: MaterialVideoControlsTheme(
                            normal: _controlsTheme,
                            fullscreen: _controlsTheme,
                            child: Video(
                              controller: _controller,
                              controls: MaterialVideoControls,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
