CREATE TABLE users
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(255) NOT NULL
);

CREATE TABLE candidates
(
    id  BIGINT PRIMARY KEY,
    cpf VARCHAR(255) NOT NULL UNIQUE,
    CONSTRAINT fk_candidates_user FOREIGN KEY (id) REFERENCES users (id)
);

CREATE TABLE companies
(
    id         BIGINT PRIMARY KEY,
    cnpj       VARCHAR(255) NOT NULL UNIQUE,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    phone      VARCHAR(255) NOT NULL,
    CONSTRAINT fk_companies_user FOREIGN KEY (id) REFERENCES users (id)
);

CREATE TABLE skills
(
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE candidate_skills
(
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id    BIGINT NOT NULL,
    skill_id        BIGINT NOT NULL,
    declared_level  ENUM('BASIC', 'INTERMEDIATE', 'ADVANCED', 'SPECIALIST') NOT NULL,
    validated_score INT,
    validated_at    DATETIME(6),
    CONSTRAINT uk_candidate_skill UNIQUE (candidate_id, skill_id),
    CONSTRAINT fk_candidate_skills_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id),
    CONSTRAINT fk_candidate_skills_skill FOREIGN KEY (skill_id) REFERENCES skills (id)
);

CREATE TABLE job_postings
(
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id      BIGINT        NOT NULL,
    title           VARCHAR(100)  NOT NULL,
    description     VARCHAR(5000) NOT NULL,
    location        VARCHAR(100)  NOT NULL,
    employment_type ENUM('INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'CONTRACT') NOT NULL,
    workplace_type  ENUM('REMOTE', 'HYBRID', 'TRADITIONAL') NOT NULL,
    status          ENUM('PUBLISHED', 'CLOSED') NOT NULL,
    created_at      DATETIME(6) NOT NULL,
    updated_at      DATETIME(6) NOT NULL,
    expires_at      DATETIME(6) NOT NULL,
    CONSTRAINT fk_job_postings_company FOREIGN KEY (company_id) REFERENCES companies (id)
);

CREATE TABLE job_skill_requirements
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_posting_id BIGINT NOT NULL,
    skill_id       BIGINT NOT NULL,
    weight         INT    NOT NULL,
    CONSTRAINT fk_job_skill_req_posting FOREIGN KEY (job_posting_id) REFERENCES job_postings (id),
    CONSTRAINT fk_job_skill_req_skill FOREIGN KEY (skill_id) REFERENCES skills (id)
);

CREATE TABLE job_applications
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id   BIGINT NOT NULL,
    job_posting_id BIGINT NOT NULL,
    score          INT,
    status         ENUM('PENDING_TEST', 'TEST_COMPLETED', 'EVALUATING', 'PASSED', 'FAILED', 'CLOSED') NOT NULL,
    created_at     DATETIME(6) NOT NULL,
    CONSTRAINT uk_candidate_job_posting UNIQUE (candidate_id, job_posting_id),
    CONSTRAINT fk_job_applications_candidate FOREIGN KEY (candidate_id) REFERENCES candidates (id),
    CONSTRAINT fk_job_applications_posting FOREIGN KEY (job_posting_id) REFERENCES job_postings (id)
);

CREATE TABLE questions
(
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_posting_id         BIGINT       NOT NULL,
    skill_evaluated        VARCHAR(255) NOT NULL,
    statement              TEXT         NOT NULL,
    code_snippet           TEXT,
    expected_answer        TEXT,
    estimated_time_minutes INT,
    type                   ENUM('THEORETICAL', 'PRACTICAL') NOT NULL,
    CONSTRAINT fk_questions_posting FOREIGN KEY (job_posting_id) REFERENCES job_postings (id)
);

CREATE TABLE question_evaluation_criteria
(
    question_id BIGINT       NOT NULL,
    criterion   VARCHAR(255) NOT NULL,
    CONSTRAINT fk_criteria_question FOREIGN KEY (question_id) REFERENCES questions (id)
);

CREATE TABLE answers
(
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_application_id BIGINT NOT NULL,
    question_id        BIGINT NOT NULL,
    response_text      TEXT,
    feedback           TEXT,
    score              INT,
    CONSTRAINT fk_answers_application FOREIGN KEY (job_application_id) REFERENCES job_applications (id),
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions (id)
);