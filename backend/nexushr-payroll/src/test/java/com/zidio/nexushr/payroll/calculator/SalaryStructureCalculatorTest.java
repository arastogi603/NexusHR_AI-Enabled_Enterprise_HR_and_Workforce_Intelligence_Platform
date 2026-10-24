package com.zidio.nexushr.payroll.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SalaryStructureCalculatorTest {

    private SalaryStructureCalculator calculator;

    @BeforeEach
    void setUp() {
        IndianTaxCalculator taxCalculator = new IndianTaxCalculator();
        calculator = new SalaryStructureCalculator(taxCalculator);
    }

    @Test
    @DisplayName("Vector V1: CTC ₹12L, PF on, ESI off - Net ₹98,000.00")
    void testVectorV1_StandardBreakdown() {
        SalaryStructureCalculator.SalaryBreakdown res = calculator.calculate(
                new BigDecimal("1200000.00"), 31, 0, true, false);

        assertEquals(new BigDecimal("100000.00"), res.grossEarnings);
        assertEquals(new BigDecimal("40000.00"), res.basic);
        assertEquals(new BigDecimal("20000.00"), res.hra);
        assertEquals(new BigDecimal("1600.00"), res.transportAllowance);
        assertEquals(new BigDecimal("38400.00"), res.specialAllowance);
        assertEquals(new BigDecimal("1800.00"), res.pfDeduction);
        assertEquals(new BigDecimal("200.00"), res.ptDeduction);
        assertEquals(new BigDecimal("0.00"), res.tdsTax);
        assertEquals(new BigDecimal("2000.00"), res.totalDeductions);
        assertEquals(new BigDecimal("98000.00"), res.netSalary);
    }

    @Test
    @DisplayName("Vector V2: CTC ₹24L, PF on - Net ₹1,73,625.00")
    void testVectorV2_HighEarner() {
        SalaryStructureCalculator.SalaryBreakdown res = calculator.calculate(
                new BigDecimal("2400000.00"), 31, 0, true, false);

        assertEquals(new BigDecimal("200000.00"), res.grossEarnings);
        assertEquals(new BigDecimal("1800.00"), res.pfDeduction);
        assertEquals(new BigDecimal("200.00"), res.ptDeduction);
        assertEquals(new BigDecimal("24375.00"), res.tdsTax);
        assertEquals(new BigDecimal("26375.00"), res.totalDeductions);
        assertEquals(new BigDecimal("173625.00"), res.netSalary);
    }

    @Test
    @DisplayName("Vector V3: CTC ₹2.4L, PF on, ESI on - Net ₹18,690.00")
    void testVectorV3_EsiEligible() {
        SalaryStructureCalculator.SalaryBreakdown res = calculator.calculate(
                new BigDecimal("240000.00"), 31, 0, true, true);

        assertEquals(new BigDecimal("20000.00"), res.grossEarnings);
        assertEquals(new BigDecimal("8000.00"), res.basic);
        assertEquals(new BigDecimal("960.00"), res.pfDeduction); // 12% of 8,000
        assertEquals(new BigDecimal("150.00"), res.esiDeduction); // 0.75% of 20,000
        assertEquals(new BigDecimal("200.00"), res.ptDeduction);
        assertEquals(new BigDecimal("0.00"), res.tdsTax);
        assertEquals(new BigDecimal("1310.00"), res.totalDeductions);
        assertEquals(new BigDecimal("18690.00"), res.netSalary);
    }

    @Test
    @DisplayName("Vector V4: CTC ₹12L with 2 LOP days in 31-day month - Net ₹91,548.39")
    void testVectorV4_LopDeduction() {
        SalaryStructureCalculator.SalaryBreakdown res = calculator.calculate(
                new BigDecimal("1200000.00"), 31, 2, true, false);

        assertEquals(29, res.paidDays);
        assertEquals(new BigDecimal("93548.39"), res.grossEarnings);
        assertEquals(new BigDecimal("1800.00"), res.pfDeduction);
        assertEquals(new BigDecimal("200.00"), res.ptDeduction);
        assertEquals(new BigDecimal("0.00"), res.tdsTax);
        assertEquals(new BigDecimal("2000.00"), res.totalDeductions);
        assertEquals(new BigDecimal("91548.39"), res.netSalary);
    }
}
