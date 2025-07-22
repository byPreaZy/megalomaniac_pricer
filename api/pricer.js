const fetch = require('node-fetch');

function extractNotables(itemText) {
  const lines = itemText.split('\n');
  return lines.filter(line => line.startsWith('Allocates ')).map(line =>
    line.replace('Allocates ', '').replace(' if you have matching modifiers on Forbidden Flesh and Forbidden Flame', '')
  );
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');
  const { itemText } = req.body;

  if (!itemText) return res.status(400).json({ error: 'Texte requis' });

  const notables = extractNotables(itemText);
  if (notables.length === 0) return res.status(400).json({ error: 'Aucun notable détecté.' });

  const query = {
    query: {
      name: "Megalomaniac",
      type: "Medium Cluster Jewel",
      stats: notables.map(n => ({ type: "and", value: n }))
    },
    sort: { price: "asc" }
  };

  try {
    const response = await fetch('https://www.pathofexile.com/api/trade/search/Ancestor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    const json = await response.json();
    const ids = json.result.slice(0, 5);

    const listings = await fetch(`https://www.pathofexile.com/api/trade/fetch/${ids.join(',')}?query=${json.id}`);
    const listingsJson = await listings.json();

    const results = listingsJson.result.map(item => ({
      price: item.listing.price.amount + ' ' + item.listing.price.currency,
      notables,
      url: 'https://www.pathofexile.com/trade/search/Ancestor/' + json.id
    }));

    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Erreur d\'appel à l\'API PoE' });
  }
};
