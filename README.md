# traeger

traeger is an [axios interceptor](https://github.com/axios/axios#interceptors) that converts File objects in deeply nested request data into base64 encoded strings.

## Usage

Use traeger as a request interceptor with axios (or a custom instance of axios).

```js
import axios from 'axios'
import traeger from 'traeger'

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

axios.post('/', data)
```

This will send the following request data:
```
{
  audit: {
    city: "Pawnee",
    state: "Indiana",
    budget: "data:text/csv;charset=undefined,parks%2C1000000%0Arecreation%2C1000000"
  }
}
```
