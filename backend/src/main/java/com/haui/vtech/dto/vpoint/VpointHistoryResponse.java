package com.haui.vtech.dto.vpoint;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.VpointTransactionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class VpointHistoryResponse {
    private String id;
    private Integer amount;
    private VpointTransactionType transactionType;
    private String referenceId;
    private String description;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
}