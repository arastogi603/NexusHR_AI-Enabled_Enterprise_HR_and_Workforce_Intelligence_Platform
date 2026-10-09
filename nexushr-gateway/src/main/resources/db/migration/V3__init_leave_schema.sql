CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    year INT NOT NULL,
    casual_leave INT NOT NULL DEFAULT 12,
    sick_leave INT NOT NULL DEFAULT 12,
    earned_leave INT NOT NULL DEFAULT 15,
    maternity_leave INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, year)
);

CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES employees(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP
);
