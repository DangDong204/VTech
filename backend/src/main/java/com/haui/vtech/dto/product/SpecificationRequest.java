package com.haui.vtech.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class SpecificationRequest {
//    private Map<String, String> attributes;
    private List<SpecPair> attributes;
}
