/* eslint-disable @next/next/no-img-element */
"use client";

import UserBadge from "@/components/UserBadge";
import React from "react";
import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

const NavBar = () => {

  const {data: session, status} = useSession();
  
  
  if (status === "authenticated") { 

    const user = session.user;

    return (
      <div className="navbar bg-base-100 sticky top-0 z-50">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost text-xl">
          <img src="/img/512.png" width={32} height={32} alt="logo" /> 
          <span className="hidden md:inline">Fruit Finder</span>
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary className="py-1">
                <UserBadge />
              </summary>
              <ul className="p-2 bg-base-100 rounded-t-none min-w-40 end-0">
                <li>
                {user ? (
                    <Link href="/api/auth/signout">Sign Out</Link>
                  ) : (
                    <Link href="/">Sign In</Link>
                  )}
                </li>
                <li>
                  {user ? (
                    <Link href="/UserProfile">Profile Page</Link>
                  ) : (
                    <Link href="/Register">Register</Link>
                  )}
                </li>
                <li>
                  <a href="/fruits">View Fruit Map</a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
    )
  } else {
    return (
      <div className="navbar bg-base-100">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost text-xl">
          Fruit Finder
        </a>
      </div>
      <div className="flex-none">
        {/*CHANGE THIS TO BE SIGN IN IF USER ISN'T AUTHENTICATED!*/}
        <Link href="/api/auth/signin">Sign In</Link>  
      </div>
    </div>
    )
  }
};

export default NavBar;
