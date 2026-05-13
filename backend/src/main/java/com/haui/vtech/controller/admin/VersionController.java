package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.version.VersionRequest;
import com.haui.vtech.dto.version.VersionResponse;
import com.haui.vtech.service.VersionService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/versions")
@RequiredArgsConstructor
public class VersionController {

    private final VersionService versionService;
    private final MessageUtil messageUtil;

    @GetMapping
    public ApiResponse<List<VersionResponse>> getAll() {
        return ApiResponse.<List<VersionResponse>>builder()
                .data(versionService.getAll())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VersionResponse> create(
            @RequestBody @Valid VersionRequest request) {
        return ApiResponse.<VersionResponse>builder()
                .data(versionService.create(request))
                .message(messageUtil.getMessage("version.created.success", request.getVersionName()))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VersionResponse> update(
            @PathVariable String id,
            @RequestBody @Valid VersionRequest request) {
        return ApiResponse.<VersionResponse>builder()
                .data(versionService.update(id, request))
                .message(messageUtil.getMessage("version.updated.success", request.getVersionName()))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable String id) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("version.deleted.success",
                        versionService.delete(id)))
                .build();
    }
}
