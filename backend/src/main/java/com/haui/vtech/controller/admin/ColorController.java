package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.color.ColorRequest;
import com.haui.vtech.dto.color.ColorResponse;
import com.haui.vtech.service.ColorService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/colors")
@RequiredArgsConstructor
public class ColorController {

    private final ColorService colorService;
    private final MessageUtil messageUtil;

    @GetMapping
    public ApiResponse<List<ColorResponse>> getAll() {
        return ApiResponse.<List<ColorResponse>>builder()
                .data(colorService.getAll())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ColorResponse> create(
            @RequestBody @Valid ColorRequest request) {
        return ApiResponse.<ColorResponse>builder()
                .data(colorService.create(request))
                .message(messageUtil.getMessage("color.created.success", request.getColorName()))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<ColorResponse> update(
            @PathVariable String id,
            @RequestBody @Valid ColorRequest request) {
        return ApiResponse.<ColorResponse>builder()
                .data(colorService.update(id, request))
                .message(messageUtil.getMessage("color.updated.success", request.getColorName()))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> delete(@PathVariable String id) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("color.deleted.success",
                        colorService.delete(id)))
                .build();
    }
}
