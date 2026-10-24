-- V6: Auth Enhancements, Lockout, Refresh Tokens & Audit Logging

-- 1. Ensure ROLE_EXECUTIVE exists
INSERT INTO roles (name, description)
SELECT 'ROLE_EXECUTIVE', 'Executive / Board Member (Read-only Strategic Analytics)'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_EXECUTIVE');

-- 2. Add Lockout & Password Policy columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- 3. Create Refresh Tokens table (family-based token rotation & reuse detection)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    family_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    replaced_by UUID,
    user_agent VARCHAR(255),
    ip VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens(family_id);

-- 4. Create Audit Logs table with cryptographic hash chaining
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by VARCHAR(255),
    ip VARCHAR(50),
    request_id VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    prev_hash VARCHAR(64),
    hash VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
