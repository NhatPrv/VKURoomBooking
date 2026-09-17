# VKU Cross-Platform Mobile App Development — Mini-Project 2
## Real-time Study Room Booking App (React Native & Expo)

[![Học phần](https://img.shields.io/badge/Course-Lập_trình_Đa_nền_tảng-0B3B60.svg)](https://vku.udn.vn/)
[![Học kỳ](https://img.shields.io/badge/Semester-Học_kỳ_6_(2025--2026)-00A896.svg)](https://vku.udn.vn/)
[![Tuần học](https://img.shields.io/badge/Timeline-Tuần_5_--_Tuần_6-D32F2F.svg)](#)
[![Trọng số](https://img.shields.io/badge/Weight-10%25_Điểm_học_phần-F59E0B.svg)](#)
[![Giảng viên phụ trách](https://img.shields.io/badge/Instructor-TS._Nguyễn_Thanh_Tuấn-0B3B60.svg)](#)
[![Đơn vị đào tạo](https://img.shields.io/badge/Institution-VKU_Khoa_CNTT_%26_TT-185A9D.svg)](https://vku.udn.vn/)

---

## 1. Problem Scenario (Bối Cảnh Thực Tế Tại VKU)
Tại Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU), nhu cầu sử dụng phòng học nhóm, phòng thực hành máy trạm chuyên dụng (AI/IoT Lab tại Khu V) và phòng tự học yên tĩnh (Khu A, B, C) của sinh viên là rất lớn. Tuy nhiên, quy trình truyền thống tồn tại 3 bất cập nghiêm trọng:
1. **Kiểm tra cửa phòng vật lý thủ công:** Sinh viên phải đi bộ qua các tầng nhà tại các khu giảng đường rộng lớn để ngó từng phòng xem có trống hay không, gây mất thời gian và gián đoạn buổi học của các nhóm đang sử dụng.
2. **Xung đột đặt chỗ (Booking Collision / Race Condition):** Khi nhiều nhóm sinh viên cùng có nhu cầu sử dụng vào một khung giờ (đặc biệt là các ca sát giờ thi đồ án môn học), thường xảy ra tình trạng 2 nhóm cùng đến nhận phòng tại cùng thời điểm, dẫn đến tranh cãi do hệ thống ghi nhận thiếu cơ chế khóa đồng thời.
3. **Thiếu bằng chứng nhận phòng số hóa:** Cán bộ trực phòng và bảo vệ tòa nhà gặp khó khăn trong việc xác thực sinh viên có quyền sử dụng phòng mà không làm lộ dữ liệu cá nhân.

**Ứng dụng VKU Room Booking** ra đời nhằm số hóa toàn diện quy trình: cung cấp trạng thái phòng học thời gian thực, cơ chế khóa ca học chống xung đột đồng thời (Optimistic UI kèm Snapshot Rollback), cấp thẻ phòng điện tử (Digital Room Pass) tích hợp mã QR động và lập lịch nhắc nhở 15 phút trước giờ nhận phòng qua Local Notifications.

---

## 2. Core Feature Implementation Checklist (Bảng Kiểm Tính Năng)

| STT | Tính Năng Cốt Lõi | Công Nghệ / Kỹ Thuật Triển Khai | Trạng Thái |
| :--- | :--- | :--- | :---: |
| 1 | **Danh sách phòng 60fps** | `<FlatList>` với `initialNumToRender={8}`, `maxToRenderPerBatch={5}`, `windowSize={5}`, `removeClippedSubviews={true}` | ✅ Hoàn thành 100% |
| 2 | **Triệt tiêu Re-render** | Component `RoomCard` bọc trong `React.memo` với hàm so sánh tùy biến | ✅ Hoàn thành 100% |
| 3 | **Bộ lọc đa tham số** | FilterChips: Tòa nhà (A, B, C, V), Sức chứa (≥4, 8, 12, 16), Tiện ích (PC, Projector, AC...) | ✅ Hoàn thành 100% |
| 4 | **Lưới chọn 4 ca học tiêu chuẩn** | `TimeSlotGrid` hiển thị 4 ca học chuẩn VKU kèm **Visual Disabled State** cho ca đã bị chiếm | ✅ Hoàn thành 100% |
| 5 | **Optimistic UI Engine** | Gán slot sang 'occupied' ngay lập tức tại UI, tự động **Rollback** khi gặp lỗi 409 Conflict | ✅ Hoàn thành 100% |
| 6 | **Quản lý State & Persistence** | Zustand Store `useBookingStore` tích hợp middleware `persist` cùng `@react-native-async-storage/async-storage` | ✅ Hoàn thành 100% |
| 7 | **Thẻ nhận phòng QR động** | `BookingPassModal` sinh mã dynamic QR (`react-native-qrcode-svg`) mã hóa token đặt phòng | ✅ Hoàn thành 100% |
| 8 | **Thông báo cục bộ 15 phút** | `expo-notifications` lập lịch nhắc nhở trước giờ check-in chính xác 15 phút (kèm kênh âm thanh Android) | ✅ Hoàn thành 100% |
| 9 | **Test Harness Giảng Viên** | Công tắc bật/tắt ép lỗi 409 Race Condition ngay trong màn hình để TS. Nguyễn Thanh Tuấn chấm điểm | ✅ Hoàn thành 100% |

---

## 3. Architecture & Directory Tree (Kiến Trúc 3 Tầng Decoupled)

Ứng dụng tuân thủ nghiêm ngặt mô hình kiến trúc 3 lớp phân tách theo giáo trình Tuần 1 môn Lập trình đa nền tảng:

```text
VKURoomBooking/
├── assets/                             # Icons, Splash Screen, Mock Assets
├── docs/                               # Bộ tài liệu kỹ thuật chuyên sâu
│   ├── ARCHITECTURE.md                 # Luồng Unidirectional Zustand & Phân tích FlatList 60fps
│   ├── RACE_CONDITION_DEEPDIVE.md      # Phân tích tranh chấp đồng thời 07:30 - 09:30 & 3 lớp phòng vệ
│   └── REPORT_TEMPLATE.md              # Template báo cáo kỹ thuật 2-4 trang theo chuẩn VKU
├── src/
│   ├── types/                          # 100% Strict TypeScript Types (Không any)
│   │   ├── room.ts                     # Types cho Room, Building, Amenity, TimeSlot
│   │   ├── booking.ts                  # Types cho Booking, SlotOccupancy, UserSession
│   │   └── navigation.ts               # RootStackParamList & BottomTabParamList
│   ├── constants/
│   │   ├── theme.ts                    # Hệ thống Design Tokens: Colors, Spacing, Shadows, Radius
│   │   └── mockData.ts                 # Dữ liệu thực tế 12 phòng học tại các khu V, A, B, C và 4 ca VKU
│   ├── utils/
│   │   ├── dateTimeUtils.ts            # Xử lý ngày ISO, chuyển đổi thứ/ngày, tính giờ nhắc nhở 15 phút
│   │   └── soundEffects.ts             # Haptic vibration phản hồi xúc giác khi đặt phòng / báo lỗi
│   ├── services/
│   │   ├── roomApi.ts                  # Mock Server có Latency 300-600ms & Giả lập lỗi 409 Conflict
│   │   └── notificationService.ts      # Quản lý kênh Android & Lập lịch thông báo expo-notifications
│   ├── store/
│   │   └── useBookingStore.ts          # Zustand Store: Quản trị State, Optimistic UI & Snapshot Rollback
│   ├── components/                     # Tầng giao diện tái sử dụng
│   │   ├── Header.tsx                  # VKU Smart Campus Header kèm chỉ báo 409 Test Mode
│   │   ├── FilterChips.tsx             # Thanh lọc ngang Tòa nhà, Sức chứa và Trang thiết bị
│   │   ├── RoomCard.tsx                # Card phòng bọc React.memo tối ưu 60fps
│   │   ├── TimeSlotGrid.tsx            # Lưới 4 ca học tự động vô hiệu hóa ca bận
│   │   └── BookingPassModal.tsx        # Thẻ vé Digital Pass kèm Dynamic QR Code
│   ├── screens/                        # Tầng màn hình chính
│   │   ├── BrowseRoomsScreen.tsx       # Danh sách tra cứu phòng với FlatList tối ưu 60fps
│   │   ├── RoomDetailScreen.tsx        # Chi tiết phòng, chọn ca, đặt phòng với Optimistic UI
│   │   ├── MyBookingsScreen.tsx        # Quản lý các lượt đặt đang hoạt động & lịch sử
│   │   └── ProfileScreen.tsx           # Hồ sơ sinh viên & Bảng điều khiển kiểm thử giảng viên
│   └── navigation/
│       └── RootNavigator.tsx           # Kết hợp React Navigation 7 Bottom Tabs lồng trong Native Stack
├── app.json                            # Cấu hình Expo, Bundle ID edu.vku.roombooking & Permissions
├── App.tsx                             # Điểm khởi động: SafeAreaProvider & RootNavigator Bootstrap
├── index.ts                            # Expo registerRootComponent Entry Point
├── package.json                        # Dependencies chuẩn hóa tương thích Expo SDK 52
├── tsconfig.json                       # Cấu hình Strict TypeScript
└── README.md                           # Tài liệu tổng quan dự án
```

---

## 4. Race Condition Resolution Blueprint (Cơ Chế Khóa Tranh Chấp Đồng Thời)

### A. Kịch bản lỗi
Hai sinh viên **A (Long Nhật)** (MSSV: 23IT196) và **B** (MSSV: 23IT099) cùng mở phòng `V.204` vào lúc 08:00:00 và cùng chạm nút **"Xác Nhận Đặt"** cho khung giờ **07:30 – 09:30** vào ngày mai tại cùng mili-giây thứ 120.

```
Sinh viên A (UI) ----[ Chạm Đặt Slot 1 ]---> Optimistic: Gán Slot 1 'Occupied' (Snapshot Saved)
                                                  |
                                             Gửi API Request (Network Latency: 400ms)
                                                  |
Sinh viên B (UI) ----[ Chạm Đặt Slot 1 ]---> Optimistic: Gán Slot 1 'Occupied' (Snapshot Saved)
                                                  |
                                             Gửi API Request (Network Latency: 450ms)
                                                  v
                    ====================== SERVER / DATABASE ======================
                    Request A đến trước (380ms) -> Kiểm tra Slot 1 TRỐNG -> Ghi DB -> Trả 200 OK
                    Request B đến sau  (430ms) -> Kiểm tra Slot 1 ĐÃ CÓ -> Trả 409 CONFLICT!
                    ==============================================================
                                                  |
Sinh viên A nhận 200 OK  --------------------> COMMIT: Giữ nguyên trạng thái, sinh QR Pass, Lên lịch Notif
Sinh viên B nhận 409 ERR --------------------> ROLLBACK: Khôi phục Snapshot, Trả lại Slot rảnh, Báo Alert!
```

### B. Cơ chế 2 đầu: Client Optimistic Rollback & Server Composite Constraint
1. **Phía Client (Zustand + React Native):**
   - Trước khi gửi request, Store lưu giữ bản sao trạng thái tức thời `previousOccupiedSlots` và `previousReservations`.
   - Lập tức cập nhật UI sang trạng thái bận để người dùng cảm thấy ứng dụng phản hồi trong 0ms.
   - Nếu nhận HTTP `409 Conflict` (hoặc lỗi timeout mạng), Store ngay lập tức ghi đè lại state bằng bản Snapshot, hiển thị hộp thoại cảnh báo và rung phản hồi lỗi (`feedbackEffects.errorAlert()`).
2. **Phía Server / Database:**
   - Sử dụng khóa duy nhất tổ hợp (Composite Unique Constraint):
     ```sql
     ALTER TABLE room_bookings 
     ADD CONSTRAINT uq_room_date_slot UNIQUE (room_id, booking_date, slot_id);
     ```
   - Xử lý giao dịch nguyên tử (Atomic Transaction with Row-level Lock):
     ```sql
     BEGIN TRANSACTION;
     SELECT * FROM room_bookings 
     WHERE room_id = $1 AND booking_date = $2 AND slot_id = $3 
     FOR UPDATE;
     -- Nếu đã tồn tại -> ROLLBACK & Throw 409 Conflict
     -- Nếu chưa tồn tại -> INSERT & COMMIT
     COMMIT;
     ```

---

## 5. Step-by-step Setup & Execution (Hướng Dẫn Cài Đặt & Chạy)

### Bước 1: Cài đặt thư viện phụ thuộc
Đảm bảo đã cài đặt Node.js LTS (khuyến nghị >= v20) và npm:
```bash
npm install
```

### Bước 2: Kiểm tra tính toàn vẹn kiểu dữ liệu (Strict TypeScript Check)
Dự án được cấu hình 100% Strict Mode, không có lỗi lỏng lẻo:
```bash
npm run ts:check
```

### Bước 3: Khởi chạy Expo Dev Server
Chạy lệnh khởi động máy chủ Metro Bundler:
```bash
npx expo start
```

### Bước 4: Chạy với mạng nội bộ hoặc qua Expo Tunnel
- **Cách 1 (Cùng mạng Wi-Fi):** Mở ứng dụng **Expo Go** trên điện thoại thật (iOS hoặc Android), quét mã QR trên màn hình Terminal.
- **Cách 2 (Mạng khác Wi-Fi / Mạng Ký túc xá VKU có Firewall):** Sử dụng cờ `--tunnel` của Expo:
  ```bash
  npx expo start --tunnel
  ```

---

## 6. Hướng Dẫn Giảng Viên Kiểm Thử Tính Năng (Grading Guide)

Để hỗ trợ **TS. Nguyễn Thanh Tuấn** và Hội đồng chấm đồ án kiểm thử trực quan trên điện thoại thật trong 3 phút:

1. **Kiểm tra FlatList 60fps & Bộ lọc đa tham số:**
   - Mở màn hình **"Tra Cứu Phòng"**.
   - Thử vuốt nhanh danh sách 12 phòng học để cảm nhận độ mượt 60fps (nhờ `initialNumToRender={8}`, `windowSize={5}`, `removeClippedSubviews={true}`).
   - Bấm chọn các chip lọc **Khu V**, **≥ 12 chỗ**, **High-spec PC**; danh sách sẽ cập nhật tức thì.
2. **Kiểm tra Visual Disabled State ca học:**
   - Chọn phòng **V.204** (hoặc A.102) tại ngày hôm nay.
   - Nhìn vào lưới **TimeSlotGrid**: Ca 1 (07:30 - 09:30) và Ca 3 (13:00 - 15:00) đã bị khóa tự động với nhãn đỏ *"Đã có người đặt"*, không thể ấn chọn.
3. **Kiểm tra Cơ Chế Race Condition & Optimistic Rollback:**
   - Tại màn hình chi tiết phòng, cuộn xuống ô màu đỏ: **"Harness Kiểm Thử Giảng Viên"**.
   - Bật công tắc **"Giả lập xung đột đồng thời (409 Conflict)"**.
   - Chọn một ca học còn trống (ví dụ: Ca 2: 09:30 - 11:30) và bấm **"Xác Nhận Đặt"**.
   - Quan sát: UI lập tức khóa ca học (Optimistic), sau 500ms server ném lỗi 409, ứng dụng rung cảnh báo, bật Alert giải thích chi tiết xung đột và **tự động hoàn tác (Rollback)** trạng thái slot về lại màu xanh rảnh rỗi ban đầu!
4. **Kiểm tra Thẻ phòng Digital Pass & Dynamic QR Code:**
   - Tắt công tắc giả lập 409 và đặt phòng bình thường.
   - Thẻ phòng vé điện tử sẽ hiện lên với mã QR động tạo bởi `react-native-qrcode-svg`.
   - Vào tab **"Lịch Đặt"** để xem thẻ đã được lưu bền vững vào `AsyncStorage` (ngay cả khi tắt ứng dụng mở lại).

---

## 7. Deliverables Package Checklist (Gói Sản Phẩm Nộp Bài VKU)

- [x] **Mã nguồn hoàn chỉnh 100% (Production-Ready):** Không có placeholder, không có `// TODO`, tuân thủ 100% TypeScript Strict.
- [x] **Hệ thống tài liệu chuyên sâu:**
  - [x] `README.md`: Hướng dẫn vận hành & Barem chấm điểm.
  - [x] `docs/ARCHITECTURE.md`: Phân tích luồng dữ liệu Zustand & FlatList 60fps.
  - [x] `docs/RACE_CONDITION_DEEPDIVE.md`: Phân tích sâu kịch bản va chạm 07:30 - 09:30 và kiến trúc 3 lớp chống va chạm.
  - [x] `docs/REPORT_TEMPLATE.md`: Khung mẫu báo cáo kỹ thuật 2–4 trang nộp file PDF.
- [x] **Link GitHub Public Repository:** [https://github.com/NhatPrv/VKURoomBooking](https://github.com/NhatPrv/VKURoomBooking)
- [ ] **Link Demo Expo Go / Video:** Đính kèm video quay màn hình điện thoại thật dài 2-3 phút minh họa đầy đủ 4 ca học, mã QR và cơ chế Rollback.
