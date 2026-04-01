package com.haui.vtech.dto.brand;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.BrandStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class BrandResponse {
    private String id;
    private String brandName;
    private String slug;
    private String brandDesc;
    private String brandLogo;
    private Integer displayOrder;
    private BrandStatus status;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
