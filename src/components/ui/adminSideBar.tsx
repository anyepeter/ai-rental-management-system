
'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { GrDashboard } from 'react-icons/gr';
import { BiComment } from 'react-icons/bi';
import { Book } from 'lucide-react';
import { AiFillAlert } from 'react-icons/ai';
import { RxDropdownMenu } from 'react-icons/rx';

const AdminSideBar = () => {

  const [toggleDropdown, setToggleDropdown] = useState(false);

  const pathname = usePathname();

  
  return (
    <div 
    className="bg-[#0D1431] w-full z-[10] sm:h-screen text-white   pb-4"
    >
      <div className='sm:hidden flex justify-between items-center pl-2 pr-2'>
      <p onClick={() => setToggleDropdown((prev) => !prev)} >Open Dashboard Navigation</p>
      <RxDropdownMenu onClick={() => setToggleDropdown((prev) => !prev)} /> 
      </div>

      {toggleDropdown && (

      <div className='flex gap-2 mt-8 flex-col w-full  sm:hidden'>
        <ul className='border-t-[1px] w-full border-gray-400 flex flex-col gap-1 pt-4 pb-4'>
          <li className='w-full flex'>
            <Link href="/admin" onClick={() => setToggleDropdown((prev) => !prev)} className={`w-full p-4 flex gap-4  ${ pathname === '/admin' ? 'bg-[#21338e]' : '' } `}> <GrDashboard /> <span>Dashboard</span> </Link>
          </li>
        </ul>
      </div>

      )}

<div className='sm:flex gap-2 flex-col w-full hidden'>
        <ul className='border-t-[1px] w-full text-white border-gray-400 flex flex-col gap-1 pt-4 pb-4'>
          <li className='w-full flex'>
            <Link href="/admin" className={`w-full p-4 flex gap-4 items-center justify-center md:justify-start ${pathname === '/admin' ? 'bg-[#21338e]' : ''} `} > <GrDashboard className='text-[2rem] md:text-[1.6rem] '/> <span className='hidden md:block'>Dashboard</span> </Link>
          </li>



        </ul>
      </div>
       </div>
  )
}

export default AdminSideBar