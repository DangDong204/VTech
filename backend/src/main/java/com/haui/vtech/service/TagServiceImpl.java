package com.haui.vtech.service;

import com.haui.vtech.dto.tag.TagCreationRequest;
import com.haui.vtech.dto.tag.TagResponse;
import com.haui.vtech.dto.tag.TagUpdateRequest;
import com.haui.vtech.entity.BrandEntity;
import com.haui.vtech.entity.TagEntity;
import com.haui.vtech.enums.TagStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.TagMapper;
import com.haui.vtech.repository.ProductRepository;
import com.haui.vtech.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;
    private final ProductRepository productRepository;

    @Override
    public TagResponse create(TagCreationRequest request) {
        if (tagRepository.existsByTagName(request.getTagName())) {
            throw new AppException(ErrorCode.TAG_NAME_EXISTS, request.getTagName());
        }

        TagEntity tag = tagMapper.toTagEntity(request);

        TagEntity savedTag = tagRepository.save(tag);

        return tagMapper.toTagResponse(savedTag);
    }

    @Override
    public List<TagResponse> getAllTags() {
        return tagRepository.findByStatusNot(TagStatus.DELETED).stream().map(tagMapper::toTagResponse).toList();
    }

    @Override
    public TagResponse getById(String id) {
        return tagRepository.findById(id).map(tagMapper::toTagResponse)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND, id));
    }

    @Override
    public TagResponse update(String id, TagUpdateRequest request) {
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND, id));

        if (request.getTagName() != null) {
            String newName = request.getTagName().trim();

            if (!newName.equalsIgnoreCase(tag.getTagName())
                    && tagRepository.existsByTagName(newName)) {
                throw new AppException(ErrorCode.TAG_NAME_EXISTS, newName);
            }

            request.setTagName(newName);
        }

        tagMapper.updateEntity(tag, request);
        return  tagMapper.toTagResponse(tagRepository.save(tag));
    }

    @Override
    public String delete(String id) {
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND, id));

        if (productRepository.existsByTags_Id(id)) {
            throw new AppException(ErrorCode.TAG_IN_USE, tag.getTagName());
        }
        tagRepository.delete(tag);
        return tag.getTagName();
    }

    @Override
    @Transactional
    public String deleteSoft(String id) {
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND, id));

        if (productRepository.existsByTags_Id(id)) {
            throw new AppException(ErrorCode.TAG_IN_USE, tag.getTagName());
        }

        int affectedRows = tagRepository.softDelete(id, LocalDateTime.now());

        if (affectedRows == 0) {
            throw new AppException(ErrorCode.TAG_NOT_FOUND, id);
        }

        return tag.getTagName();
    }

    @Override
    public List<TagResponse> getAllInTrash() {
        return tagRepository
                .findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(TagStatus.DELETED)
                .stream().map(tagMapper::toTagResponse).toList();
    }

    @Override
    @Transactional
    public String restore(String id) {
        TagEntity tag = tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND, id));

        int affectedRows = tagRepository.restore(id);

        if (affectedRows == 0) {
            throw new AppException(ErrorCode.TAG_NOT_FOUND, id);
        }

        return tag.getTagName();
    }


}
