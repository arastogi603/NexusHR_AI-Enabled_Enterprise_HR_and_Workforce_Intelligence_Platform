package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.DashboardDto;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AIInsightService {

    private final ChatClient chatClient;
    private final DashboardService dashboardService;

    public AIInsightService(ChatClient.Builder chatClientBuilder, DashboardService dashboardService) {
        this.chatClient = chatClientBuilder.build();
        this.dashboardService = dashboardService;
    }

    public String generateStrategicInsights() {
        DashboardDto metrics = dashboardService.getAdminDashboardMetrics();

        String prompt = String.format("""
            You are a strategic HR Consultant AI. Analyze the following real-time HR metrics and provide 3 short, actionable bullet points for the management team.
            Focus on workforce optimization, potential risks, and financial efficiency.
            
            Metrics:
            - Active Employees: %d
            - Total Departments: %d
            - Employees on Leave Today: %d
            - Current Month Payroll Expense: $%s
            - Headcount by Department: %s
            
            Format as a professional, concise executive summary.
            """, 
            metrics.getActiveEmployees(), 
            metrics.getDepartmentsCount(), 
            metrics.getEmployeesOnLeaveToday(), 
            metrics.getCurrentMonthPayrollExpense(),
            metrics.getHeadcountByDepartment().toString()
        );

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}
