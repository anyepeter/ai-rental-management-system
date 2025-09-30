// @ts-nocheck
"use client"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { getAllProperties, getUserById } from '@/actions/actions'
import { useDispatch, useSelector } from'react-redux'
import { addUser, fetchAllProperty } from '@/app/globalRedux/property/propertySlice'


export default () => {
    const pathname = usePathname()
    const router = useRouter()
    const [state, setState] = useState(false)
    const navRef = useRef<HTMLElement>(null)
    const dispatch = useDispatch()
    const { user } = useUser()

    const userId = user?.id; // or user?.email or user?.clerkUserId based on your setup

    // Replace javascript:void(0) path with your path
    const navigation = [
      { title: "single room", path: "/room" },
      { title: "studio", path: "/studio" },
      { title: "apartment", path: "/apartment" },
      { title: "About", path: "/about" },
      { title: "Contact", path: "/contact" },
    ];
  
    useEffect(() => {
      const fetchUser = async () => {
        if (!userId) {
          console.error('User ID is missing');
          return;
        }
  
        try {
          const userData = await getUserById(userId); // Assuming getUser expects an object with userId
          dispatch(addUser(userData));
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
  
      fetchUser();
    }, [userId, dispatch]);

    useEffect(() => {
        const fetchSites = async () => {
          try {
            const sitesData = await getAllProperties()
            dispatch(fetchAllProperty(sitesData))
          } catch (error) {
            console.error('Error fetching sites:', error)
          }
        }
      
        fetchSites()
      }, [dispatch])



    const handleDashboardClick = () => {
        if (user?.id === 'user_2lbYGMvlajh6IOEww2em1vbeLOP') {
            router.push('/admin')
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <nav ref={navRef} className="bg-white w-full  border-b-2 top-0 z-20 fixed ">
            <div className="items-center lg:h-[90px]  px-4 max-w-[1400px] mx-auto md:px-8 lg:flex">
                <div className="flex items-center justify-between py-3 lg:py-4 lg:block">
                    <a href="/">
                        <Image
                            src="/images/logo.png"
                            width={80}
                            height={80}
                            alt="Float UI logo"
                        />
                    </a>
                    <div className="lg:hidden">
                        <button className="text-gray-700 outline-none p-2 rounded-md focus:border-gray-400 focus:border"
                            onClick={() => setState(!state)}
                        >
                            {
                                state ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                )
                            }
                        </button>
                    </div>
                </div>
                <div className={`flex-1 justify-between flex-row-reverse items-center lg:overflow-visible lg:flex lg:pb-0 lg:pr-0 lg:h-auto ${state ? 'h-screen  pb-20 overflow-auto pr-4' : 'hidden'}`}>
                    <div>
                        <ul className="flex flex-col-reverse md:items-center space-x-0 lg:space-x-6 lg:flex-row">

                           

                            <SignedOut>
                            <li className="mt-4 lg:mt-0">
                                <a href="/sign-in" className="py-3 px-4 text-center border text-gray-600 hover:text-[#16C788] rounded-md block lg:inline lg:border-0">
                                    Login
                                </a>
                            </li>
                            <li className="mt-8 lg:mt-0">
                                <a href="/sign-up" className="py-3 px-4 text-center text-white bg-[#16C788] hover:bg-[#4bd5a4] rounded-md shadow block lg:inline">
                                    Sign Up
                                </a>
                            </li>
                            </SignedOut>
                            <SignedIn>
                            <li className="mt-4 lg:mt-0">
                                <button onClick={handleDashboardClick} className="py-3 px-4 text-center text-white bg-[#16C788] border text-gray-600 hover:text-gray-300 rounded-md block lg:inline lg:border-0">
                                    Dashboard
                                </button>
                            </li>
                                <UserButton />
                            </SignedIn>
                        </ul>
                    </div>
                    <div className="flex-1">
                        <ul className="justify-center items-center space-y-8 lg:flex lg:space-x-6 lg:space-y-0">
                            {
                                navigation.map((item, idx) => {
                                    return (
                                        <li key={idx} className={`${pathname === item.path ? 'text-[#16C788]' : 'text-gray-600 hover:text-[#16C788]'
                                            }`}>
                                            <Link href={item.path}>
                                                {item.title}
                                            </Link>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}
