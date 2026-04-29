package com.haui.vtech.mapper;

import com.haui.vtech.dto.article.ArticleRequest;
import com.haui.vtech.dto.article.ArticleResponse;
import com.haui.vtech.entity.ArticleEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ArticleMapper {

    @Mapping(target = "author", ignore = true)
    @Mapping(target = "products", ignore = true)
    ArticleEntity toEntity(ArticleRequest request);

    @Mapping(source = "author.fullName", target = "authorName")
    ArticleResponse toResponse(ArticleEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "products", ignore = true)
    void updateEntity(@MappingTarget ArticleEntity entity, ArticleRequest request);
}