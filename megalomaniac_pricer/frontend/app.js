document.getElementById("searchButton").addEventListener("click", async () => {
  const itemText = document.getElementById("itemInput").value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "Recherche en cours...";

  try {
    const res = await fetch("/api/pricer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemText })
    });
    const data = await res.json();

    if (!data || !data.results || data.results.length === 0) {
      resultsDiv.innerHTML = `<p class="text-red-500">Aucune correspondance trouvée.</p>`;
      return;
    }

    resultsDiv.innerHTML = data.results.map(result => `
      <div class="border rounded p-4 mb-4 shadow">
        <p><strong>Prix :</strong> ${result.price}</p>
        <p><strong>Notables :</strong> ${result.notables.join(', ')}</p>
        <a href="${result.url}" target="_blank" class="text-blue-600 underline">Voir sur le site</a>
      </div>
    `).join('');
  } catch (e) {
    resultsDiv.innerHTML = `<p class="text-red-500">Erreur lors de la recherche.</p>`;
  }
});
