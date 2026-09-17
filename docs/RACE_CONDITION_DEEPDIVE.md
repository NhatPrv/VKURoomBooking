# PHÂN TÍCH CHUYÊN SÂU TRANH CHẤP ĐỒNG THỜI (RACE CONDITION DEEP DIVE)
## Đề Tài: Xử Lý Xung Đột Đặt Phòng Thời Gian Thực Tại VKU
**Giảng viên phụ trách:** TS. Nguyễn Thanh Tuấn  
**Môn học:** Lập trình Đa nền tảng (Cross-Platform Mobile App Development)

---

## 1. Bản Chất Kịch Bản Lỗi (The Concurrency Collision Problem)

### Kịch bản thực tế:
Vào lúc 07:00:00 sáng, hệ thống mở cổng đăng ký phòng thực hành máy trạm cao cấp **V.204** cho đợt báo cáo đồ án kết thúc học phần.
- **Sinh viên 1 (An - MSSV: 22IT045):** Muốn đặt Ca 1 (07:30 – 09:30) ngày 18/09/2026.
- **Sinh viên 2 (Bình - MSSV: 22IT099):** Cũng muốn đặt đúng Ca 1 phòng V.204 ngày 18/09/2026.

Cả hai sinh viên nhìn thấy trên màn hình điện thoại Ca 1 đang có màu xanh lá (*"Còn trống"*). Vào đúng thời điểm **07:00:01.050**, cả An và Bình cùng ấn nút **"Xác Nhận Đặt"**.

```
Thời Gian (ms)      Sinh viên An (Client A)            Sinh viên Bình (Client B)           Cơ sở dữ liệu (Database Server)
   T = 0ms           Chạm nút Đặt Slot 1               Chạm nút Đặt Slot 1                 Slot 1: TRỐNG
   T = 10ms          Optimistic UI: Đổi sang Đỏ         Optimistic UI: Đổi sang Đỏ          Slot 1: TRỐNG
   T = 20ms          Gửi HTTP POST /book (Request A)   Gửi HTTP POST /book (Request B)    Slot 1: TRỐNG
   T = 380ms         [Đang truyền qua mạng Wi-Fi]       Packet B đến Server trước! ----->  Bắt đầu Transaction B
   T = 400ms         Packet A đến Server sau --------> Đợi Transaction B xử lý...         Transaction B: Ghi nhận Bình thành công!
   T = 420ms                                           Nhận HTTP 200 OK (Thành công) <--- Commit Transaction B (Slot 1: ĐÃ ĐẶT)
   T = 440ms         Server xử lý Request A ---------> Phát hiện Slot 1 ĐÃ CÓ CHỦ!
   T = 460ms         Nhận HTTP 409 Conflict <-------------------------------------------- Ném 409 Conflict Error
   T = 480ms         ROLLBACK UI: Đổi lại Xanh lá
                     Bật Hộp thoại cảnh báo va chạm!
```

Nếu một ứng dụng di động được viết sơ sài (Naive Implementation) mà không có cơ chế xử lý đồng thời, cả An và Bình đều sẽ nhận được thông báo thành công. Đến giờ học, hai nhóm cùng có mặt tại phòng V.204, dẫn đến xung đột thực tế nghiêm trọng.

---

## 2. Giải Pháp 3 Lớp Phòng Vệ Toàn Diện (3-Tier Defense-in-Depth Architecture)

Để giải quyết triệt để bài toán này, hệ thống áp dụng chiến lược phòng thủ 3 lớp phối hợp chặt chẽ giữa Thiết bị di động (Client), Máy chủ dữ liệu (Backend Database) và Kênh giao tiếp thời gian thực (Real-time Gateway):

```
+--------------------------------------------------------------------------------+
| LỚP 1: CLIENT-SIDE DEFENSE (REACT NATIVE & ZUSTAND)                            |
| 1. Double-Submit Debouncing (Khóa nút bấm sau lần chạm đầu tiên)               |
| 2. Snapshot Rollback Engine (Lưu trạng thái cũ, khôi phục nếu nhận lỗi 409)     |
| 3. Local Vibration & Visual Alert (Phản hồi xúc giác cho người dùng)          |
+---------------------------------------+----------------------------------------+
                                        | HTTP REST Request
                                        v
+--------------------------------------------------------------------------------+
| LỚP 2: SERVER-SIDE DEFENSE (ATOMIC TRANSACTIONS & RDBMS CONSTRAINTS)           |
| 1. Khóa bi quan (Pessimistic Row-Level Locking: SELECT ... FOR UPDATE)         |
| 2. Khóa duy nhất phức hợp (Composite Unique Constraint: room_id + date + slot)  |
| 3. Mã trạng thái chuẩn RESTful: HTTP 409 Conflict                              |
+---------------------------------------+----------------------------------------+
                                        | Broadcast Event
                                        v
+--------------------------------------------------------------------------------+
| LỚP 3: REAL-TIME BROADCAST LAYER (WEBSOCKET / SERVER-SENT EVENTS)              |
| 1. Phát sự kiện `ROOM_SLOT_OCCUPIED` đến toàn bộ các sinh viên đang mở app     |
| 2. Tự động vô hiệu hóa (Visual Disabled) slot đó trên màn hình Client khác     |
+--------------------------------------------------------------------------------+
```

---

## 3. Chi Tiết Kỹ Thuật Từng Lớp Phòng Vệ

### Lớp 1: Client-Side Defense (Triển khai trực tiếp trong mã nguồn dự án)

