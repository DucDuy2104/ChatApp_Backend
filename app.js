const express = require('express')
const app = express()
const dotenv = require('dotenv')

dotenv.config()

app.use(express.json())
express.static(path.join(__dirname, 'public'))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 3000, () => console.log(`App is listening on port ${process.env.PORT || 3000}!`))