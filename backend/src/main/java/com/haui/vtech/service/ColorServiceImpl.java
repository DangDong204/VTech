package com.haui.vtech.service;

import com.haui.vtech.dto.color.ColorRequest;
import com.haui.vtech.dto.color.ColorResponse;
import com.haui.vtech.entity.ColorEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ColorMapper;
import com.haui.vtech.repository.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorServiceImpl implements ColorService {

    private final ColorRepository colorRepository;
    private final ColorMapper colorMapper;

    @Override
    public List<ColorResponse> getAll() {
        return colorRepository.findAll().stream().map(colorMapper::toResponse).toList();
    }

    @Override
    public ColorResponse create(ColorRequest request) {
        // TODO: Kiểm tra trùng tên màu sắc nếu cần thiết
        ColorEntity entity = colorMapper.toEntity(request);
        return colorMapper.toResponse(colorRepository.save(entity));
    }

    @Override
    public ColorResponse update(String id, ColorRequest request) {
        ColorEntity entity = colorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND, id));
        colorMapper.updateEntity(entity, request);
        return colorMapper.toResponse(colorRepository.save(entity));
    }

    @Override
    public String delete(String id) {
        ColorEntity entity = colorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND, id));

        if (!entity.getProductVariants().isEmpty()) {
            throw new AppException(ErrorCode.COLOR_USED_BY_VARIANT, entity.getColorName());
        }
        colorRepository.delete(entity);
        return entity.getColorName();
    }
}
