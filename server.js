const express = require('express');
const cors = require("cors"); 
const axios = require('axios'); 

const app = express();
const PORT = 3000;
const apiKey = '07774495f3fef63c4e3cd9c22fa33234'; 

app.use(cors());

app.get('/weather', async (req, res) => {
    const { city, country } = req.query;
    if (!city || !country) {
        return res.status(400).json({ error: 'City and country are required' });
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric&lang=pt_br`
        );

        const data = response.data;

        const temperature = data.main?.temp ?? 0;
        const humidity = data.main?.humidity ?? 0;
        const windSpeed = data.wind?.speed ? data.wind.speed * 3.6 : 0;
        const rainChance = data.rain?.['1h'] ?? 0;
        const weatherDescription = data.weather?.[0]?.description ?? 'No description available';

        res.json({ temperature, humidity, windSpeed, rainChance, weatherDescription });

        } catch (err) {
            if (err.response?.status === 404) {
                return res.status(404).json({ error: 'City not found' });
            }
            console.error(err);
            res.status(500).json({ error: 'Error fetching weather data' });
        }
});


app.get('/alert', async (req, res) => {
  const { city, country } = req.query;
  if (!city || !country) return res.status(400).json({ error: 'Informe cidade e país.' });

  try {
    const data = await getWeather(city, country);
    const temp = data.main?.temp ?? 0;

    const alert = temp > 30 ? 'Quente' : temp < 10 ? 'Frio' : 'Agradável';

    res.json({ city, temperature: temp, alert });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter dados do clima.' });
  }
});

app.get('/multiple', async (req, res) => {
  const { cities } = req.query;
  if (!cities) return res.status(400).json({ error: 'Informe pelo menos uma cidade.' });

  const cityList = cities.split(',');
  const results = [];

  try {
    for (let city of cityList) {
      const data = await getWeather(city.trim());
      results.push({
        city: city.trim(),
        temperature: data.main?.temp ?? 0,
        weather: data.weather?.[0]?.description ?? 'Desconhecido'
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar API para múltiplas cidades.' });
  }
});


app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));