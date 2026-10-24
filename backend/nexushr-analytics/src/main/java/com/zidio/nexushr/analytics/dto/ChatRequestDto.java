package com.zidio.nexushr.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {
    @NotBlank(message = "Query message cannot be blank")
    private String message;
}
