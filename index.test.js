const axios = require('axios');
const nock = require('nock');
const traeger = require('./index');

describe('traeger', () => {
  test('should convert File objects into base64 encoded strings in deeply nested request data.', async () => {

    axios.interceptors.request.use(traeger);

    const pawneeBudget = new File(["parks,1000000\nrecreation,1000000"], "budget.csv", {
      type: "text/csv",
    });

    const data = {
      audit: {
        city: "Pawnee",
        state: "Indiana",
        budget: pawneeBudget
      }
    }

    expect(data.audit.budget instanceof File).toBe(true)

    let parsedBody = null

    const scope = nock(`https://indiana.gov`)
      .post('/audit', function (body) {
        parsedBody = body
        return body
      })
      .reply(200, {
        ok: true
      })

    const result = await axios.post('https://indiana.gov/audit', data)

    expect(parsedBody.audit.budget).toEqual("data:text/csv;charset=undefined,parks%2C1000000%0Arecreation%2C1000000")
    expect(scope.isDone()).toBe(true)
  })
})
