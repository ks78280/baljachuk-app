import { test, expect } from "@playwright/test";

const SEED_EMAIL = process.env.E2E_EMAIL ?? "gangsan@baljachuk.dev";
const SEED_PW = process.env.E2E_PW ?? "pw123456";

test.describe("발자국 웹 스모크", () => {
  test("로그인 → 지도 → 타임라인 → 기록 상세 → 좋아요", async ({ page }) => {
    // --- 로그인 화면 ---
    await page.goto("/");
    await expect(page.getByText("걸음마다 남는 지도")).toBeVisible();

    await page.getByPlaceholder("you@example.com").fill(SEED_EMAIL);
    await page.getByPlaceholder("6자 이상").fill(SEED_PW);
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // --- 지도(홈)로 진입 ---
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page.getByText("발자국")).toBeVisible();
    await expect(page.getByText("전체")).toBeVisible();

    // --- 타임라인 탭 ---
    await page.getByText("타임라인", { exact: true }).click();
    await expect(page).toHaveURL(/\/timeline/);
    const firstCard = page.getByText(/노을이 예뻤던 하루/).first();
    await expect(firstCard).toBeVisible();

    // --- 기록 상세 진입 + 좋아요 토글 ---
    await firstCard.click();
    await expect(page).toHaveURL(/\/record\//);
    await expect(page.getByText("동대구역")).toBeVisible();

    // 좋아요 수를 읽고, 하트를 눌러 +1 되는지 확인
    const likeCount = page.locator("text=/^\\d+$/").first();
    const before = Number((await likeCount.textContent()) ?? "0");
    await likeCount.click(); // 하트 영역
    await expect
      .poll(async () => Number((await likeCount.textContent()) ?? "0"))
      .not.toBe(before);
  });
});
