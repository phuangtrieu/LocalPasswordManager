# Password In Your Hands - Trình Quản Lý Mật Khẩu Cá Nhân

*[Read in English](README_en.md)*

Một ứng dụng (PWA) quản lý mật khẩu không cần server trung gian. Toàn bộ dữ liệu được lưu thẳng vào **Google Sheets** của bạn và được mã hóa **AES-256** ngay trên trình duyệt. Tuyệt đối riêng tư, bảo mật Zero-Knowledge, 100% do bạn kiểm soát.

## ✨ Tính Năng Nổi Bật
- **Zero-Knowledge Security:** Mật khẩu chỉ có thể được giải mã trên máy của bạn bằng Master Password. Ngay cả khi lộ link Google Sheet, không ai đọc được dữ liệu.
- **Serverless:** Dùng Google Sheets cá nhân làm Database hoàn toàn miễn phí.
- **PWA Ready:** Cài đặt trực tiếp vào PC, iOS, Android dùng như một App độc lập.
- **Đồng bộ siêu tốc:** Xuất/Nhập file cấu hình (đã mã hóa) để chuyển sang điện thoại/máy tính khác chỉ trong 3 giây.
- **Đa ngôn ngữ:** Hỗ trợ Tiếng Anh / Tiếng Việt.

---

## 🚀 Setup Nhanh (3 Bước)

1. **Host Ứng Dụng:** Đẩy bộ code này lên GitHub của bạn và bật tính năng **GitHub Pages** (hoặc host static web bất kỳ đâu). Bạn sẽ có 1 đường link web (Ví dụ: `https://ten-ban.github.io/PasswordInYourHands`).
2. **Tạo Database:** Tạo một file **Google Sheets** trắng mới tinh và copy lại đường link của file đó.
3. **Lấy Client ID:** 
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/).
   - Tạo Project mới -> Bật **Google Sheets API**.
   - Vào mục Credentials -> Tạo **OAuth Client ID** (chọn loại Web application). 
   - Tại mục *Authorized JavaScript origins*, dán link trang web của bạn ở bước 1 vào. 
   - Tạo xong, Google sẽ cấp cho bạn một chuỗi **Client ID** (dạng `xxxx.apps.googleusercontent.com`).

---

## 💻 Cách Sử Dụng Lần Đầu

1. Mở trang web (link ứng dụng của bạn).
2. Dán **link Google Sheet** và **Client ID** (đã lấy ở bước trên) vào màn hình Thiết lập.
3. Đăng nhập tài khoản Google của bạn để cấp quyền ghi dữ liệu.
4. Tạo một **Master Password** riêng của bạn (Tuyệt đối không được quên!).
5. Xong! Bắt đầu lưu trữ mật khẩu.

*(💡 **Mẹo:** Ở giao diện chính, hãy bấm nút 📥 **Xuất cấu hình** để tải file backup. Khi dùng máy khác, bạn chỉ việc chọn tải file backup này lên, nhập Master Password là ứng dụng tự động thiết lập lại mọi thứ!)*
Demon on: https://phuangtrieu.github.io/LocalPasswordManager/
