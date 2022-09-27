import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";
export default async (config) => {
    // Read and expose backend info in env availables inside of test() blocks
    const { rpcAddr, id, agentVersion } = JSON.parse(fs.readFileSync(path.join(__dirname, 'ipfs-backend.json')));
    process.env.IPFS_RPC_ADDR = rpcAddr;
    process.env.IPFS_RPC_ID = id;
    process.env.IPFS_RPC_VERSION = agentVersion;
    // Set and save RPC API endpoint in storageState, so test start against
    // desired endpoint
    const { baseURL, storageState } = config.projects[0].use;
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(baseURL);
    await page.evaluate(`localStorage.setItem("ipfsApi", "${rpcAddr}")`);
    await page.context().storageState({ path: storageState });
    await browser.close();
};
