package com.haui.vtech.service;

import com.haui.vtech.dto.color.ColorRequest;
import com.haui.vtech.dto.color.ColorResponse;

import java.util.List;

public interface ColorService {

    List<ColorResponse> getAll();

    ColorResponse create(ColorRequest request);

    ColorResponse update(String id, ColorRequest request);

    String delete(String id);
}
