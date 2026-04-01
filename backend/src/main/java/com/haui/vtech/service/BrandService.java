package com.haui.vtech.service;

import com.haui.vtech.dto.brand.BrandCreationRequest;
import com.haui.vtech.dto.brand.BrandResponse;
import com.haui.vtech.dto.brand.BrandUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BrandService {

    BrandResponse create(BrandCreationRequest request, MultipartFile brandLogo);

    List<BrandResponse> getAllBrands();

    BrandResponse getById(String id);

    BrandResponse update(String id, BrandUpdateRequest request, MultipartFile brandLogo);

    void delete(String id);

    void deleteSoft(String id);

    List<BrandResponse> getAllInTrash();

    void restore(String id);

    // TODO: getBySlug - chưa thấy cần thiết

    // TODO: getAllByDisplayOrder - chưa thấy cần thiết

}
