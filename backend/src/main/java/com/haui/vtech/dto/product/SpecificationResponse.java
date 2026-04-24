package com.haui.vtech.dto.product;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class SpecificationResponse {
    private String productId;
//    private Map<String, String> attributes;
    private List<SpecPair> attributes;
}
