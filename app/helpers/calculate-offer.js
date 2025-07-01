export default function calculateOffer(offerPercent, price /*, positionalB, named*/) {
  return price - (offerPercent / 100) * price;
}
