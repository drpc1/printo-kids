// Provenance: worksheet-generate-shows-maze
// The test plan prices no risk at e2e. This seed protects the built screen:
// Generuj reveals the maze. It does not prove a solution or one printed page.
import { expect, test } from "@playwright/test";

test("generate shows the maze with Start and Meta", async ({ page }) => {
  await page.goto("/");

  // client:only island: Generuj is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Generuj" }).click();

  const maze = page.getByRole("img", { name: "Labirynt" });
  await expect(maze).toBeVisible();
  await expect(maze.getByText("Start", { exact: true })).toBeVisible();
  await expect(maze.getByText("Meta", { exact: true })).toBeVisible();

  // No cleanup: the maze stays in the browser and writes nothing on the server.
});
