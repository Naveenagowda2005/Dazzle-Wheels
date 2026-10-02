const puppeteer = require('puppeteer');

async function testCompleteLoginFlow() {
    console.log('🔍 Testing Complete Admin Login Flow...\n');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false, // Set to true for headless mode
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Listen to console logs
        page.on('console', msg => {
            console.log('🖥️ Browser Console:', msg.text());
        });
        
        // Listen to page errors
        page.on('pageerror', error => {
            console.error('❌ Page Error:', error.message);
        });
        
        // Step 1: Navigate to admin login page
        console.log('1. Navigating to admin login page...');
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
        
        // Wait for the form to be visible
        await page.waitForSelector('form', { timeout: 10000 });
        console.log('✅ Admin login page loaded successfully');
        
        // Step 2: Fill in the login form
        console.log('2. Filling in login credentials...');
        await page.type('input[name="email"]', 'admin@dazzlewheels.com');
        await page.type('input[name="password"]', 'DazzleAdmin@2024!');
        console.log('✅ Credentials entered');
        
        // Step 3: Submit the form
        console.log('3. Submitting login form...');
        await page.click('button[type="submit"]');
        
        // Wait for either redirect or error message
        try {
            // Wait for navigation to admin dashboard or error message
            await Promise.race([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
                page.waitForSelector('.error', { timeout: 5000 }),
                page.waitForSelector('[data-testid="toast"]', { timeout: 5000 })
            ]);
            
            const currentUrl = page.url();
            console.log('📍 Current URL after login:', currentUrl);
            
            if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
                console.log('✅ Successfully redirected to admin dashboard!');
                
                // Check if admin dashboard content is loaded
                try {
                    await page.waitForSelector('h1', { timeout: 5000 });
                    const pageTitle = await page.$eval('h1', el => el.textContent);
                    console.log('📋 Admin dashboard title:', pageTitle);
                    console.log('✅ Admin dashboard loaded successfully!');
                } catch (error) {
                    console.log('⚠️ Admin dashboard content not fully loaded');
                }
            } else {
                console.log('❌ Login failed - still on login page');
                
                // Check for error messages
                try {
                    const errorMessage = await page.$eval('.error', el => el.textContent);
                    console.log('❌ Error message:', errorMessage);
                } catch (e) {
                    console.log('❌ No specific error message found');
                }
            }
            
        } catch (error) {
            console.log('❌ Login process failed:', error.message);
        }
        
        // Step 4: Check localStorage for session
        console.log('4. Checking session storage...');
        const sessionData = await page.evaluate(() => {
            return localStorage.getItem('dazzle_session');
        });
        
        if (sessionData) {
            const session = JSON.parse(sessionData);
            console.log('✅ Session found in localStorage:');
            console.log('   - User:', session.user?.name);
            console.log('   - Role:', session.user?.role);
            console.log('   - Email:', session.user?.email);
            console.log('   - Token present:', !!session.access_token);
        } else {
            console.log('❌ No session found in localStorage');
        }
        
        // Wait a bit to see the final state
        await page.waitForTimeout(2000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testCompleteLoginFlow().catch(console.error);