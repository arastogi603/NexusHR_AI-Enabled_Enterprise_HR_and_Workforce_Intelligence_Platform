package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.AttritionPredictionDto;
import com.zidio.nexushr.analytics.dto.ChatResponseDto;

import java.util.List;

public interface AiProvider {
    String explain(AttritionPredictionDto prediction);
    List<String> recommend(AttritionPredictionDto prediction);
    ChatResponseDto chat(String userEmail, String userRole, String message);
}
