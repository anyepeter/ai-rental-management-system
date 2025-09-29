'use client'
// import { getUser } from "@/actions/actions";
// import { addUser } from "@/app/globalRedux/site/siteSlice";
import { UserButton, useUser } from "@clerk/clerk-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const Nav = () => {

  const { user } = useUser();
  const dispatch = useDispatch()


  return (
    <nav className='w-full flex justify-center z-[100] bg-slate-200 h-20 items-center  top-0 left-0 fixed'>
      <div className="w-full  bg-customBlack h-20 bg-dark flex justify-between items-center gap-2 sm:pl-4 pl-4 sm:pr-4 pr-4">
        <div><Link href="/" ><Image src="/images/logo.png" width={80} height={80} alt="Float UI logo" /></Link></div>
        <div>
          <ul className='flex justify-between gap-4 items-center font-Muli'>
            <li className='self-start mt-2 text-white'><p>Welcome <span>{user?.firstName}</span></p></li>
            <li>
              <UserButton />
            </li>

          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Nav



