package com.haui.vtech.service;

import com.haui.vtech.dto.tag.TagCreationRequest;
import com.haui.vtech.dto.tag.TagResponse;
import com.haui.vtech.dto.tag.TagUpdateRequest;

import java.util.List;

public interface TagService {

    TagResponse create(TagCreationRequest request);

    List<TagResponse> getAllTags();

    TagResponse getById(String id);

    TagResponse update(String id, TagUpdateRequest request);

    String delete(String id);

    String deleteSoft(String id);

    List<TagResponse> getAllInTrash();

    String restore(String id);

}
