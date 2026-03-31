package com.haui.vtech.enums;

public enum ImageFolder {
    PRODUCT("product"),
    CATEGORY("category"),
    USER("user"),
    BRAND("brand")
    ;

    private final String folder;

    ImageFolder(String folder) {
        this.folder = folder;
    }

    public String getFolder() {
        return folder;
    }
}
