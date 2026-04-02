package com.haui.vtech.service;

import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.util.FileValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String uploadImage(MultipartFile file, ImageFolder folder) {
        try {
            FileValidator.validateImage(file);

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String key = folder.getFolder() + "/" + fileName;

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request,
                    RequestBody.fromBytes(file.getBytes()));
            return "https://" + bucketName + ".s3.amazonaws.com/" + key;
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isBlank()) return;

            String key = extractKeyFromUrl(imageUrl);

            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(request);
        } catch (Exception e) {
            throw new AppException(ErrorCode.DELETE_IMAGE_FAILED);
        }
    }

    private String extractKeyFromUrl(String imageUrl) {
        return imageUrl.substring(imageUrl.indexOf(".com/") + 5);
    }
}
