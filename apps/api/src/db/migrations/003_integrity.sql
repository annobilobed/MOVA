-- One account per UCC student ID. Older duplicates (if any) are renamed so the index can be built.
UPDATE users u SET student_id = u.student_id || '-dup-' || left(u.id::text, 8)
WHERE u.student_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM users e WHERE lower(e.student_id) = lower(u.student_id) AND e.created_at < u.created_at
);
CREATE UNIQUE INDEX users_student_id_unique ON users (lower(student_id)) WHERE student_id IS NOT NULL;

-- Trip cancellations are recorded with who cancelled and why.
ALTER TABLE trips ADD COLUMN cancelled_at timestamptz;
ALTER TABLE trips ADD COLUMN cancel_reason text;
