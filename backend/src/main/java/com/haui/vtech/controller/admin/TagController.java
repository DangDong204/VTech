package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.category.CategoryResponse;
import com.haui.vtech.dto.tag.TagCreationRequest;
import com.haui.vtech.dto.tag.TagResponse;
import com.haui.vtech.dto.tag.TagUpdateRequest;
import com.haui.vtech.service.TagService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final MessageUtil messageUtil;

    @PostMapping
    public ApiResponse<TagResponse> createTag(
            @Valid @ModelAttribute TagCreationRequest request
    ) {
        return ApiResponse.<TagResponse>builder()
                .data(tagService.create(request))
                .message(messageUtil.getMessage("tag.created.success", request.getTagName()))
                .build();
    }

    @GetMapping
    public ApiResponse<List<TagResponse>> getAllTags(){
        return ApiResponse.<List<TagResponse>>builder()
                .data(tagService.getAllTags())
                .build();
    }

    @GetMapping("/{tagId}")
    public ApiResponse<TagResponse> getById(@PathVariable String tagId) {
        return ApiResponse.<TagResponse>builder()
                .data(tagService.getById(tagId))
                .build();
    }

    @PutMapping("/{tagId}")
    public ApiResponse<TagResponse> updateTag(
            @PathVariable String tagId,
            @Valid @ModelAttribute TagUpdateRequest request
    ) {
        TagResponse response = tagService.update(tagId, request);
        return ApiResponse.<TagResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("tag.updated.success", response.getTagName()))
                .build();
    }

    @DeleteMapping("/trash/{tagId}")
    public ApiResponse<Void> deleteTag(@PathVariable String tagId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("tag.deleted.success", tagService.delete(tagId)))
                .build();
    }

    @DeleteMapping("/{tagId}")
    public ApiResponse<Void> deleteSoftTag(@PathVariable String tagId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("tag.deleted.soft.success", tagService.deleteSoft(tagId)))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<TagResponse>> getAllInTrash() {
        return ApiResponse.<List<TagResponse>>builder()
                .data(tagService.getAllInTrash())
                .build();
    }

    @PatchMapping("trash/{tagId}")
    public ApiResponse<Void> restoreTag(@PathVariable String tagId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("tag.restored.success", tagService.restore(tagId)))
                .build();
    }

}
