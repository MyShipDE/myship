/// Tile layer URL templates. The map base is MapTiler raster tiles when a key
/// is provided, otherwise plain OSM. Raster (XYZ) is used because flutter_map
/// renders it natively on every target (incl. Linux/RPi) with no extra plugin.
class MapTiles {
  static const userAgent = 'id.myship';

  /// MapTiler raster endpoint for a style + key (both come from the gateway
  /// via GET /map/config, cached in AppSettingsService).
  static String maptiler(String style, String key) =>
      'https://api.maptiler.com/maps/$style/{z}/{x}/{y}.png?key=$key';

  /// Base map layer — MapTiler when a key is configured, else OSM.
  static String base(String key, String style) => key.isEmpty
      ? osm
      : maptiler(style.isEmpty ? 'streets-v2' : style, key);

  /// OSM fallback base layer (no subdomains — OSM deprecated a/b/c).
  static const osm = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  /// OpenSeaMap seamark overlay (nautical charts).
  static const openSeaMap = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

  /// OpenWeatherMap overlay layers (append the layer id).
  static const _owmAppId = '865a433cb7ac16a7fddb4ef46aaf56a4';
  static String owm(String layer) =>
      'https://tile.openweathermap.org/map/$layer/{z}/{x}/{y}.png?appid=$_owmAppId';
}
