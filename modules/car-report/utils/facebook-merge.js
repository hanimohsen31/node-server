// =========================
// Helpers
// =========================
function mergeFacebookResults(results, minPriceLimit, maxPriceLimit) {
  const seenListings = new Set()
  const seenFiltered = new Set()
  const listings = []
  const filterdData = []

  for (const r of results) {
    for (const item of r.listings || []) {
      if (!seenListings.has(item.listingId)) {
        seenListings.add(item.listingId)
        listings.push(item)
      }
    }
    for (const item of r.filterdData || []) {
      if (!seenFiltered.has(item.listingId)) {
        seenFiltered.add(item.listingId)
        filterdData.push(item)
      }
    }
  }

  const allPrices = filterdData.map((x) => x.price).filter((p) => !isNaN(p))
  const minPrice = allPrices.length ? Math.min(...allPrices) : NaN
  const maxPrice = allPrices.length ? Math.max(...allPrices) : NaN

  const overAllPrices = listings.map((x) => x.price).filter((p) => typeof p === 'number' && !isNaN(p))
  const overAllMinPrice = overAllPrices.length ? Math.min(...overAllPrices) : NaN
  const overAllMaxPrice = overAllPrices.length ? Math.max(...overAllPrices) : NaN

  return {
    location: results[0].location,
    carModel: results.map((r) => r.carModel),
    urls: results.map((r) => r.url),
    count: listings.length,
    listings,
    filterdData,
    filterdDataCount: filterdData.length,
    minPrice,
    maxPrice,
    overAllMinPrice,
    overAllMaxPrice,
  }
}

module.exports = mergeFacebookResults