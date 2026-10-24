package com.zidio.nexushr.payroll.calculator;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates earnings and statutory deductions per the Indian payroll standards.
 * Earnings:
 * - Basic: 40% of monthly gross
 * - HRA: 20% of monthly gross
 * - Transport Allowance (TA): ₹1,600.00 (or 0 if gross < ₹10,000)
 * - Special Allowance: balancing figure to match gross
 * - LOP: pro-rated deduction by daysInMonth
 * Deductions:
 * - PF (Employee): 12% * min(paidBasic, 15,000) if PF applicable
 * - ESI (Employee): 0.75% * gross if ESI applicable and monthlyGross <= 21,000
 * - Professional Tax (PT): ₹200.00 if monthlyGross >= ₹15,000 else 0
 * - TDS: calculated via IndianTaxCalculator
 */
@Component
public class SalaryStructureCalculator {

    private final IndianTaxCalculator taxCalculator;

    public SalaryStructureCalculator(IndianTaxCalculator taxCalculator) {
        this.taxCalculator = taxCalculator;
    }

    public static class SalaryBreakdown {
        public final BigDecimal annualCtc;
        public final int daysInMonth;
        public final int lopDays;
        public final int paidDays;

        // Earnings
        public final BigDecimal baseSalary; // unadjusted monthly basic
        public final BigDecimal basic;
        public final BigDecimal hra;
        public final BigDecimal transportAllowance;
        public final BigDecimal specialAllowance;
        public final BigDecimal grossEarnings;

        // Deductions
        public final BigDecimal pfDeduction;
        public final BigDecimal esiDeduction;
        public final BigDecimal ptDeduction;
        public final BigDecimal tdsTax;
        public final BigDecimal totalDeductions;
        public final BigDecimal netSalary;

        public SalaryBreakdown(BigDecimal annualCtc, int daysInMonth, int lopDays, int paidDays,
                               BigDecimal baseSalary, BigDecimal basic, BigDecimal hra,
                               BigDecimal transportAllowance, BigDecimal specialAllowance,
                               BigDecimal grossEarnings, BigDecimal pfDeduction, BigDecimal esiDeduction,
                               BigDecimal ptDeduction, BigDecimal tdsTax, BigDecimal totalDeductions,
                               BigDecimal netSalary) {
            this.annualCtc = annualCtc;
            this.daysInMonth = daysInMonth;
            this.lopDays = lopDays;
            this.paidDays = paidDays;
            this.baseSalary = baseSalary;
            this.basic = basic;
            this.hra = hra;
            this.transportAllowance = transportAllowance;
            this.specialAllowance = specialAllowance;
            this.grossEarnings = grossEarnings;
            this.pfDeduction = pfDeduction;
            this.esiDeduction = esiDeduction;
            this.ptDeduction = ptDeduction;
            this.tdsTax = tdsTax;
            this.totalDeductions = totalDeductions;
            this.netSalary = netSalary;
        }
    }

    public SalaryBreakdown calculate(BigDecimal annualCtc, int daysInMonth, int lopDays,
                                     boolean pfApplicable, boolean esiApplicable) {
        if (annualCtc == null || annualCtc.compareTo(BigDecimal.ZERO) <= 0) {
            return new SalaryBreakdown(BigDecimal.ZERO, daysInMonth, 0, daysInMonth,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal monthlyGross = annualCtc.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        int validLop = Math.max(0, Math.min(lopDays, daysInMonth));
        int paidDays = daysInMonth - validLop;

        // Component Base Proportions (Full Month)
        BigDecimal fullBasic = monthlyGross.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fullHra = monthlyGross.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fullTa = monthlyGross.compareTo(new BigDecimal("10000.00")) >= 0
                ? new BigDecimal("1600.00")
                : BigDecimal.ZERO;
        BigDecimal fullSpecial = monthlyGross.subtract(fullBasic).subtract(fullHra).subtract(fullTa);

        // Adjust for LOP (Loss of Pay)
        BigDecimal gross;
        BigDecimal basic;
        BigDecimal hra;
        BigDecimal ta;
        BigDecimal special;

        if (validLop == 0) {
            gross = monthlyGross;
            basic = fullBasic;
            hra = fullHra;
            ta = fullTa;
            special = fullSpecial;
        } else {
            BigDecimal dayRatio = new BigDecimal(paidDays).divide(new BigDecimal(daysInMonth), 8, RoundingMode.HALF_UP);
            gross = monthlyGross.multiply(dayRatio).setScale(2, RoundingMode.HALF_UP);
            basic = fullBasic.multiply(dayRatio).setScale(2, RoundingMode.HALF_UP);
            hra = fullHra.multiply(dayRatio).setScale(2, RoundingMode.HALF_UP);
            ta = fullTa.multiply(dayRatio).setScale(2, RoundingMode.HALF_UP);
            special = gross.subtract(basic).subtract(hra).subtract(ta);
        }

        // 1. PF (Employee): 12% * min(paidBasic, 15,000) if PF applicable
        BigDecimal pf = BigDecimal.ZERO;
        if (pfApplicable) {
            BigDecimal pfWage = basic.min(new BigDecimal("15000.00"));
            pf = pfWage.multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);
        }

        // 2. ESI (Employee): 0.75% * gross if ESI applicable and monthlyGross <= ₹21,000
        BigDecimal esi = BigDecimal.ZERO;
        if (esiApplicable && monthlyGross.compareTo(new BigDecimal("21000.00")) <= 0) {
            esi = gross.multiply(new BigDecimal("0.0075")).setScale(2, RoundingMode.HALF_UP);
        }

        // 3. PT (Professional Tax): ₹200 if monthlyGross >= ₹15,000 else 0
        BigDecimal pt = monthlyGross.compareTo(new BigDecimal("15000.00")) >= 0
                ? new BigDecimal("200.00")
                : BigDecimal.ZERO;

        // 4. Income Tax (TDS) under FY 2025-26 New Regime
        IndianTaxCalculator.TaxResult taxRes = taxCalculator.calculate(annualCtc);
        BigDecimal tds = taxRes.monthlyTds;

        // Totals
        BigDecimal totalDeductions = pf.add(esi).add(pt).add(tds).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netSalary = gross.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);

        return new SalaryBreakdown(annualCtc, daysInMonth, validLop, paidDays,
                fullBasic, basic, hra, ta, special, gross,
                pf, esi, pt, tds, totalDeductions, netSalary);
    }
}
