export default function calculateOffer(offerPercent, price /*, positionalB, named*/) {
  return parseFloat(price - (offerPercent / 100) * price).toFixed(2);
}
