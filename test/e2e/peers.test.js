/* global webuiUrl, page, describe, it, expect, beforeAll */

describe('Peers screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/peers')
  })

  it('should have Add connection button', async () => {
    const addConnection = 'Add connection'
    await expect(page).toMatch(addConnection)
    await expect(page).toClick('button', { text: addConnection })
    await expect(page).toMatch('Insert the peer address you want to connect to')
    // TODO: init ephemeral node on localhost and connect to it + await for it to be on the list
  })
})
