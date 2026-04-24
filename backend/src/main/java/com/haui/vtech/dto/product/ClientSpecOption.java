package com.haui.vtech.dto.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ClientSpecOption {
    private String label;
    private String value;
}