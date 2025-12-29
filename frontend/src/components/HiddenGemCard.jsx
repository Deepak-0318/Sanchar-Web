import thumb from "../assets/thumb-placeholder.JPG";

export default function HiddenGemCard({ place }) {
  return (
    <div className="gem-card">
      <img src={place.thumb || thumb} alt="thumb" className="gem-thumb" />
      <h3>{place.place_name}</h3>
      <p className="area">{place.area}</p>

      <p className="famous-for">{place.famous_for}</p>

      <div className="meta">
        <span>📍 {place.distance_km} km</span>
        <span>⭐ Hidden Gem</span>
      </div>
    </div>
  );
}
