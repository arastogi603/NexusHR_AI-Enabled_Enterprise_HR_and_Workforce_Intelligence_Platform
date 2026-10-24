-- Migration V7: Employee Lifecycle, History Tracking, and Onboarding Checklists

CREATE TABLE IF NOT EXISTS employee_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks VARCHAR(500),
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_history_emp_id ON employee_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_history_created_at ON employee_history(created_at);

CREATE TABLE IF NOT EXISTS onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    step_key VARCHAR(50) NOT NULL,
    step_title VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMP,
    completed_by UUID REFERENCES users(id),
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_emp_id ON onboarding_checklists(employee_id);
