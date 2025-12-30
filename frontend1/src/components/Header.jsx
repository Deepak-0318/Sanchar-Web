import "./../styles/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          Sanchar<span>AI</span>
        </div>

        {/* Actions */}
        <nav className="nav-actions">
          <button className="nav-btn ghost">Login</button>
          <button className="nav-btn primary">Sign Up</button>
        </nav>
      </div>
    </header>
  );
}
