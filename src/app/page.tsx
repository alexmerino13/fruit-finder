'use client';
import Image from 'next/image';
import locationImg from '../../public/img/location_icon.png';
import searchImg from '../../public/img/search_icon.png';
import treeImg from '../../public/img/tree_icon.png';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div className="hero min-h-screen bg-base-200 bg-[url('../../public/img/hero_oranges.jpg')]">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="mb-5 text-5xl font-bold text-base-100 dark:text-white mix-blend-difference">
              Welcome to Fruit Finder
            </h1>
            <Link href="/fruits" className="btn btn-wide bg-white">
              Explore nearby fruit trees{' '}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#efb61c] p-4">
        <h2 className="text-center text-2xl font-semibold pt-10 mb-8">
          How to get started
        </h2>
        <div className="flex justify-center pb-10">
          {/*Card 1*/}
          <div className="card w-96 bg-base-100 shadow-xl mr-5">
            <figure className="px-10 pt-10">
              <Image src={locationImg} alt="Map Icon" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Step 1</h2>
              <p>Allow us to use your location to find nearby fruit trees.</p>
            </div>
          </div>

          {/*Card 2*/}
          <div className="card w-96 bg-base-100 shadow-xl mr-5">
            <figure className="px-10 pt-10">
              <Image src={searchImg} alt="Search Icon" className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Step 2</h2>
              <p>Explore trees in your area, or search for others by city and state. You can even filter by your favorite fruit type.</p>
            </div>
          </div>
          

          {/*Card 3*/}
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <Image
                src={treeImg}
                alt="Apple Tree Icon"
                className="rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Step 3</h2>
              <p>Pick out a tree to visit and then leave a review!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
