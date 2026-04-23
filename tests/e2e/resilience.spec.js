const { test, expect } = require("@playwright/test");

function getFirstPartyErrors(errors) {
  return errors.filter((error) => {
    const stack = String(error?.stack || "");
    const message = String(error?.message || "");
    return !/youtube\.com|ytembeds/i.test(stack) && !/youtube\.com|ytembeds/i.test(message);
  });
}

test.describe("Resilience Matrix", () => {
  test("loads core UI without runtime errors", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("#home")).toBeVisible();
    await expect(page.locator(".site-header")).toBeVisible();
    expect(pageErrors).toHaveLength(0);
  });

  test("weather widget falls back when API fails", async ({ page }) => {
    await page.route("**/api.open-meteo.com/**", (route) => route.abort());

    await page.goto("/");

    const temp = page.locator("#hero-weather-temp");
    await expect(temp).toHaveText("--°C", { timeout: 15000 });
    await expect(temp).not.toHaveClass(/is-loading/);
  });

  test("weather widget times out instead of hanging", async ({ page }) => {
    await page.route("**/api.open-meteo.com/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 12000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          current: {
            temperature_2m: 19.7
          }
        })
      });
    });

    await page.goto("/");

    const temp = page.locator("#hero-weather-temp");
    await expect(temp).toHaveText("--°C", { timeout: 16000 });
    await expect(temp).not.toHaveClass(/is-loading/);
  });

  test("degrades gracefully without IntersectionObserver", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.addInitScript(() => {
      Object.defineProperty(window, "IntersectionObserver", {
        configurable: true,
        writable: true,
        value: undefined
      });
    });

    await page.goto("/");
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });

    const backToTop = page.locator("#back-to-top");
    await expect(backToTop).not.toBeHidden({ timeout: 7000 });
    await expect(backToTop).toHaveClass(/is-visible/, { timeout: 7000 });
    expect(getFirstPartyErrors(pageErrors)).toHaveLength(0);
  });

  test("scrollIntoView failure does not break drawer opening", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.addInitScript(() => {
      Element.prototype.scrollIntoView = function () {
        throw new Error("scrollIntoView blocked by test");
      };
    });

    await page.goto("/");

    const drawerTarget = await page.evaluate(() => {
      const trigger = document.querySelector("a.route-more[data-track='planner_choice_open_e4']");
      if (!trigger) {
        return null;
      }
      trigger.click();
      return trigger.getAttribute("data-drawer-target");
    });

    expect(drawerTarget).toBeTruthy();
    await expect(page.locator(`#${drawerTarget}`)).toHaveJSProperty("open", true);
    expect(getFirstPartyErrors(pageErrors)).toHaveLength(0);
  });
});
