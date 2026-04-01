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

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "webp"
    );

    public static void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }

        String extension = originalFilename
                .substring(originalFilename.lastIndexOf(".") + 1)
                .toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException(ErrorCode.FILE_TYPE_INVALID);
        }
    }
}
