-- ============================================================
-- JWTLab Database Schema
-- PostgreSQL 15+
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(40) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    avatar TEXT,

    xp INTEGER NOT NULL DEFAULT 0,

    level INTEGER NOT NULL DEFAULT 1,

    total_points INTEGER NOT NULL DEFAULT 0,

    labs_completed INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- ============================================================
-- USER PROGRESS
-- ============================================================

CREATE TABLE user_progress (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    lab_slug VARCHAR(100) NOT NULL,

    completed BOOLEAN DEFAULT FALSE,

    score INTEGER DEFAULT 0,

    attempts INTEGER DEFAULT 0,

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progress_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_progress
        UNIQUE(user_id, lab_slug)
);



-- ============================================================
-- LAB ATTEMPTS
-- ============================================================

CREATE TABLE lab_attempts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    lab_slug VARCHAR(100) NOT NULL,

    submitted_flag TEXT NOT NULL,

    is_correct BOOLEAN DEFAULT FALSE,

    points_awarded INTEGER DEFAULT 0,

    time_taken_seconds INTEGER,

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attempt_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);



-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

CREATE TABLE achievements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug VARCHAR(100) UNIQUE NOT NULL,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    icon VARCHAR(255),

    xp_reward INTEGER DEFAULT 100,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================

CREATE TABLE user_achievements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    achievement_slug VARCHAR(100) NOT NULL,

    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_achievement_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_achievement
        UNIQUE(user_id, achievement_slug)
);



-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    action VARCHAR(100) NOT NULL,

    resource VARCHAR(100),

    metadata JSONB,

    ip_address VARCHAR(45),

    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);



-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_progress_user
ON user_progress(user_id);

CREATE INDEX idx_progress_lab
ON user_progress(lab_slug);

CREATE INDEX idx_attempt_user
ON lab_attempts(user_id);

CREATE INDEX idx_attempt_lab
ON lab_attempts(lab_slug);

CREATE INDEX idx_logs_user
ON audit_logs(user_id);

CREATE INDEX idx_logs_action
ON audit_logs(action);

CREATE INDEX idx_logs_created
ON audit_logs(created_at DESC);