#### 1. Chống gửi lặp yêu cầu (Double-Submit Debouncing):
Khi người dùng bấm nhanh 2 lần liên tiếp do sốt ruột, cờ `isSubmittingBooking` được bật ngay lập tức:
```typescript
// Trích từ src/store/useBookingStore.ts
if (state.isSubmittingBooking) {
  return { 
    success: false, 
    error: 'Hệ thống đang xử lý yêu cầu trước đó, vui lòng đợi trong giây lát.' 
  };
}
```

#### 2. Cơ chế Snapshot Rollback trong Optimistic UI:
Thay vì chờ đợi phản hồi từ server (mất 400–600ms gây cảm giác lag), ứng dụng cập nhật ngay giao diện sang trạng thái đã đặt, nhưng luôn giữ bản sao lưu dự phòng:
```typescript
// Bước 1: Chụp ảnh trạng thái trước biến đổi
const previousReservations = [...state.activeReservations];
const previousOccupiedSlots = [...state.occupiedSlots];

// Bước 2: Tạm gán trạng thái bận trên giao diện người dùng
set({
  isSubmittingBooking: true,
  activeReservations: [optimisticBooking, ...state.activeReservations],
  occupiedSlots: [...state.occupiedSlots, optimisticOccupancy],
});

try {
  // Bước 3: Gửi request bất đồng bộ tới Server
  const confirmedBooking = await roomApi.bookRoom(payload, state.raceConditionDemoMode);
  // Thành công: Ghi nhận chính thức
} catch (err) {
  // Bước 4: XẢY RA LỖI (409 CONFLICT) -> LẬP TỨC HOÀN TÁC TRẠNG THÁI
  set({
    isSubmittingBooking: false,
    activeReservations: previousReservations,
    occupiedSlots: previousOccupiedSlots,
  });
  feedbackEffects.errorAlert(); // Rung cảnh báo
  return { success: false, error: err.message };
}
```

---

### Lớp 2: Server-Side Defense (Database Schema & Isolation Level)

Dù Client có xử lý tối ưu đến đâu, tính toàn vẹn dữ liệu (Data Integrity) bắt buộc phải được đảm bảo bằng ACID Transactions tại tầng cơ sở dữ liệu.

#### 1. Composite Unique Constraint (Ràng buộc duy nhất cấp độ vật lý):
Không bao giờ cho phép 2 dòng dữ liệu có cùng phòng, ngày và ca học tồn tại song song:
```sql
CREATE TABLE room_reservations (
    id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(32) NOT NULL,
    booking_date DATE NOT NULL,
    slot_id VARCHAR(16) NOT NULL,
    student_id VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_room_date_slot UNIQUE (room_id, booking_date, slot_id)
);
```

#### 2. Khóa dòng cấp độ giao dịch (Pessimistic Row Lock với `SELECT FOR UPDATE`):
```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Khóa độc quyền bản ghi ca học của phòng trong ngày chỉ định
SELECT id FROM room_reservations
WHERE room_id = 'room_v204' 
  AND booking_date = '2026-09-18' 
  AND slot_id = 'SLOT_1'
FOR UPDATE;

-- Nếu tìm thấy bản ghi đã tồn tại -> Ném lỗi và ROLLBACK
-- IF FOUND THEN
--    ROLLBACK;
--    RAISE EXCEPTION 'HTTP 409: Slot already occupied';

-- Nếu chưa có ai đặt -> Tiến hành INSERT bản ghi của sinh viên đến trước
INSERT INTO room_reservations (id, room_id, booking_date, slot_id, student_id)
VALUES ('bk_1718001', 'room_v204', '2026-09-18', 'SLOT_1', '22IT099');

COMMIT;
```

---

### Lớp 3: Real-Time Layer (Cập nhật trực tiếp qua WebSocket / SSE)

Khi Sinh viên 2 (Bình) hoàn tất đặt phòng thành công, Backend Gateway lập tức bắn một bản tin WebSocket qua kênh chung của phòng học:

```json
{
  "event": "SLOT_OCCUPIED_EVENT",
  "payload": {
    "roomId": "room_v204",
    "date": "2026-09-18",
    "slotId": "SLOT_1",
    "bookedBy": "22IT099",
    "timestamp": 1773712800000
  }
}
```

Tại ứng dụng của Sinh viên 1 (An) và tất cả các sinh viên khác đang mở màn hình phòng V.204:
- Listener bắt được sự kiện này và tự động thêm `{ roomId: 'room_v204', slotId: 'SLOT_1', ... }` vào danh sách `occupiedSlots` trong Zustand Store.
- Ngay lập tức, ca học đó chuyển sang màu đỏ gạch kèm nhãn **"Đã có người đặt"** và nút bấm bị vô hiệu hóa (disabled), loại bỏ nguy cơ người dùng ấn phải ca học đã bị chiếm chỗ.

---

## 4. Kiểm Thử Cơ Chế Này Trong Ứng Dụng (Instructor Test Harness)

Để phục vụ công tác chấm điểm và bảo vệ đồ án của TS. Nguyễn Thanh Tuấn:
1. Mở bất kỳ phòng nào tại màn hình chi tiết (`RoomDetailScreen`).
2. Kéo xuống phần màu đỏ: **"Harness Kiểm Thử Giảng Viên"**.
3. Bật công tắc: **"Giả lập xung đột đồng thời (409 Conflict)"**.
4. Bấm đặt một ca học:
   - Trong 0.5 giây đầu, ca học chuyển màu bận (Optimistic).
   - Sau khi mock API trả về mã lỗi 409 mô phỏng, hộp thoại cảnh báo va chạm hiện ra, điện thoại rung theo nhịp cảnh báo lỗi, và ca học lập tức được trả về trạng thái rảnh ban đầu.
