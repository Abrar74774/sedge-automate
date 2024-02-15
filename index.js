const dotenv = require('dotenv')
dotenv.config()
const puppeteer = require('puppeteer')


const users = [
    {
        name: process.env.USER1,
        password: process.env.PASS1
    },
    {
        name: process.env.USER2,
        password: process.env.PASS2
    },
]

const usernameInput = "input[type=\"username\"]"
const passwordInput = "input[type=\"password\"]"
const loginBtn = "button"

const dashboardBtn = "a.publish"
const exportBtn = "#RPE_exportToExcel"

const titleInput = "input#RPE_txtArea"
const subTitleInput = "input#RPE_txtAreaSTitle"
const submitBtn = "dialog div.form-group:nth-child(4) > button:nth-child(1)"


async function printPDF() {
    console.log(process.cwd())
    // const one = [users[1]]
    users.forEach(async (user) => {
        const browser = await puppeteer.launch({ 
            // args: [
            //     '--no-sandbox',
            //     '--disable-setuid-sandbox',
            //     '--disable-dev-shm-usage',
            //     '--disable-accelerated-2d-canvas',
            //     '--no-first-run',
            //     '--no-zygote',
            //     '--single-process',
            //     '--disable-gpu'
            //   ],
            headless: true 
        });
    
        const page = await browser.newPage();
        const client = await page.target().createCDPSession()
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: process.cwd() + `\\${user.name}`,
        })
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto('https://sedgedev.solverminds.net/auth/login', { waitUntil: 'networkidle0', timeout: 120000 });
    
        await page.type(usernameInput, user.name);
        await page.type(passwordInput, user.password);
        await page.click(loginBtn)
        await page.waitForSelector(dashboardBtn),
    
        await page.click(dashboardBtn)
        await page.waitForSelector(".customWidget svg", {timeout: 60000})
        // await page.waitForNetworkIdle({idleTime: 120000})
    
        await page.click(exportBtn)
        await page.waitForSelector(titleInput)
    
        await page.type(titleInput, "automated | title")
        await page.type(subTitleInput, "automated | subtitle")
        await page.click(submitBtn)
        // await page.waitForResponse()
        await page.waitForSelector('.RPE_exportLoading')
        await page.waitForSelector('.RPE_exportLoading', { hidden: true })
    
        await page.waitForNetworkIdle({idleTime: 5000})
        await page.close()
        await browser.close()
    })


        // await page.screenshot({ path: process.cwd() + '/pdfs/file.jpg', });
        // await page.pdf({ path: process.cwd() + '/pdfs/file.pdf', printBackground: true });

    // await browser.close();
}

printPDF()