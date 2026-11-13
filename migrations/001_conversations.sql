-- Additive migration only. Safe to re-run (IF NOT EXISTS).
-- Do not DROP tables or delete rows.
--
-- Inspected live schema before this file was written:
--   users, sessions, and verification_codes already existed.
--   conversations and conversation_members did not exist.
--
-- pair_key stores "smallerUserId:largerUserId" for private chats so
-- concurrent creates cannot insert two rows for the same pair.

CREATE TABLE IF NOT EXISTS conversations (
  id INT(11) NOT NULL AUTO_INCREMENT,
  type ENUM('private') NOT NULL DEFAULT 'private',
  pair_key VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_private_pair (pair_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id INT(11) NOT NULL,
  user_id INT(11) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  KEY idx_members_user (user_id),
  CONSTRAINT fk_members_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_members_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
