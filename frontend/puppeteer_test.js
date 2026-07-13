import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  try {
    // Navigate to Admin Curriculum DSA Practice
    await page.goto('http://localhost:5173/admin/curriculum/practice', { waitUntil: 'networkidle2' });

    console.log('Clicking Problem Manager button...');
    const pmButtons = await page.$$('button');
    for (const btn of pmButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Problem Manager')) {
        await btn.click();
        console.log('Clicked Problem Manager button!');
        break;
      }
    }

    // Wait to see if any errors happen
    await new Promise(r => setTimeout(r, 5000));
    
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  } finally {
    await browser.close();
  }
})();
