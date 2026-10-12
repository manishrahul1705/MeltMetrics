import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage();
page.on('pageerror',e=>console.log('PAGE ERROR',e.message,e.stack));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
await page.goto('http://127.0.0.1:4179/#/dashboard');await page.waitForTimeout(4000);console.log((await page.locator('body').innerText()).slice(0,1500));await browser.close();
