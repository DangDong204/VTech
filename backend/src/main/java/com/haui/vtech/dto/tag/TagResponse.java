package com.haui.vtech.dto.tag;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.TagStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TagResponse {

    private String id;
    private String tagName;
    private String tagDesc;
    private TagStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;
}
