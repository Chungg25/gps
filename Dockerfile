FROM ghcr.io/gis-ops/docker-valhalla/valhalla:latest

# Ép Docker chạy dưới quyền user thông thường (tránh lỗi sudo của Render)
USER valhalla

# Copy toàn bộ file bản đồ ĐÃ DỊCH XONG từ máy tính vào trong khuôn Docker
COPY --chown=valhalla:valhalla ./valhalla_data /custom_files

# Chạy thẳng file thực thi, bỏ qua bước setup bằng sudo
ENTRYPOINT ["valhalla_service", "/custom_files/valhalla.json", "1"]
