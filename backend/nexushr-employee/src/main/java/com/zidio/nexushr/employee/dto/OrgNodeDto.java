package com.zidio.nexushr.employee.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgNodeDto {
    private UUID id;
    private String employeeCode;
    private String name;
    private String designation;
    private String department;
    private String email;
    private String avatar;
    private UUID managerId;
    @Builder.Default
    private List<OrgNodeDto> children = new ArrayList<>();
}
