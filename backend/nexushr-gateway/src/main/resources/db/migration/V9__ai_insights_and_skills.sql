-- V9__ai_insights_and_skills.sql
-- Schema for AI workforce intelligence, attrition risk, skill matrix, and engagement

CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    subject_id UUID NOT NULL,
    score NUMERIC(5,2),
    level VARCHAR(20),
    factors JSONB,
    recommendations JSONB,
    source VARCHAR(20) NOT NULL DEFAULT 'RULES',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_subject ON ai_insights(subject_id, type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type_level ON ai_insights(type, level);

CREATE TABLE IF NOT EXISTS skill_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    designation VARCHAR(255),
    skill VARCHAR(100) NOT NULL,
    required_level INT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    criticality INT NOT NULL CHECK (criticality BETWEEN 1 AND 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    proficiency_level INT NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
    verified_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employee_skills_emp ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_skill_req_dept ON skill_requirements(department_id);

-- Seed standard enterprise skills requirements
INSERT INTO skill_requirements (id, department_id, designation, skill, required_level, criticality)
SELECT gen_random_uuid(), d.id, 'Software Engineer', 'Java Spring Boot', 4, 3
FROM departments d WHERE d.name = 'Engineering'
ON CONFLICT DO NOTHING;

INSERT INTO skill_requirements (id, department_id, designation, skill, required_level, criticality)
SELECT gen_random_uuid(), d.id, 'Software Engineer', 'PostgreSQL & SQL Optimization', 4, 2
FROM departments d WHERE d.name = 'Engineering'
ON CONFLICT DO NOTHING;

INSERT INTO skill_requirements (id, department_id, designation, skill, required_level, criticality)
SELECT gen_random_uuid(), d.id, 'Software Engineer', 'Distributed Systems & Microservices', 4, 3
FROM departments d WHERE d.name = 'Engineering'
ON CONFLICT DO NOTHING;

INSERT INTO skill_requirements (id, department_id, designation, skill, required_level, criticality)
SELECT gen_random_uuid(), d.id, 'DevOps Engineer', 'Kubernetes & Docker', 5, 3
FROM departments d WHERE d.name = 'DevOps & Infrastructure'
ON CONFLICT DO NOTHING;

INSERT INTO skill_requirements (id, department_id, designation, skill, required_level, criticality)
SELECT gen_random_uuid(), d.id, 'HR Specialist', 'Labor Compliance & Indian Statutory Payroll', 5, 3
FROM departments d WHERE d.name = 'Human Resources'
ON CONFLICT DO NOTHING;
