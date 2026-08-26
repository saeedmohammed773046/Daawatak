class VerificationResultData {
  final String status; // ACCEPTED, ALREADY_USED, EXPIRED, INVALID
  final String message;
  final String? details;
  final String? guestName;
  final String? guestPhone;
  final int? companionsCount;
  final String? tableNumber;
  final bool isTrial;
  final DateTime scannedAt;

  VerificationResultData({
    required this.status,
    required this.message,
    this.details,
    this.guestName,
    this.guestPhone,
    this.companionsCount,
    this.tableNumber,
    this.isTrial = false,
    DateTime? scannedAt,
  }) : scannedAt = scannedAt ?? DateTime.now();

  factory VerificationResultData.fromApiResponse(
    Map<String, dynamic> data, {
    bool isTrial = false,
  }) {
    final statusStr = (data['verification_result'] ?? data['status'] ?? 'INVALID')
        .toString()
        .toUpperCase();
    final guestData = data['guest'] as Map<String, dynamic>?;

    return VerificationResultData(
      status: statusStr,
      message: data['message']?.toString() ?? _defaultMessageForStatus(statusStr),
      details: data['details']?.toString() ?? _defaultDetailsForStatus(statusStr),
      guestName: guestData?['name']?.toString(),
      guestPhone: guestData?['phone']?.toString(),
      companionsCount: guestData?['companions_count'] != null
          ? int.tryParse(guestData!['companions_count'].toString())
          : null,
      tableNumber: guestData?['table_number']?.toString(),
      isTrial: data['is_trial'] == true || isTrial,
    );
  }

  factory VerificationResultData.fromString(String status) {
    final upper = status.toUpperCase();
    return VerificationResultData(
      status: upper,
      message: _defaultMessageForStatus(upper),
      details: _defaultDetailsForStatus(upper),
      isTrial: upper.contains('TRIAL') || upper.contains('تجربة'),
    );
  }

  factory VerificationResultData.invalid({String? details}) {
    return VerificationResultData(
      status: 'INVALID',
      message: 'رمز QR غير صالح',
      details: details ?? 'لم يتم العثور على دعوة صالحة مرتبطة بهذا الرمز.',
    );
  }

  static String _defaultMessageForStatus(String status) {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'دخول مقبول';
      case 'ALREADY_USED':
        return 'مستخدم مسبقاً';
      case 'EXPIRED':
        return 'دعوة منتهية الصلاحية';
      case 'INVALID':
      default:
        return 'رمز QR غير صالح';
    }
  }

  static String _defaultDetailsForStatus(String status) {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'دعوة صالحة ومؤكدة. تم تسجيل الدخول بنجاح.';
      case 'ALREADY_USED':
        return 'تم استخدام هذه الدعوة مسبقًا ولا يمكن استخدامها مرة أخرى.';
      case 'EXPIRED':
        return 'تاريخ أو وقت هذه الفعالية قد انتهى مسبقاً ولا يمكن الدخول بها.';
      case 'INVALID':
      default:
        return 'لم يتم العثور على دعوة صالحة مرتبطة بهذا الرمز.';
    }
  }
}
