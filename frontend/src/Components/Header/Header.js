import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classes from './header.module.css';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
  const { cart } = useCart();

  const toggleDropDown = () => {
    setIsDropdownVisible((visible) => !visible);
  };

  const toggleUserDropDown = () => {
    setIsUserDropdownVisible((visible) => !visible);
  };

  // Close dropdown on window resize to fix stuck open menu on mobile
  useEffect(() => {
    const closeDropdown = () => setIsDropdownVisible(false);
    window.addEventListener('resize', closeDropdown);
    return () => window.removeEventListener('resize', closeDropdown);
  }, []);

  return (
    <header className={classes.header}>
      <div className={classes.headerContainer}>
        <Link to="/DesignsPage" className={classes.logo}>
          <div className={classes.logo1}>
            <img className={classes.image} src={'/foods/CakeLogo.png'} alt="MD Cakes" />
            <p className={classes.title}>Cakes</p>
          </div>
        </Link>

        <button className={classes.mobileMenuButton} onClick={toggleDropDown}>
          ☰
        </button>

        <nav className={`${classes.mainMenu} ${isDropdownVisible ? classes.show : ''}`}>
          <ul>
            <li><Link to="/HomePage">Home</Link></li>
            <li><Link to="/DesignsPage">Designs</Link></li>
            <li><Link to="/cart">Shop</Link></li>
            <li><Link to="/ContactsPage">Contact</Link></li>
            <li><Link to="/CustomPage">Custom</Link></li>
            <li>
              {user ? (
                <div className={classes.menu_container}>
                  <span className={classes.userName} onClick={toggleUserDropDown}>
                    {user.name}
                  </span>
                  {isUserDropdownVisible && (
                    <div className={classes.menu}>
                      <Link to="/profile" onClick={() => setIsUserDropdownVisible(false)}>Profile</Link>
                      <Link to="/orders" onClick={() => setIsUserDropdownVisible(false)}>Orders</Link>
                      <Link onClick={() => { logout(); setIsUserDropdownVisible(false); }}>Logout</Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </li>
            <li>
              <Link to="/cart" className={classes.cartLink}>
                Cart
                {cart.totalCount > 0 && (
                  <span className={classes.cart_count}>{cart.totalCount}</span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
