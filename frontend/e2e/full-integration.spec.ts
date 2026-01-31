import { test, expect } from '@playwright/test';

// Huda's Simplified Profile for Injection
const HUDA_PROFILE = {
    identity: { name: 'Huda', grade: 11 },
    aptitude: { gpa_weighted: 3.9, sat_total: 1520, ap_count: 8 },
    passion: { spike_category: 'LEADER', leadership_level: 'SCHOOL_PRES', ec_commitment_years: 3 },
    community: { service_hours: 150, service_leadership: 'LOCAL' },
    target_schools: ['HARVARD', 'MIT', 'STANFORD', 'YALE']
};

test.describe('Full Stack Integration', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Inject LocalStorage State to bypass Assessment Wizard
        await page.evaluate(({ profile }) => {
            // 1. Session: Mark as completed
            localStorage.setItem('ivyquest-session-v10', JSON.stringify({
                state: {
                    is_completed: true,
                    user_id: 'test-user-001',
                    current_frame: 6
                },
                version: 0
            }));

            // 2. Student Profile: Huda's Data
            localStorage.setItem('ivyquest-student-profile', JSON.stringify({
                state: {
                    profile: profile
                },
                version: 0
            }));

            // 3. Results: Clear to force Backend Fetch
            localStorage.removeItem('ivyquest-results');

        }, { profile: HUDA_PROFILE });

        // Navigate to Dashboard (State is persisted)
        await page.goto('/dashboard');
    });

    test('Dashboard loads, fetches Score from Python Backend, and runs Simulator', async ({ page }) => {
        // 1. Verify Redirection to Dashboard (or direct load)
        await expect(page).toHaveURL(/.*dashboard/);

        // 2. Verify Backend Scoring Call
        // Look for the loading state or the rings appearing
        await expect(page.getByText('Your Ivy+ Ready Score')).toBeVisible({ timeout: 15000 });

        // 3. Verify Score Render (Result of Python Backend)
        // The previous run gave Huda ~48.8, so let's check for a number
        const scoreLocator = page.locator('text=/\\d{1,3}%/').first();
        await expect(scoreLocator).toBeVisible();

        // 4. Verify Project Simulator presence
        const simButton = page.getByRole('button', { name: 'Run Simulation' });
        await expect(simButton).toBeVisible();

        // 5. Run Simulator (Calls /api/agent/v1/ec/simulate)
        await simButton.click();

        // 6. Verify Options Appear
        // Expect project cards to appear
        await expect(page.locator('.border-indigo-600').or(page.locator('.border-gray-100'))).toHaveCount(0); // Initially 0

        // Wait for generation (can take 5-10s)
        await expect(page.getByText('Regenerate')).toBeVisible({ timeout: 30000 });

        // Check for at least one option card
        const options = page.locator('h3.font-bold'); // Project titles
        await expect(options).not.toHaveCount(0);

        console.log('Simulator generated', await options.count(), 'options');
    });
});
