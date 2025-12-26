export default function HiddenGemCard({ place }) {
  return (
    <div className="gem-card">
      <h3>{place.place_name}</h3>
      <p className="area">{place.area}</p>

      <p className="famous-for">
        {place.famous_for}
      </p>

      <div className="meta">
        <span>📍 {place.distance_km} km</span>
        <span>⭐ Hidden Gem</span>
      </div>
    </div>
  );
}
