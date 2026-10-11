import 'package:flutter_test/flutter_test.dart';
import 'package:myship/resources/colors.dart';

void main() {
  test('night mode swaps the seed colour blue→red', () {
    expect(MyShipColors.seed(false), MyShipColors.dayPrimary);
    expect(MyShipColors.seed(true), MyShipColors.nightPrimary);
  });
}
