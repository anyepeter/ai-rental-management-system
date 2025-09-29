// @ts-nocheck
"use client";
import GoogleMap from "@/components/googleMap";
import Navbar from "@/components/navbar";
import SearchForm from "@/components/searchForm";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { MdAccountCircle } from "react-icons/md";
import { CalendarClock, MapPin, StarIcon } from "lucide-react";
import Footer from "@/components/footer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Link from "next/link";
import AiFeature from "@/components/ai";
import { useUser } from "@clerk/nextjs";


export default function Home() {

    const { filterResults } = useSelector((state: any) => state.property);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null)
    const { user } = useUser()

    useEffect(() => {
        if (filterResults.length > 0) {
            setIsLoading(false)
        }
    }, [filterResults])

    const handleUserClick = (user: any) => {
        setSelectedUser(user)
    }
    return (
        <section className="w-full flex-col  min-h-screen  items-center justify-between pt-26">
            <Navbar />

            <main className="w-full  mt-[80px]">
                <div className=" lg:fixed  h-[80vh] lg:w-[50%] lg:h-[92vh] lg:top-[80px]">
                    <GoogleMap items={filterResults} />
                </div>
                <div className=" lg:w-[50%] lg:float-right md:p-4">
                    <div className=" flex justify-center p-2 pt-6 pb-8 md:p-4 md:pt-8 md:pb-12 items-center bg-[#F5F5F5] ">
                        <SearchForm />
                    </div>

                    <div className="w-full flex flex-col items-center justify-center pt-12">
                        <h2 className="text-xl text-customBlack" >Results({filterResults.length})</h2>

                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center p-10 md:p-5">
                            {
                                filterResults.length > 0 ? (

                                    filterResults.map((property: any) => {
                                        return (
                                            <div key={property.id} className="w-full flex justify-center items-center overflow-hidden shadow-xl mb-20 md:shadow-2xl">
                                                <div className="flex flex-col gap-2 items-center justify-center w-full max-w-[450px] transition-transform duration-300 hover:scale-105 shadow-lg ">
                                                    <div>
                                                        <div className="relative w-full h-full bg-black bg-opacity-50">

                                                            <Carousel className="w-full">
                                                                <CarouselContent>
                                                                    {property.images.map((image: any, index: number) => (
                                                                        <CarouselItem key={index}>
                                                                            <div className="relative w-full h-[300px]">
                                                                                <img src={image} className="brightness-75 w-full h-full" alt="imageojck" />
                                                                                <div className="absolute inset-0 bg-black opacity-20"></div>
                                                                            </div>
                                                                        </CarouselItem>
                                                                    ))}
                                                                </CarouselContent>
                                                                <CarouselPrevious className="left-3 bg-slate hover:bg-white" />
                                                                <CarouselNext className="right-3 bg-slate  hover:bg-white" />
                                                            </Carousel>
                                                            <h1 className="absolute top-3 right-3 p-2 bg-customBlack rounded text-secondaryColor">{property.category.name.charAt(0).toUpperCase() + property.category.name.slice(1)}</h1>
                                                            <h1 className="absolute bottom-3 left-3 p-2 text-primaryColor text-2xl">{property.price} CFA</h1>
                                                            <p className="absolute bottom-3 right-3 p-2 text-white text-2xl"><StarIcon /></p>
                                                        </div>
                                                        <div className="flex w-full flex-col gap-2 items-center justify-center">
                                                            <div className="flex flex-col p-2 gap-1 w-full "  onClick={() => window.location.href = `/property/${property.id}`}>
                                                                <Link href={`/property/${property.id}`} className="font-comfortaa text-customBlack hover:text-primaryColor cursor-pointer hover:transition-colors hover:duration-300 transition-colors duration-300 text-2xl md:text-3xl">{property.title.charAt(0).toUpperCase() + property.title.slice(1)}</Link>
                                                                <div className="flex gap-2 items-center">
                                                                    <MapPin className="text-primaryColor w-4 h-4" />
                                                                    <p className="font-muli text-customGrey">{property.address}</p>
                                                                </div>

                                                            </div>
                                                            <div className="w-full">
                                                                {
                                                                    property.category.name === 'apartment' ? (<ul className="flex bg-secondaryColor items-end p-4 justify-evenly w-full ">
                                                                        <li>
                                                                            <p>{property.bedrooms}</p>
                                                                            <p className="text-customGrey text-sm mt-2" >Bedroom</p>
                                                                        </li>
                                                                        <li>
                                                                            <p>{property.bathrooms}</p>
                                                                            <p className="text-customGrey text-sm mt-2">Bathroom</p>
                                                                        </li>
                                                                        <li>
                                                                            <p>{property.hasStorage ? 'Yes' : 'No'}</p>
                                                                            <p className="text-customGrey text-sm mt-2">Storage</p>
                                                                        </li>

                                                                        <li>
                                                                            <p className="text-primaryColor text-sm">More+</p>
                                                                        </li>
                                                                    </ul>) : (<div></div>)
                                                                }
                                                            </div>

                                                            <div className="flex p-4  gap-2 items-center justify-between w-full">
                                                                <div className="flex items-center gap-2">
                                                                {
                    user ? (
                      <img
                      className="w-8 h-8 bg-black rounded-full object-cover"
                      src={property.user.image} // Replace with your profile image path
                      alt="Profile"
                      onClick={() => handleUserClick(property.user)}
                  />
                    ) : (<p><MdAccountCircle size={28} className="text-primaryColor" /></p>)
                  }                                                                     <p className="text-customGrey text-sm">{property.user.firstName}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2" >
                                                                    <p><CalendarClock className="text-primaryColor" /></p>
                                                                    <p className="text-customGrey text-sm">{new Date(property.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })) : (
                                    <div className="flex items-center justify-center mt-8 mb-20 w-full">
                                        <div ></div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </main>
            {selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">User Information</h2>
          <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong>  <a href={`https://wa.me/${parseInt(selectedUser.phone.slice(1))}`} className="text-primaryColor" target="_blank">Chat via whatApp</a></p>
          <button 
            onClick={() => setSelectedUser(null)}
            className="mt-4 bg-primaryColor text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    )}
            <AiFeature />
        </section>
    );
}
