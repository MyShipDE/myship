import 'package:dio/dio.dart';

/// A normalised API error with a user-facing German message. Produced by
/// [ErrorInterceptor] so repositories/pages see one consistent error type
/// instead of raw [DioException]s (best practice: one error path).
class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final DioException? cause;

  ApiException(this.message, {this.statusCode, this.cause});

  /// True when the gateway rejected our device UUID (needs re-pairing).
  bool get isUnauthorized => statusCode == 401;

  factory ApiException.fromDio(DioException e) {
    final code = e.response?.statusCode;
    final message = switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        'Zeitüberschreitung bei der Verbindung zum Bordrechner.',
      DioExceptionType.connectionError =>
        'Keine Verbindung zum Bordrechner.',
      _ => switch (code) {
          401 => 'Nicht autorisiert — bitte Gerät neu koppeln.',
          404 => 'Ressource nicht gefunden.',
          final c? when c >= 500 => 'Fehler auf dem Bordrechner.',
          _ => 'Ein Netzwerkfehler ist aufgetreten.',
        },
    };
    return ApiException(message, statusCode: code, cause: e);
  }

  @override
  String toString() => 'ApiException($statusCode): $message';
}
