package com.haui.vtech.service;

import com.haui.vtech.dto.version.VersionRequest;
import com.haui.vtech.dto.version.VersionResponse;

import java.util.List;

public interface VersionService {

    List<VersionResponse> getAll();

    VersionResponse create(VersionRequest request);

    VersionResponse update(String id, VersionRequest request);

    String delete(String id);
}
