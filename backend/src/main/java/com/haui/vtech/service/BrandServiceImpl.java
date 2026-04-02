package com.haui.vtech.service;

import com.haui.vtech.dto.brand.BrandCreationRequest;
import com.haui.vtech.dto.brand.BrandResponse;
import com.haui.vtech.dto.brand.BrandUpdateRequest;
import com.haui.vtech.entity.BrandEntity;
import com.haui.vtech.enums.BrandStatus;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.BrandMapper;
import com.haui.vtech.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final S3Service s3Service;

    @Override
    public BrandResponse create(BrandCreationRequest request, MultipartFile brandLogo) {

        if(brandRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.BRAND_SLUG_EXISTED, request.getSlug());
        }

        BrandEntity newBrand = brandMapper.toBrandEntity(request);

        if(!ObjectUtils.isEmpty(brandLogo)) {
            String brandUrl = s3Service.uploadImage(brandLogo, ImageFolder.BRAND);
            newBrand.setBrandLogo(brandUrl);
        }

        BrandEntity savedBrand = brandRepository.save(newBrand);

        return brandMapper.toBrandResponse(savedBrand);
    }

    @Override
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findByStatusNot(BrandStatus.DELETED).stream().map(brandMapper::toBrandResponse).toList();
    }

    @Override
    public BrandResponse getById(String id) {
        return brandRepository.findById(id).map(brandMapper::toBrandResponse)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
    }

    @Override
    public BrandResponse update(String id, BrandUpdateRequest request, MultipartFile brandLogo) {
        BrandEntity brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND, id));

        if(!brand.getSlug().equals(request.getSlug())
                && brandRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.BRAND_SLUG_EXISTED, request.getSlug());
        }

        if(brandLogo != null && !brandLogo.isEmpty()) {
            String brandLogoUrl = s3Service.uploadImage(brandLogo, ImageFolder.BRAND);
            brand.setBrandLogo(brandLogoUrl);
        }

        brandMapper.updateEntity(brand, request);

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    @Override
    public void delete(String id) {
        BrandEntity brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND, id));

        s3Service.deleteImage(brand.getBrandLogo());
        // TODO: logic to check if the brand is used by any product

        brandRepository.delete(brand);
    }

    @Override
    @Transactional
    public void deleteSoft(String id) {
        int affectedRows  = brandRepository.softDelete(id, LocalDateTime.now());

        if (affectedRows  == 0) {
            throw new AppException(ErrorCode.BRAND_NOT_FOUND, id);
        }
    }

    @Override
    public List<BrandResponse> getAllInTrash() {
        return brandRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(BrandStatus.DELETED)
                .stream().map(brandMapper::toBrandResponse).toList();
    }

    @Override
    @Transactional
    public void restore(String id) {
        int affectedRows = brandRepository.restore(id);

        if (affectedRows == 0) {
            throw new AppException(ErrorCode.BRAND_NOT_FOUND, id);
        }
    }
}
