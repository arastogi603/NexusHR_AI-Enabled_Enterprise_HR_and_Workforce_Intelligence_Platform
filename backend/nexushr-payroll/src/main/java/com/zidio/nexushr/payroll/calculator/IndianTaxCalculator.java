package com.zidio.nexushr.payroll.calculator;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Implements Indian Statutory Income Tax calculation under the FY 2025-26 New Tax Regime.
 * Features:
 * - Standard deduction: ₹75,000
 * - Slabs: 0-4L: 0% | 4-8L: 5% | 8-12L: 10% | 12-16L: 15% | 16-20L: 20% | 20-24L: 25% | >24L: 30%
 * - Section 87A rebate: zero tax if taxable income <= ₹12,00,000
 * - Marginal relief: if taxable income > ₹12,00,000, tax is capped at (taxable - ₹12,00,000)
 * - Health & Education Cess: 4%
 * - Monthly TDS = annualTax / 12
 */
@Component
public class IndianTaxCalculator {

    public static final BigDecimal STANDARD_DEDUCTION = new BigDecimal("75000.00");
    public static final BigDecimal REBATE_87A_LIMIT = new BigDecimal("1200000.00");
    public static final BigDecimal CESS_RATE = new BigDecimal("0.04");

    public static class TaxResult {
        public final BigDecimal annualGross;
        public final BigDecimal taxableIncome;
        public final BigDecimal slabTax;
        public final BigDecimal taxAfterRebateAndRelief;
        public final BigDecimal cess;
        public final BigDecimal annualTax;
        public final BigDecimal monthlyTds;

        public TaxResult(BigDecimal annualGross, BigDecimal taxableIncome, BigDecimal slabTax,
                         BigDecimal taxAfterRebateAndRelief, BigDecimal cess, BigDecimal annualTax,
                         BigDecimal monthlyTds) {
            this.annualGross = annualGross;
            this.taxableIncome = taxableIncome;
            this.slabTax = slabTax;
            this.taxAfterRebateAndRelief = taxAfterRebateAndRelief;
            this.cess = cess;
            this.annualTax = annualTax;
            this.monthlyTds = monthlyTds;
        }
    }

    public TaxResult calculate(BigDecimal annualCtc) {
        BigDecimal zero = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (annualCtc == null || annualCtc.compareTo(BigDecimal.ZERO) <= 0) {
            return new TaxResult(zero, zero, zero, zero, zero, zero, zero);
        }

        BigDecimal annualGross = annualCtc.setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxable = annualGross.subtract(STANDARD_DEDUCTION).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        // 1. Calculate Slab Tax
        BigDecimal slabTax = calculateSlabTax(taxable);

        // 2. Apply Section 87A Rebate & Marginal Relief
        BigDecimal taxAfterRebate;
        if (taxable.compareTo(REBATE_87A_LIMIT) <= 0) {
            // Full rebate: tax is 0 if taxable <= ₹12,00,000
            taxAfterRebate = zero;
        } else {
            // Marginal Relief: Tax payable cannot exceed excess income over ₹12,00,000
            BigDecimal excessOverThreshold = taxable.subtract(REBATE_87A_LIMIT).setScale(2, RoundingMode.HALF_UP);
            taxAfterRebate = slabTax.min(excessOverThreshold).setScale(2, RoundingMode.HALF_UP);
        }

        // 3. Health & Education Cess (4%)
        BigDecimal cess = taxAfterRebate.multiply(CESS_RATE).setScale(2, RoundingMode.HALF_UP);

        // 4. Annual Tax & Monthly TDS
        BigDecimal annualTax = taxAfterRebate.add(cess).setScale(2, RoundingMode.HALF_UP);
        BigDecimal monthlyTds = annualTax.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);

        return new TaxResult(annualGross, taxable, slabTax, taxAfterRebate, cess, annualTax, monthlyTds);
    }

    private BigDecimal calculateSlabTax(BigDecimal taxable) {
        BigDecimal tax = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        // 0 to 4L: 0%
        if (taxable.compareTo(new BigDecimal("400000")) <= 0) {
            return tax;
        }

        // 4L to 8L: 5% (max 20,000)
        BigDecimal slab1 = taxable.min(new BigDecimal("800000")).subtract(new BigDecimal("400000"));
        if (slab1.compareTo(BigDecimal.ZERO) > 0) {
            tax = tax.add(slab1.multiply(new BigDecimal("0.05")));
        }

        // 8L to 12L: 10% (max 40,000)
        if (taxable.compareTo(new BigDecimal("800000")) > 0) {
            BigDecimal slab2 = taxable.min(new BigDecimal("1200000")).subtract(new BigDecimal("800000"));
            tax = tax.add(slab2.multiply(new BigDecimal("0.10")));
        }

        // 12L to 16L: 15% (max 60,000)
        if (taxable.compareTo(new BigDecimal("1200000")) > 0) {
            BigDecimal slab3 = taxable.min(new BigDecimal("1600000")).subtract(new BigDecimal("1200000"));
            tax = tax.add(slab3.multiply(new BigDecimal("0.15")));
        }

        // 16L to 20L: 20% (max 80,000)
        if (taxable.compareTo(new BigDecimal("1600000")) > 0) {
            BigDecimal slab4 = taxable.min(new BigDecimal("2000000")).subtract(new BigDecimal("1600000"));
            tax = tax.add(slab4.multiply(new BigDecimal("0.20")));
        }

        // 20L to 24L: 25% (max 100,000)
        if (taxable.compareTo(new BigDecimal("2000000")) > 0) {
            BigDecimal slab5 = taxable.min(new BigDecimal("2400000")).subtract(new BigDecimal("2000000"));
            tax = tax.add(slab5.multiply(new BigDecimal("0.25")));
        }

        // Above 24L: 30%
        if (taxable.compareTo(new BigDecimal("2400000")) > 0) {
            BigDecimal slab6 = taxable.subtract(new BigDecimal("2400000"));
            tax = tax.add(slab6.multiply(new BigDecimal("0.30")));
        }

        return tax.setScale(2, RoundingMode.HALF_UP);
    }
}
