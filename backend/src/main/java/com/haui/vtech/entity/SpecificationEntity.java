package com.haui.vtech.entity;

import com.haui.vtech.dto.product.SpecPair;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "specifications")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class SpecificationEntity extends BaseEntity{

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private ProductEntity product;

//    @JdbcTypeCode(SqlTypes.JSON)
//    @Column(name = "attributes", columnDefinition = "json")
//    private Map<String, String> attributes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "json")
    private List<SpecPair> attributes;
}
