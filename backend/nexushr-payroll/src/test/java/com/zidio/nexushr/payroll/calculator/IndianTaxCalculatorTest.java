package com.zidio.nexushr.payroll.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IndianTaxCalculatorTest {

    private IndianTaxCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new IndianTaxCalculator();
    }

    @Test
    @DisplayName("Vector V1: CTC ₹12L - Rebate 87A applies, zero tax")
    void testVectorV1_12L_ZeroTax() {
        IndianTaxCalculator.TaxResult res = calculator.calculate(new BigDecimal("1200000.00"));
        assertEquals(new BigDecimal("1125000.00"), res.taxableIncome);
        assertEquals(new BigDecimal("52500.00"), res.slabTax);
        assertEquals(new BigDecimal("0.00"), res.taxAfterRebateAndRelief);
        assertEquals(new BigDecimal("0.00"), res.annualTax);
        assertEquals(new BigDecimal("0.00"), res.monthlyTds);
    }

    @Test
    @DisplayName("Vector V2: CTC ₹24L - Slab tax + 4% cess, monthly TDS ₹24,375.00")
    void testVectorV2_24L_FullTax() {
        IndianTaxCalculator.TaxResult res = calculator.calculate(new BigDecimal("2400000.00"));
        assertEquals(new BigDecimal("2325000.00"), res.taxableIncome);
        assertEquals(new BigDecimal("281250.00"), res.slabTax);
        assertEquals(new BigDecimal("281250.00"), res.taxAfterRebateAndRelief);
        assertEquals(new BigDecimal("11250.00"), res.cess);
        assertEquals(new BigDecimal("292500.00"), res.annualTax);
        assertEquals(new BigDecimal("24375.00"), res.monthlyTds);
    }

    @Test
    @DisplayName("Vector V3: CTC ₹2.4L - Below taxable limit, zero tax")
    void testVectorV3_2_4L_ZeroTax() {
        IndianTaxCalculator.TaxResult res = calculator.calculate(new BigDecimal("240000.00"));
        assertEquals(new BigDecimal("165000.00"), res.taxableIncome);
        assertEquals(new BigDecimal("0.00"), res.slabTax);
        assertEquals(new BigDecimal("0.00"), res.monthlyTds);
    }

    @Test
    @DisplayName("Vector V5: CTC ₹12.5L - Taxable ₹11.75L <= ₹12L, full 87A rebate applies")
    void testVectorV5_12_5L_RebateBoundary() {
        IndianTaxCalculator.TaxResult res = calculator.calculate(new BigDecimal("1250000.00"));
        assertEquals(new BigDecimal("1175000.00"), res.taxableIncome);
        assertEquals(new BigDecimal("57500.00"), res.slabTax);
        assertEquals(new BigDecimal("0.00"), res.taxAfterRebateAndRelief);
        assertEquals(new BigDecimal("0.00"), res.monthlyTds);
    }

    @Test
    @DisplayName("Vector V6: CTC ₹13L - Taxable ₹12.25L, marginal relief caps tax at excess ₹25,000")
    void testVectorV6_13L_MarginalRelief() {
        IndianTaxCalculator.TaxResult res = calculator.calculate(new BigDecimal("1300000.00"));
        assertEquals(new BigDecimal("1225000.00"), res.taxableIncome);
        assertEquals(new BigDecimal("63750.00"), res.slabTax);
        // Excess over ₹12L is ₹25,000, which is < slabTax ₹63,750
        assertEquals(new BigDecimal("25000.00"), res.taxAfterRebateAndRelief);
        assertEquals(new BigDecimal("1000.00"), res.cess);
        assertEquals(new BigDecimal("26000.00"), res.annualTax);
        assertEquals(new BigDecimal("2166.67"), res.monthlyTds);
    }
}
