package com.haui.vtech.service;

import com.haui.vtech.dto.version.VersionRequest;
import com.haui.vtech.dto.version.VersionResponse;
import com.haui.vtech.entity.VersionEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.VersionMapper;
import com.haui.vtech.repository.VersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VersionServiceImpl implements VersionService {

    private final VersionRepository versionRepository;
    private final VersionMapper versionMapper;

    @Override
    public List<VersionResponse> getAll() {
        return versionRepository.findAll().stream().map(versionMapper::toResponse).toList();
    }

    @Override
    public VersionResponse create(VersionRequest request) {
        // TODO: Kiểm tra trùng tên phiên bản nếu cần thiết
        VersionEntity entity = versionMapper.toEntity(request);
        return versionMapper.toResponse(versionRepository.save(entity));
    }

    @Override
    public VersionResponse update(String id, VersionRequest request) {
        VersionEntity entity = versionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VERSION_NOT_FOUND, id));
        versionMapper.updateEntity(entity, request);
        return versionMapper.toResponse(versionRepository.save(entity));
    }

    @Override
    public String delete(String id) {
        VersionEntity entity = versionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VERSION_NOT_FOUND, id));

        if (!entity.getProductVariants().isEmpty()) {
            throw new AppException(ErrorCode.VERSION_USED_BY_VARIANT, entity.getVersionName());
        }

        versionRepository.delete(entity);
        return entity.getId();
    }
}
