# Chùa Online — Chốn Bình An

Website mẫu Chùa Online với sảnh chùa 3D dựng bằng Three.js, avatar chibi tự tạo từ hình khối, chỗ ngồi, nghi lễ, chat thời gian thực và bảng công đức.

## Yêu cầu
- Node.js 18 trở lên
- Kết nối Internet để tải Three.js và font từ CDN

## Chạy trên Windows
1. Giải nén thư mục.
2. Cài Node.js nếu máy chưa có.
3. Mở CMD/PowerShell tại thư mục `chua-online`.
4. Chạy:
   ```bash
   npm install
   npm start
   ```
5. Mở `http://localhost:8000`.

Để thử nhiều người, mở địa chỉ đó ở nhiều tab hoặc thiết bị trong cùng mạng (để thiết bị khác truy cập, thay `localhost` bằng IP LAN của máy chạy server; cho phép Node.js qua Windows Firewall).

## Tính năng trong bản mẫu
- Tạo tên và chọn Tiểu Sư Phụ / Tiểu Sư Cô.
- Chánh điện 3D với tượng Phật cách điệu, bàn lễ, hoa quả, đèn, chuông, cây cảnh.
- 32 đệm ngồi có thể chọn; chạm nền để di chuyển.
- Nút đứng lên, bái lạy, ngồi thiền, thắp hương, gõ mõ, gõ chuông.
- Chat thời gian thực, tin nhắn hiện thành bong bóng trên avatar.
- Nhạc thiền mô phỏng bằng âm thanh tổng hợp, bật/tắt và thanh âm lượng.
- Thùng công đức mô phỏng, lựa chọn mức tiền; không xử lý thanh toán thật.
- Bảng điểm: thắp hương +10, bái lạy +5, công đức +5, gõ mõ +1, gõ chuông +1.
- Bố cục responsive cho laptop và điện thoại.

## Lưu ý quan trọng
- Đây là bản MVP/demo. Điểm công đức và người chơi lưu trong bộ nhớ của server; khi khởi động lại server, dữ liệu sẽ mất.
- Bản hiện tại chưa có tài khoản, xác thực, cơ sở dữ liệu, kiểm duyệt chat, lưu lịch sử, hoặc thanh toán thật.
- Nhạc hiện tại là âm thanh thiền tổng hợp, không phải bản thu nhạc thiền có bản quyền.
- Tượng Phật và cảnh chùa là mô hình 3D cách điệu dựng bằng hình khối, không phải bản scan tượng thật.
- Nếu triển khai công khai, nên bổ sung cơ sở dữ liệu (SQLite/PostgreSQL), chống spam, giới hạn tốc độ chat, kiểm duyệt nội dung và chính sách quyền riêng tư.
