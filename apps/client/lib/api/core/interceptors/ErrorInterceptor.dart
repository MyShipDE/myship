import 'package:dio/dio.dart';

import '../../exceptions/ApiException.dart';

/// Maps every [DioException] to a normalised [ApiException] (attached as the
/// exception's `error`) so callers have a single, typed error path.
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    handler.next(err.copyWith(error: ApiException.fromDio(err)));
  }
}
