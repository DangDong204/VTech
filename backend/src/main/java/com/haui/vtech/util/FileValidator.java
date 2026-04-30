package com.haui.vtech.util;

import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class FileValidator {

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
    );

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "webp"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = List.of(
            "video/mp4", "video/webm", "video/quicktime"
    );
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = List.of(
            "mp4", "webm", "mov"
    );

    public static void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType) || originalFilename == null || !originalFilename.contains(".")) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) throw new AppException(ErrorCode.FILE_TYPE_INVALID);
    }

    // HÀM MỚI: Xử lý cả Ảnh và Video, trả về chuỗi "IMAGE" hoặc "VIDEO"
    public static String validateMediaAndGetType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        if (contentType == null || originalFilename == null || !originalFilename.contains(".")) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

        boolean isImage = ALLOWED_IMAGE_TYPES.contains(contentType) && ALLOWED_IMAGE_EXTENSIONS.contains(extension);
        boolean isVideo = ALLOWED_VIDEO_TYPES.contains(contentType) && ALLOWED_VIDEO_EXTENSIONS.contains(extension);

        if (isImage) {
            // Giới hạn ảnh 5MB
            if (file.getSize() > 5 * 1024 * 1024) throw new AppException(ErrorCode.FILE_TOO_LARGE);
            return "IMAGE";
        }

        if (isVideo) {
            // Giới hạn video 30MB
            if (file.getSize() > 30 * 1024 * 1024) throw new AppException(ErrorCode.FILE_TOO_LARGE);
            return "VIDEO";
        }

        throw new AppException(ErrorCode.FILE_TYPE_INVALID);
    }
}
