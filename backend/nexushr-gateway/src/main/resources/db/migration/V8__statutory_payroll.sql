-- =========================================================================
-- V8: Statutory Indian Payroll Engine Schema (FY 2025-26 New Regime)
-- =========================================================================

CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INT NOT NULL,
    year INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- PREVIEW, PROCESSING, COMPLETED, PUBLISHED, FAILED
    total_gross DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_tax DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_net DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_employees INT NOT NULL DEFAULT 0,
    published_at TIMESTAMP,
    published_by UUID,
    remarks VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,
    CONSTRAINT uq_payroll_runs_month_year UNIQUE (month, year)
);

CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    annual_ctc DECIMAL(12, 2) NOT NULL,
    paid_days INT NOT NULL,
    lop_days INT NOT NULL DEFAULT 0,
    basic DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) NOT NULL,
    transport_allowance DECIMAL(12, 2) NOT NULL,
    special_allowance DECIMAL(12, 2) NOT NULL,
    gross_earnings DECIMAL(12, 2) NOT NULL,
    pf_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    esi_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pt_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tds_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, PAID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,
    CONSTRAINT uq_payslips_run_employee UNIQUE (payroll_run_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_run ON payslips(payroll_run_id);
