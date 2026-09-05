-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "avatar_color" TEXT NOT NULL DEFAULT '#2d5a3f',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'local',
    "google_review_id" TEXT,
    "author_photo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_feedback" ("avatar_color", "comment", "created_at", "id", "is_visible", "name", "rating") SELECT "avatar_color", "comment", "created_at", "id", "is_visible", "name", "rating" FROM "feedback";
DROP TABLE "feedback";
ALTER TABLE "new_feedback" RENAME TO "feedback";
CREATE UNIQUE INDEX "feedback_google_review_id_key" ON "feedback"("google_review_id");
CREATE INDEX "feedback_created_at_idx" ON "feedback"("created_at");
CREATE INDEX "feedback_is_visible_idx" ON "feedback"("is_visible");
CREATE INDEX "feedback_source_idx" ON "feedback"("source");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
