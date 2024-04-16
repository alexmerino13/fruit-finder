import Link from 'next/link';
import React from 'react';
import './globals.css';

const NavBar = () => {
  return (
    <div className="navbar bg-base-100">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl">Fruit Finder</a>
  </div>
  <div className="flex-none">
    <ul className="menu menu-horizontal px-1">
      <li><a>Log In</a></li>
      <li>
        <details>
          <summary>
            Menu
          </summary>
          <ul className="p-2 bg-base-100 rounded-t-none">
            <li><a>Add New</a></li>
            <li><a>Sign Up</a></li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</div>
  )
}

export default NavBar
